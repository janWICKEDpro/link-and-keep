
export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  created_at: string;
  url: string;
  path: string;
  user_id: string;
  metadata?: Record<string, any>;
}

export interface SortOption {
  field: 'name' | 'created_at' | 'size';
  direction: 'asc' | 'desc';
}

export interface FileFilter {
  search: string;
  sort: SortOption;
}
