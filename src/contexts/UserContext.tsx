import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signUp, signIn, signOut, signInWithGoogle, getCurrentUser } from '@/lib/supabase';
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
  login: (email: string, password: string, userType: 'buyer' | 'seller') => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  toggleSellerAvailability: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from Supabase on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const userProfile = await UserService.getCurrentUserProfile();
          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await UserService.getCurrentUserProfile();
          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, userType: 'buyer' | 'seller'): Promise<boolean> => {
    try {
      const { user: authUser } = await signIn(email, password);

      if (authUser) {
        const userProfile = await UserService.getCurrentUserProfile();
        if (userProfile) {
          setUser(userProfile);
          setIsAuthenticated(true);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
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
      console.log('Starting registration for:', userData.email);

      // Create auth user without metadata to avoid trigger issues
      const { user: authUser, session } = await signUp(userData.email!, password, {});
      console.log('Auth user created:', authUser?.id);

      if (authUser) {
        // Wait a moment for the auth user to be fully created
        await new Promise(resolve => setTimeout(resolve, 500));

        // Manually create the user profile (bypass trigger)
        console.log('Creating user profile...');
        const userProfile = await UserService.createUserProfile({
          id: authUser.id,
          email: userData.email!,
          name: userData.name!,
          phone: userData.phone,
          user_type: userData.userType!
        });
        console.log('User profile created:', userProfile.id);

        // If seller, create seller profile
        if (userData.userType === 'seller' && userData.businessName) {
          console.log('Creating seller profile...');
          await SellerService.createSellerProfile({
            id: authUser.id,
            business_name: userData.businessName,
            address: userData.businessAddress || '',
            phone: userData.phone || userProfile.phone || '',
            specialty: (userData.specialty as any) || 'coffee',
            hours: userData.businessHours
          });
          console.log('Seller profile created');
        }

        setUser(userProfile);
        setIsAuthenticated(true);
        console.log('Registration completed successfully');
        return true;
      }

      throw new Error('Registration failed. Please try again.');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await UserService.updateUserProfile(user.id, updates);
        setUser(updatedUser);
      } catch (error) {
        console.error('Update user error:', error);
      }
    }
  };

  const toggleSellerAvailability = async () => {
    if (user && user.userType === 'seller') {
      try {
        const newAvailability = await SellerService.toggleAvailability(user.id);
        setUser({ ...user, isOnline: newAvailability });
      } catch (error) {
        console.error('Toggle availability error:', error);
      }
    }
  };

  const value: UserContextType = {
    user,
    isAuthenticated,
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
