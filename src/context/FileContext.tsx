import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import supabase from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { FileItem, FileFilter, SortOption } from '@/lib/types';

type FileContextType = {
  files: FileItem[];
  loading: boolean;
  selectedFiles: string[];
  filter: FileFilter;
  fetchFiles: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  deleteFiles: (fileIds: string[]) => Promise<void>;
  downloadFile: (file: FileItem) => Promise<void>;
  shareFile: (fileId: string) => Promise<string>;
  getFileByShareId: (shareId: string) => Promise<FileItem | null>;
  addSharedFileToMyFiles: (fileId: string) => Promise<void>;
  toggleSelectFile: (fileId: string) => void;
  selectAllFiles: () => void;
  clearSelectedFiles: () => void;
  setFilter: (filter: Partial<FileFilter>) => void;
};

const defaultSort: SortOption = { field: 'created_at', direction: 'desc' };

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filter, setFilterState] = useState<FileFilter>({
    search: '',
    sort: defaultSort,
  });

  const fetchFiles = async () => {

    if (!user) {
      setFiles([]);
      return;
    }
    
    try {
      setLoading(true);
      console.log("Fetching files for user:", user.id);
      
      try {
        // First check if the 'files' bucket exists
        const { data: bucketData, error: bucketError } = await supabase
          .storage
          .getBucket('files');
          
        if (bucketError) {
          console.log("Bucket error:", bucketError);
          if (bucketError.message.includes("does not exist")) {
            toast.error("Storage is not properly configured");
            setFiles([]);
            setLoading(false);
            return;
          }
        }
        
        console.log("Bucket exists:", bucketData);
      } catch (bucketError) {
        console.error("Error checking bucket:", bucketError);
      }
      
      // Try to list files for this user
      const { data: filesList, error: listError } = await supabase
        .storage
        .from('files')
        .list(user.id);
      
      if (listError) {
        // If error is "not found", it likely means the user folder doesn't exist yet
        console.log("List error:", listError);
        if (listError.message.includes("not found")) {
          console.log("User folder does not exist yet");
          // This is fine for new users
          setFiles([]);
          setLoading(false);
          return;
        } else {
          // Other errors should be shown to the user
          toast.error(`Error loading files: ${listError.message}`);
          setFiles([]);
          setLoading(false);
          return;
        }
      }
      
      // If no files, just return empty array
      if (!filesList || filesList.length === 0) {
        console.log("No files found for user");
        setFiles([]);
        setLoading(false);
        return;
      }
      
      console.log("Files found:", filesList);
      
      // Get the URLs for each file
      const filesWithUrls = await Promise.all(
        filesList.map(async (file) => {
          const path = `${user.id}/${file.name}`;
          try {
            const { data: urlData, error: urlError } = await supabase
              .storage
              .from('files')
              .createSignedUrl(path, 60 * 60); // 1 hour expiry
              
            if (urlError) {
              console.error("URL creation error for file:", file.name, urlError);
              return null;
            }

            return {
              id: file.id,
              name: file.name,
              size: file.metadata?.size || 0,
              type: file.metadata?.mimetype || 'application/octet-stream',
              created_at: file.created_at,
              path: path,
              url: urlData?.signedUrl || '',
              user_id: user.id,
              metadata: file.metadata
            } as FileItem;
          } catch (error) {
            console.error("Error processing file:", file.name, error);
            return null;
          }
        })
      );

      // Filter out any null results from errors
      const validFiles = filesWithUrls.filter(file => file !== null) as FileItem[];
      
      // Apply search filter if present
      const filteredFiles = filter.search 
        ? validFiles.filter(file => 
            file.name.toLowerCase().includes(filter.search.toLowerCase())
          )
        : validFiles;

      // Apply sorting
      const sortedFiles = [...filteredFiles].sort((a, b) => {
        const { field, direction } = filter.sort;
        
        if (field === 'name') {
          return direction === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (field === 'size') {
          return direction === 'asc' 
            ? a.size - b.size
            : b.size - a.size;
        } else {
          // Default to created_at
          return direction === 'asc' 
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });

      console.log("Processed files:", sortedFiles.length);
      setFiles(sortedFiles);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch files');
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) return;
    
    // Check file size (3MB limit)
    const MAX_SIZE = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds the 3MB limit');
      return;
    }

    try {
      setLoading(true);
      
      const filePath = `${user.id}/${file.name}`;
      
      const { error } = await supabase
        .storage
        .from('files')
        .upload(filePath, file);
      
      if (error) throw error;
      
      toast.success('File uploaded successfully');
      await fetchFiles(); // Refresh the file list
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFiles = async (fileIds: string[]) => {
    if (!user || fileIds.length === 0) return;
    
    try {
      setLoading(true);
      
      // Get paths for all files to delete
      const filesToDelete = files.filter(file => fileIds.includes(file.id));
      const filePaths = filesToDelete.map(file => file.path);
      
      const { error } = await supabase
        .storage
        .from('files')
        .remove(filePaths);
      
      if (error) throw error;
      
      toast.success(`${fileIds.length} file(s) deleted successfully`);
      setSelectedFiles([]);
      await fetchFiles(); // Refresh the file list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete files');
      console.error('Error deleting files:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file: FileItem) => {
    try {
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      toast.error(error.message || 'Failed to download file');
      console.error('Error downloading file:', error);
    }
  };

  const shareFile = async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');
      
      // Generate a shareable link using the public URL
      const { data } = await supabase
        .storage
        .from('files')
        .createSignedUrl(file.path, 60 * 60 * 24 * 7); // 7 days expiry
      
      if (!data?.signedUrl) throw new Error('Failed to create shareable link');
      
      // Convert the storage URL to a frontend share URL
      const shareUrl = `${window.location.origin}/share/${encodeURIComponent(file.path)}`;
      
      // Save the association in a shares table for tracking
      await supabase
        .from('shares')
        .upsert({
          file_path: file.path,
          created_at: new Date().toISOString(),
          file_id: fileId,
          created_by: user?.id
        });
      
      return shareUrl;
    } catch (error: any) {
      toast.error(error.message || 'Failed to share file');
      console.error('Error sharing file:', error);
      return '';
    }
  };

  const getFileByShareId = async (sharePath: string): Promise<FileItem | null> => {
    try {
      // Decode the path
      const filePath = decodeURIComponent(sharePath);
      
      // Get the file metadata
      const { data: fileData } = await supabase
        .storage
        .from('files')
        .getPublicUrl(filePath);
      
      // Get original file metadata from the shares table
      const { data: shareData, error: shareError } = await supabase
        .from('shares')
        .select('*')
        .eq('file_path', filePath)
        .single();
      
      if (shareError) throw shareError;
      
      // Create signed URL for temporary access
      const { data: urlData } = await supabase
        .storage
        .from('files')
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
      
      const pathParts = filePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Construct file object
      const file: FileItem = {
        id: shareData.file_id || 'shared',
        name: fileName,
        size: 0, // We don't have this info from the public URL
        type: '', // We don't have this info from the public URL
        created_at: shareData.created_at,
        url: urlData?.signedUrl || fileData.publicUrl,
        path: filePath,
        user_id: shareData.created_by
      };
      
      return file;
    } catch (error) {
      console.error('Error getting shared file:', error);
      return null;
    }
  };

  const addSharedFileToMyFiles = async (fileId: string) => {
    if (!user) return;
    
    try {
      // Find the shared file
      const { data: shareData, error: shareError } = await supabase
        .from('shares')
        .select('*')
        .eq('file_id', fileId)
        .single();
      
      if (shareError) throw shareError;
      
      // Download the file first
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from('files')
        .download(shareData.file_path);
      
      if (fileError) throw fileError;
      
      // Extract the filename from the path
      const fileName = shareData.file_path.split('/').pop();
      
      // Create a new file object
      const file = new File([fileData], fileName || 'shared-file', {
        type: fileData.type
      });
      
      // Upload to the user's own directory
      await uploadFile(file);
      
      toast.success('File added to your files successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add file to your collection');
      console.error('Error adding shared file:', error);
    }
  };

  const toggleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const setFilter = (newFilter: Partial<FileFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  };

  return (
    <FileContext.Provider value={{
      files,
      loading,
      selectedFiles,
      filter,
      fetchFiles,
      uploadFile,
      deleteFiles,
      downloadFile,
      shareFile,
      getFileByShareId,
      addSharedFileToMyFiles,
      toggleSelectFile,
      selectAllFiles,
      clearSelectedFiles,
      setFilter
    }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
