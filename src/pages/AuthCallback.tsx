import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/services/userService';
import { SellerService } from '@/services/sellerService';
import { useUser } from '@/contexts/UserContext';
import { validateSellerProfile, getMissingFieldsSummary } from '@/utils/sellerProfileValidation';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUserData } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 AuthCallback: Starting callback processing...');
        console.log('📍 Current URL:', window.location.href);
        console.log('🔗 Hash:', window.location.hash);

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

              // If user signed up as seller via OAuth, update their profile type
              if (storedOAuthUserType === 'seller' && userProfile.user_type !== 'seller') {
                console.log('🔄 Updating OAuth user type from buyer to seller...');
                try {
                  await UserService.updateUserProfile(userProfile.id, {
                    user_type: 'seller'
                  });
                  // Update the local userProfile object to reflect the change
                  userProfile = { ...userProfile, user_type: 'seller' };
                  console.log('✅ Successfully updated user type to seller');

                  // Refresh user data in UserContext to reflect the change
                  try {
                    await refreshUserData();
                    console.log('✅ User data refreshed after type update');
                  } catch (refreshError) {
                    console.warn('⚠️ Failed to refresh user data after type update:', refreshError);
                  }
                } catch (error) {
                  console.error('❌ Failed to update user type to seller:', error);
                }
              }
            }

            // Check if user needs to complete basic profile
            const needsProfileCompletion = !userProfile.name || !userProfile.phone || !userProfile.user_type;

            // For sellers, check if they have a complete seller profile in the database
            if (userProfile.user_type === 'seller') {
              try {
                const sellerProfile = await SellerService.getSellerById(userProfile.id);
                const validationResult = validateSellerProfile(sellerProfile);

                // If basic profile is incomplete OR seller profile is incomplete, redirect to complete profile
                if (!validationResult.isComplete || needsProfileCompletion) {
                  const missingFieldsSummary = getMissingFieldsSummary(validationResult);
                  console.log('🔄 Seller profile incomplete, redirecting to complete profile...');
                  console.log('📋 Missing fields:', missingFieldsSummary);

                  // Store missing fields info in sessionStorage for the CompleteProfile component
                  if (validationResult.missingFieldsDetails.length > 0) {
                    sessionStorage.setItem('sellerProfileValidation', JSON.stringify(validationResult));
                  }

                  setLoading(false);
                  navigate('/complete-profile');
                  return;
                } else {
                  console.log('✅ Seller profile is complete, will redirect to dashboard');
                  console.log('🎉 Streamlined sign-in: Skipping profile completion for returning seller');
                }
              } catch (error) {
                console.log('ℹ️ Error checking seller profile, redirecting to complete profile:', error);
                setLoading(false);
                navigate('/complete-profile');
                return;
              }
            } else if (needsProfileCompletion) {
              // For buyers, just check basic profile completion
              console.log('👤 User needs to complete profile, redirecting...');
              navigate('/complete-profile');
              return;
            }

            // Redirect to stored returnTo URL if available, otherwise redirect based on user type
            if (storedReturnTo) {
              navigate(decodeURIComponent(storedReturnTo));
            } else {
              // Redirect sellers to seller dashboard, buyers to app
              if (userProfile.user_type === 'seller') {
                navigate('/seller-dashboard');
              } else {
                navigate('/app');
              }
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
