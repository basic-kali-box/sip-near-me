import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireUserType?: 'buyer' | 'seller';
  fallbackPath?: string;
  showLoginPrompt?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireUserType,
  fallbackPath = '/signin',
  showLoginPrompt = true
}) => {
  const { user, isAuthenticated, isLoading } = useUser();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Checking your authentication status</p>
        </Card>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    if (showLoginPrompt) {
      return (
        <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to access this page. Please sign in to continue.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = `/signin?returnTo=${encodeURIComponent(location.pathname)}`}
                className="w-full bg-gradient-sunrise hover:shadow-glow transition-all duration-300"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = `/signup?returnTo=${encodeURIComponent(location.pathname)}`}
                className="w-full"
              >
                Create Account
              </Button>
              <Button 
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="w-full text-sm"
              >
                Go to Home
              </Button>
            </div>
          </Card>
        </div>
      );
    } else {
      // Redirect to sign in with return path
      return <Navigate to={`${fallbackPath}?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
    }
  }

  // Check if specific user type is required
  if (requireUserType && user?.userType !== requireUserType) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            This page is only available to {requireUserType}s.
          </p>
          <div className="text-xs text-muted-foreground mb-6">
            Current user type: {user?.userType || 'undefined'}
          </div>
          <div className="space-y-2">
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go Home
            </Button>
            {requireUserType === 'seller' && user?.userType === 'buyer' && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/complete-profile'}
                className="w-full"
              >
                Become a Seller
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
