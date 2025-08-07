import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/services/userService';
import { useUser } from '@/contexts/UserContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useUser() as any;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session?.user) {
          // Check if user profile exists
          let userProfile = await UserService.getCurrentUserProfile();
          
          if (!userProfile) {
            // Create profile for Google OAuth users
            // Wait a moment for the trigger to potentially create it
            await new Promise(resolve => setTimeout(resolve, 1000));
            userProfile = await UserService.getCurrentUserProfile();
          }

          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);
            
            // Redirect based on user type
            if (userProfile.user_type === 'seller') {
              navigate('/seller-dashboard');
            } else {
              navigate('/');
            }
          } else {
            // If no profile exists, redirect to complete registration
            navigate('/complete-profile');
          }
        } else {
          // No session, redirect to login
          navigate('/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/signin'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, setUser, setIsAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 to-matcha-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing Sign In...</h2>
          <p className="text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 to-matcha-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
