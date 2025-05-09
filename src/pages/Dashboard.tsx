
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileGrid from '@/components/FileGrid';
import FileDrop from '@/components/FileDrop';
import FileToolbar from '@/components/FileToolbar';
import PasteLink from '@/components/PasteLink';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { fetchFiles } = useFiles();

  useEffect(() => {
    if (user) {
      console.log("Dashboard mounted, fetching files for user:", user.id);
      fetchFiles().catch(err => console.error("Error fetching files:", err));
    }
  }, [user, fetchFiles]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-brand-600">Link & Keep</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 md:px-6">
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="files">My Files</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="shared">Access Shared Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="space-y-6">
            <FileToolbar />
            <FileGrid />
          </TabsContent>
          
          <TabsContent value="upload">
            <div className="max-w-xl mx-auto py-6">
              <FileDrop />
            </div>
          </TabsContent>
          
          <TabsContent value="shared">
            <div className="max-w-xl mx-auto py-6">
              <PasteLink />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
