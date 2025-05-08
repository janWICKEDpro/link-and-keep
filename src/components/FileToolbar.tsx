
import { useState } from 'react';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, TrashIcon, ArrowDownAZ, ArrowUpAZ, Clock, FileUp, FileDown } from 'lucide-react';
import { SortOption } from '@/lib/types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FileToolbar = () => {
  const { 
    files,
    selectedFiles,
    deleteFiles,
    selectAllFiles,
    clearSelectedFiles,
    filter,
    setFilter,
    fetchFiles
  } = useFiles();
  
  const [searchValue, setSearchValue] = useState(filter.search);
  const allSelected = files.length > 0 && selectedFiles.length === files.length;
  const someSelected = selectedFiles.length > 0;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ search: searchValue });
    fetchFiles();
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortOption['field'], SortOption['direction']];
    setFilter({ sort: { field, direction } });
    fetchFiles();
  };

  const getSortIcon = () => {
    const { field, direction } = filter.sort;
    
    if (field === 'name') {
      return direction === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />;
    } else if (field === 'created_at') {
      return <Clock size={16} />;
    } else if (field === 'size') {
      return direction === 'asc' ? <FileDown size={16} /> : <FileUp size={16} />;
    }
    
    return null;
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="selectAll"
          checked={allSelected}
          onCheckedChange={selectAllFiles}
        />
        <label htmlFor="selectAll" className="text-sm font-medium">
          Select all
        </label>
        
        {someSelected && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-9">
                <TrashIcon size={16} className="mr-1" />
                Delete {selectedFiles.length} selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the {selectedFiles.length} selected files.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={clearSelectedFiles}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteFiles(selectedFiles)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-3">
        <form onSubmit={handleSearch} className="relative">
          <Search size={18} className="absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 w-full md:w-60 lg:w-80"
          />
        </form>

        <div className="flex items-center space-x-1">
          <Select
            value={`${filter.sort.field}-${filter.sort.direction}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[160px] flex items-center">
              <span className="mr-2">{getSortIcon()}</span>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="created_at-desc">Date (Newest)</SelectItem>
              <SelectItem value="created_at-asc">Date (Oldest)</SelectItem>
              <SelectItem value="size-desc">Size (Largest)</SelectItem>
              <SelectItem value="size-asc">Size (Smallest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FileToolbar;
