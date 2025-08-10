import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signUp, signIn, signOut, signInWithGoogle } from '@/lib/supabase';
import { UserService } from '@/services/userService';
import { SellerService } from '@/services/sellerService';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  userType: 'buyer' | 'seller';
  profileImage?: string;
  // Seller-specific fields
  businessName?: string;
  businessAddress?: string;
  businessHours?: string;
  specialty?: 'coffee' | 'matcha' | 'both';
  isOnline?: boolean;
  rating?: number;
  reviewCount?: number;
  // Buyer-specific fields
  favoriteSellerIds?: string[];
  orderHistory?: string[];
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, userType: 'buyer' | 'seller') => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  toggleSellerAvailability: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // LocalStorage keys
  const USER_ESSENTIALS_KEY = 'brewnear_user_essentials';

  // Helper: store only essential user data that doesn't change frequently
  const storeUserEssentials = (userData: any) => {
    try {
      const essentials = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        user_type: userData.user_type, // Critical for determining user permissions
        avatar_url: userData.avatar_url
      };
      localStorage.setItem(USER_ESSENTIALS_KEY, JSON.stringify(essentials));
      console.log('📋 User essentials stored in localStorage');
    } catch (error) {
      console.warn('⚠️ Error storing user essentials:', error);
    }
  };

  // Helper: get stored user essentials
  const getStoredUserEssentials = () => {
    try {
      const stored = localStorage.getItem(USER_ESSENTIALS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('⚠️ Error reading user essentials:', error);
      return null;
    }
  };

  // Helper: clear stored data
  const clearStoredData = () => {
    try {
      localStorage.removeItem(USER_ESSENTIALS_KEY);
      console.log('🗑️ Stored data cleared');
    } catch (error) {
      console.warn('⚠️ Error clearing stored data:', error);
    }
  };

  // Helper: load seller details in background (optional, for sellers only)
  const loadSellerDetailsInBackground = async (userId: string) => {
    try {
      console.log('🔍 Loading seller details in background...');
      const { data } = await supabase
        .from('sellers')
        .select('business_name, address, hours, specialty, is_available, rating_average, rating_count')
        .eq('id', userId)
        .maybeSingle();

      if (data && user && user.id === userId) {
        // Update user with seller details if still the same user
        setUser(prevUser => prevUser ? {
          ...prevUser,
          businessName: data.business_name,
          businessAddress: data.address,
          businessHours: data.hours,
          specialty: data.specialty,
          isOnline: data.is_available,
          rating: data.rating_average,
          reviewCount: data.rating_count,
        } : null);
        console.log('✅ Seller details loaded in background');
      }
    } catch (error) {
      console.warn('⚠️ Error loading seller details in background:', error);
    }
  };

  // Helper: get user data using stored essentials + fresh dynamic data
  const getUserData = async (inputUser: any): Promise<User> => {
    console.log('🔄 Getting user data for:', inputUser.id);

    // Try to get essential user data from localStorage first
    const storedEssentials = getStoredUserEssentials();
    if (storedEssentials && storedEssentials.id === inputUser.id) {
      console.log('📋 Using stored user essentials');
      // Use stored essentials for basic info, fetch dynamic data separately
      return await buildUserWithSellerDetails(storedEssentials);
    }

    // If no stored essentials, fetch from database and store essentials
    console.log('🔍 Fetching user data from database...');
    try {
      const userData = await UserService.getUserProfileById(inputUser.id);
      if (userData) {
        console.log('✅ User data found, storing essentials');
        storeUserEssentials(userData);
        return await buildUserWithSellerDetails(userData);
      }
    } catch (error) {
      console.warn('⚠️ Error fetching user data:', error);
    }

    // Fallback to input user data
    console.log('📝 Using input user data as fallback');
    const fallbackUser = {
      ...inputUser,
      user_type: inputUser.userType || inputUser.user_type || 'buyer'
    };
    return await buildUserWithSellerDetails(fallbackUser);
  };

  // Helper: build user object with seller details (fetch fresh dynamic data)
  const buildUserWithSellerDetails = async (userData: any): Promise<User> => {
    let sellerDetails: any = null;

    // Only fetch seller details if user is a seller
    if (userData.user_type === 'seller') {
      console.log('🔍 Fetching fresh seller details...');

      // Always fetch seller details fresh with timeout
      try {
        const sellerQuery = supabase
          .from('sellers')
          .select('business_name, address, hours, specialty, is_available, rating_average, rating_count')
          .eq('id', userData.id)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Seller details timeout')), 3000);
        });

        const { data } = await Promise.race([sellerQuery, timeoutPromise]) as any;

        if (data) {
          console.log('✅ Seller details found');
          sellerDetails = data;
        } else {
          console.log('📝 No seller profile found');
        }
      } catch (error) {
        console.warn('⚠️ Error fetching seller details (continuing without):', error);
        // Continue without seller details rather than failing
      }
    } else {
      console.log('👤 User is not a seller, skipping seller details fetch');
    }

    const userObject = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || '',
      userType: userData.user_type || 'buyer',
      profileImage: userData.avatar_url || undefined,
      businessName: sellerDetails?.business_name || undefined,
      businessAddress: sellerDetails?.address || undefined,
      businessHours: sellerDetails?.hours || undefined,
      specialty: sellerDetails?.specialty || undefined,
      isOnline: sellerDetails?.is_available || undefined,
      rating: sellerDetails?.rating_average || undefined,
      reviewCount: sellerDetails?.rating_count || undefined,
    };

    console.log('✅ User object built:', { id: userObject.id, name: userObject.name, userType: userObject.userType });
    return userObject;
  };

  // Load user from localStorage on app start (fast, no database calls)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // For logged-in users, get info from localStorage first (instant)
          const storedEssentials = getStoredUserEssentials();
          if (storedEssentials && storedEssentials.id === session.user.id) {
            console.log('📋 Using stored essentials for fast initialization');
            // Create user object directly from localStorage (no database calls)
            const appUser: User = {
              id: storedEssentials.id,
              email: storedEssentials.email,
              name: storedEssentials.name,
              phone: '', // Will be loaded later if needed
              userType: storedEssentials.user_type || 'buyer',
              profileImage: storedEssentials.avatar_url,
              // Seller details will be loaded in background if needed
            };
            setUser(appUser);
            setIsAuthenticated(true);
            console.log('✅ User set instantly from localStorage:', appUser.name);

            // Load seller details in background if user is a seller
            if (appUser.userType === 'seller') {
              loadSellerDetailsInBackground(appUser.id);
            }
          } else {
            // No stored data, user needs to login again
            console.log('📝 No stored essentials, user needs to login');
            setIsAuthenticated(false);
          }
        } else {
          // No session, user is not logged in
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes (mainly for signout and new logins)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          // Handle signout properly
          console.log('� User signed out, clearing data');
          setUser(null);
          setIsAuthenticated(false);
          clearStoredData();
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Only handle if user is not already set (avoid duplicate processing)
          if (!user || user.id !== session.user.id) {
            console.log('🔄 New sign-in detected, will be handled by login flow');
            // Login flow will handle setting the user with proper data
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, userType: 'buyer' | 'seller'): Promise<boolean> => {
    try {
      console.log('🔐 Starting login process for:', email);
      const { user: authUser, session } = await signIn(email, password);

      if (authUser && session) {
        console.log('✅ Authentication successful for user:', authUser.id);
        // Set the session first
        setIsAuthenticated(true);

        // Prepare user data for profile creation and user object building

        // Try to create/update the database profile first
        console.log('🔄 Creating/updating database profile...');
        try {
          const profilePromise = UserService.createUserProfile({
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
            user_type: userType,
            phone: authUser.phone,
            avatar_url: authUser.user_metadata?.avatar_url
          });

          // Shorter timeout for profile creation
          await Promise.race([
            profilePromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Profile creation timeout')), 8000)
            )
          ]);

          console.log('✅ Database profile created/updated successfully');
        } catch (dbError) {
          // Database profile creation failed, but we can still proceed with auth data
          console.warn('⚠️ Database profile creation failed, proceeding with auth data:', dbError);
        }

        // Store essentials immediately and build user object
        console.log('🔄 Building user object with stored essentials...');
        storeUserEssentials({
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
          user_type: userType,
          avatar_url: authUser.user_metadata?.avatar_url
        });

        // Build user object directly without database fetch during login
        const appUser = await buildUserWithSellerDetails({
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
          user_type: userType,
          phone: authUser.phone,
          avatar_url: authUser.user_metadata?.avatar_url
        });

        setUser(appUser);
        console.log('✅ User set successfully');

        console.log('✅ Login process completed successfully');
        return true;
      }

      console.log('❌ No auth user or session received');
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      await signInWithGoogle();
      // The redirect will handle the rest
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };



  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Starting registration for:', userData.email, 'as', userData.userType);

      // Create auth user without metadata to avoid trigger issues
      const { user: authUser } = await signUp(userData.email!, password, {});

      if (authUser) {
        console.log('✅ Auth user created:', authUser.id);

        // Wait a moment for the auth user to be fully created
        await new Promise(resolve => setTimeout(resolve, 500));

        // Manually create the user profile (bypass trigger)
        console.log('🔄 Creating user profile...');
        const userProfile = await UserService.createUserProfile({
          id: authUser.id,
          email: userData.email!,
          name: userData.name!,
          phone: userData.phone,
          user_type: userData.userType!
        });

        console.log('✅ User profile created successfully');

        // For sellers, we'll create the seller profile later in the complete-profile page
        // This avoids potential hanging issues during registration

        // Create basic user object for immediate use
        const basicUser: User = {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          userType: userProfile.user_type,
          phone: userProfile.phone || '',
          profileImage: userProfile.avatar_url || undefined
        };

        console.log('🔄 Setting user state...');
        setUser(basicUser);
        setIsAuthenticated(true);

        // Store essential user data in localStorage for fast future access
        storeUserEssentials(userProfile);

        console.log('✅ Registration completed successfully');
        return true;
      }

      throw new Error('Registration failed. Please try again.');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      clearStoredData(); // Clear localStorage on logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      try {
        // Filter out seller-specific fields that don't belong in the users table
        const userTableUpdates = {
          ...(updates.email && { email: updates.email }),
          ...(updates.name && { name: updates.name }),
          ...(updates.phone && { phone: updates.phone }),
          ...(updates.userType && { user_type: updates.userType }),
          ...(updates.profileImage && { avatar_url: updates.profileImage })
        };

        console.log('🔄 UserContext: Updating user with filtered fields:', userTableUpdates);

        const updatedUser = await UserService.updateUserProfile(user.id, userTableUpdates);
        const appUser = await getUserData(updatedUser);
        setUser(appUser);

        console.log('✅ UserContext: User updated successfully');
      } catch (error) {
        console.error('❌ UserContext: Update user error:', error);
        throw error; // Re-throw so the calling component can handle it
      }
    }
  };

  const toggleSellerAvailability = async () => {
    if (user && user.userType === 'seller') {
      try {
        console.log('🔄 UserContext: Toggling seller availability for:', user.id);

        // First check if seller profile exists
        const profileExists = await SellerService.sellerProfileExists(user.id);

        if (!profileExists) {
          console.warn('⚠️ UserContext: No seller profile found, cannot toggle availability');
          throw new Error('Please complete your seller profile first before going online.');
        }

        const newAvailability = await SellerService.toggleAvailability(user.id);
        setUser({ ...user, isOnline: newAvailability });
        console.log('✅ UserContext: Availability toggled successfully to:', newAvailability);
      } catch (error: any) {
        console.error('❌ UserContext: Toggle availability error:', error);
        // Re-throw the error so the UI can handle it
        throw error;
      }
    } else {
      throw new Error('Only sellers can toggle availability.');
    }
  };

  const value: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    toggleSellerAvailability
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
