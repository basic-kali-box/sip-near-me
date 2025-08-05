import React, { createContext, useContext, useState, useEffect } from 'react';

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
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleSellerAvailability: () => void;
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

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('brewNearUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('brewNearUser');
      }
    }
  }, []);

  const login = async (email: string, password: string, userType: 'buyer' | 'seller'): Promise<boolean> => {
    try {
      // Simulate API call - in real app, this would authenticate with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        phone: '+1 (555) 123-4567',
        userType,
        ...(userType === 'seller' && {
          businessName: `${email.split('@')[0]}'s Coffee Shop`,
          businessAddress: '123 Coffee Street, City, State',
          businessHours: '8:00 AM - 6:00 PM',
          specialty: 'coffee' as const,
          isOnline: true,
          rating: 4.5,
          reviewCount: 23
        }),
        ...(userType === 'buyer' && {
          favoriteSellerIds: [],
          orderHistory: []
        })
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('brewNearUser', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: userData.email!,
        name: userData.name!,
        phone: userData.phone!,
        userType: userData.userType!,
        ...userData,
        ...(userData.userType === 'seller' && {
          isOnline: true,
          rating: 0,
          reviewCount: 0
        }),
        ...(userData.userType === 'buyer' && {
          favoriteSellerIds: [],
          orderHistory: []
        })
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('brewNearUser', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('brewNearUser');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('brewNearUser', JSON.stringify(updatedUser));
    }
  };

  const toggleSellerAvailability = () => {
    if (user && user.userType === 'seller') {
      const updatedUser = { ...user, isOnline: !user.isOnline };
      setUser(updatedUser);
      localStorage.setItem('brewNearUser', JSON.stringify(updatedUser));
    }
  };

  const value: UserContextType = {
    user,
    isAuthenticated,
    login,
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
