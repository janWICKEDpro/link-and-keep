
import { useState } from 'react';
import { useFiles } from '@/context/FileContext';
import { FileItem } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { FileIcon, ImageIcon, FileTextIcon, FileVideoIcon, FileAudioIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const FileCard = ({ file }: { file: FileItem }) => {
  const { toggleSelectFile, selectedFiles, downloadFile, shareFile } = useFiles();
  const [copying, setCopying] = useState(false);
  const isSelected = selectedFiles.includes(file.id);

  const getFileIcon = () => {
    const type = file.type.split('/')[0];

    switch (type) {
      case 'image':
        return <ImageIcon className="h-16 w-16" />;
      case 'video':
        return <FileVideoIcon className="h-16 w-16" />;
      case 'audio':
        return <FileAudioIcon className="h-16 w-16" />;
      case 'text':
      case 'application':
        if (file.type.includes('pdf')) {
          return <FileTextIcon className="h-16 w-16" />;
        }
        return <FileTextIcon className="h-16 w-16" />;
      default:
        return <FileIcon className="h-16 w-16" />;
    }
  };

  const filePreview = () => {
    const type = file.type.split('/')[0];
    
    if (type === 'image') {
      return (
        <div className="h-32 flex items-center justify-center bg-muted rounded-t-lg overflow-hidden">
          <img src={file.url} alt={file.name} className="max-h-full max-w-full object-contain" />
        </div>
      );
    }
    
    return (
      <div className="h-32 flex items-center justify-center bg-muted rounded-t-lg">
        {getFileIcon()}
      </div>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleShareClick = async () => {
    setCopying(true);
    const shareUrl = await shareFile(file.id);
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopying(false);
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border transition-all duration-200 hover:shadow-md",
        isSelected ? "ring-2 ring-brand-400" : ""
      )}
    >
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelectFile(file.id)}
          className="bg-white border-gray-300"
        />
      </div>
      
      {filePreview()}
      
      <div className="p-3">
        <h3 className="font-medium text-sm truncate" title={file.name}>{file.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <Badge variant="outline" className="text-xs">
            {formatFileSize(file.size)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white text-gray-700"
            onClick={() => downloadFile(file)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span className="sr-only">Download</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white text-gray-700"
            onClick={handleShareClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

const FileGrid = () => {
  const { files, loading } = useFiles();
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-t-lg"></div>
            <div className="p-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="mt-2 h-3 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileIcon className="h-20 w-20 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">No files found</h3>
        <p className="text-muted-foreground">Upload your first file to get started</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
};

export default FileGrid;
