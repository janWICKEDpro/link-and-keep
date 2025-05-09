
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Share, Lock, Search } from 'lucide-react';

const Feature = ({ icon, title, description }: { icon: JSX.Element, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center p-6">
    <div className="p-4 bg-brand-100 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-600">Link & Keep</h1>
          <div className="space-x-4">
            <Button asChild variant="outline">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="bg-brand-600 hover:bg-brand-700">
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto py-16 px-4 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-600 to-purple-500 bg-clip-text text-transparent">
          Store & Share Your Files Securely
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Easily upload, organize, and share your important documents, photos, and more with our simple yet powerful file management system.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-brand-600 hover:bg-brand-700 text-lg">
            <Link to="/register">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Link & Keep?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform offers a simple, secure way to store and share your most important files.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Feature
            icon={<Upload className="h-8 w-8 text-brand-600" />}
            title="Easy Upload"
            description="Quickly upload your files with a simple drag-and-drop interface."
          />
          <Feature
            icon={<Share className="h-8 w-8 text-brand-600" />}
            title="Secure Sharing"
            description="Share files with anyone using secure, generated links."
          />
          <Feature
            icon={<Search className="h-8 w-8 text-brand-600" />}
            title="Quick Search"
            description="Find your files instantly with our powerful search feature."
          />
          <Feature
            icon={<Lock className="h-8 w-8 text-brand-600" />}
            title="Private & Secure"
            description="Your files are encrypted and only accessible to you and those you share with."
          />
        </div>
      </section>

      <footer className="bg-white border-t py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">© 2025 Link & Keep. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-brand-600">Terms</a>
              <a href="#" className="text-gray-600 hover:text-brand-600">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-brand-600">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
