
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFiles } from '@/context/FileContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileIcon, ImageIcon, FileTextIcon, FileVideoIcon, FileAudioIcon, Download, Plus } from 'lucide-react';
import { FileItem } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const SharePage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { getFileByShareId, downloadFile, addSharedFileToMyFiles } = useFiles();
  const { user } = useAuth();
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      if (!shareId) return;
      
      try {
        setLoading(true);
        const fileData = await getFileByShareId(shareId);
        setFile(fileData);
      } catch (error) {
        console.error('Error fetching shared file:', error);
        toast.error('Failed to load the shared file');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedFile();
  }, [shareId, getFileByShareId]);

  const handleSaveToMyFiles = async () => {
    if (!file) return;
    
    try {
      setSaving(true);
      await addSharedFileToMyFiles(file.id);
      toast.success('File saved to your collection');
    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FileIcon className="h-20 w-20" />;
    
    const type = file.type.split('/')[0];

    switch (type) {
      case 'image':
        return <ImageIcon className="h-20 w-20" />;
      case 'video':
        return <FileVideoIcon className="h-20 w-20" />;
      case 'audio':
        return <FileAudioIcon className="h-20 w-20" />;
      case 'text':
      case 'application':
        return <FileTextIcon className="h-20 w-20" />;
      default:
        return <FileIcon className="h-20 w-20" />;
    }
  };

  const filePreview = () => {
    if (!file) return null;
    
    const type = file.type.split('/')[0];
    
    if (type === 'image') {
      return (
        <div className="max-h-80 flex items-center justify-center bg-muted rounded-lg overflow-hidden mb-6">
          <img src={file.url} alt={file.name} className="max-h-full max-w-full object-contain" />
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-muted rounded-lg mb-6">
        {getFileIcon()}
        <h3 className="mt-4 text-xl font-medium">{file.name}</h3>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-lg p-6 animate-pulse">
          <div className="h-60 bg-muted rounded-lg mb-6"></div>
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="h-10 bg-muted rounded w-full"></div>
        </Card>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-lg p-6 text-center">
          <FileIcon className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">File Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The shared file may have expired or been removed.
          </p>
          <Button asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-lg">
        <Card className="w-full p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Shared File</h2>
            <p className="text-muted-foreground">
              This file was shared with you{' '}
              {file.created_at && formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
            </p>
          </div>

          {filePreview()}

          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="text-lg font-medium">{file.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="bg-brand-600 hover:bg-brand-700 flex-1"
                onClick={() => file && downloadFile(file)}
              >
                <Download size={18} className="mr-2" />
                Download File
              </Button>
              
              {user && (
                <Button
                  variant="outline"
                  onClick={handleSaveToMyFiles}
                  disabled={saving}
                  className="flex-1"
                >
                  <Plus size={18} className="mr-2" />
                  {saving ? 'Saving...' : 'Save to My Files'}
                </Button>
              )}
            </div>

            {!user && (
              <p className="text-sm text-center">
                <Link to="/login" className="text-brand-600 hover:underline">
                  Sign in
                </Link>{' '}
                or{' '}
                <Link to="/register" className="text-brand-600 hover:underline">
                  create an account
                </Link>{' '}
                to save this file to your collection.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SharePage;
