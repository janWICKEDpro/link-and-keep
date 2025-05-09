
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PublicRouteProps {
  children: JSX.Element;
  redirectTo?: string;
}

const PublicRoute = ({ 
  children, 
  redirectTo = '/dashboard' 
}: PublicRouteProps) => {
  const { user, loading } = useAuth();

  // If still loading, show a better loading animation
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  
  // If authenticated, redirect to specified route
  if (user) {
    return <Navigate to={redirectTo} />;
  }

  // If not authenticated, render the children
  return children;
};

export default PublicRoute;
