import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/services/userService';
import { useUser } from '@/contexts/UserContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUserData } = useUser();
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
          // Get userType from URL params (from email confirmation)
          const userTypeParam = searchParams.get('userType') as 'buyer' | 'seller' | null;

          // Ensure user profile exists (will create if needed)
          console.log('🔍 Ensuring user profile exists for OAuth user...');
          let userProfile = await UserService.getCurrentUserProfile();

          if (!userProfile) {
            console.log('⚠️ No user profile found after OAuth, this should not happen');
            // Try to create profile manually
            try {
              userProfile = await UserService.ensureUserProfileExists(data.session.user.id);
            } catch (error) {
              console.error('❌ Failed to create user profile:', error);
            }
          }

          if (userProfile) {
            console.log('✅ User profile found, OAuth callback successful');

            // Refresh user data in UserContext to ensure proper authentication state
            try {
              await refreshUserData();
              console.log('✅ User data refreshed in context');
            } catch (refreshError) {
              console.warn('⚠️ Failed to refresh user data, continuing with navigation:', refreshError);
            }

            // Clear stored confirmation data
            localStorage.removeItem('pending_confirmation_email');
            localStorage.removeItem('pending_confirmation_userType');

            // Check for stored returnTo parameter from Google sign-in
            const storedReturnTo = localStorage.getItem('auth_returnTo');
            if (storedReturnTo) {
              localStorage.removeItem('auth_returnTo');
            }

            // Check for stored OAuth user type from signup
            const storedOAuthUserType = localStorage.getItem('pending_oauth_userType');
            if (storedOAuthUserType) {
              localStorage.removeItem('pending_oauth_userType');
            }

            // For new sellers coming from email confirmation, redirect to complete profile
            if (userProfile.user_type === 'seller' && userTypeParam === 'seller') {
              // Check if seller profile is complete
              const hasBusinessName = userProfile.businessName && userProfile.businessName.trim() !== '';
              if (!hasBusinessName) {
                navigate('/complete-profile');
                return;
              }
            }

            // Check if user needs to complete profile
            const needsProfileCompletion = !userProfile.name || !userProfile.phone || !userProfile.user_type;

            if (needsProfileCompletion || storedOAuthUserType) {
              console.log('👤 User needs to complete profile, redirecting...');
              navigate('/complete-profile');
              return;
            }

            // Redirect to stored returnTo URL if available, otherwise redirect to /app for all users
            if (storedReturnTo) {
              navigate(decodeURIComponent(storedReturnTo));
            } else {
              navigate('/app');
            }
          } else {
            // If no profile exists, redirect to complete registration
            navigate('/complete-profile');
          }
        } else {
          // No session, redirect to sign in with userType if available
          const userTypeParam = searchParams.get('userType');
          if (userTypeParam) {
            navigate(`/signin?userType=${userTypeParam}`);
          } else {
            navigate('/signin');
          }
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
  }, [navigate]);

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
