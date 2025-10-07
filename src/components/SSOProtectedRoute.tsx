import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSSOAuth } from '../hooks/useSSOAuth';

interface SSOProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const SSOProtectedRoute: React.FC<SSOProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/login' 
}) => {
  const { isAuthenticated, loading } = useSSOAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
