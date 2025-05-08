
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // If still loading, show nothing or a loading indicator
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  // If not authenticated, redirect
  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  // If authenticated, render the children
  return children;
};

export default ProtectedRoute;
