
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PasteLink = () => {
  const [linkValue, setLinkValue] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Try to extract file path from URL
      const url = new URL(linkValue);
      const path = url.pathname.split('/share/')[1];
      
      if (!path) {
        throw new Error('Invalid link format');
      }
      
      // Navigate to the share page with the file path
      navigate(`/share/${path}`);
    } catch (error) {
      toast.error('Invalid share link. Please check and try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Access shared files</CardTitle>
        <CardDescription>
          Paste a share link to view and download the file
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="relative">
            <Link size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Paste share link here..."
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700"
            disabled={!linkValue}
          >
            Access File
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PasteLink;
