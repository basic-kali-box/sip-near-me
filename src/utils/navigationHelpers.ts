import { NavigateFunction } from 'react-router-dom';

export interface NavigationState {
  userType?: 'buyer' | 'seller';
  source?: string;
  returnTo?: string;
}

export interface NavigationHelpers {
  navigateToSignIn: (returnTo?: string) => void;
  navigateToSignUp: (userType?: 'buyer' | 'seller', source?: string) => void;
  navigateToSellerSignUp: (source?: string) => void;
  navigateWithErrorHandling: (path: string, state?: NavigationState) => void;
}

export const createNavigationHelpers = (
  navigate: NavigateFunction,
  onError?: (error: Error) => void
): NavigationHelpers => {
  const navigateWithErrorHandling = (path: string, state?: NavigationState) => {
    try {
      if (state) {
        navigate(path, { state });
      } else {
        navigate(path);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const navigateToSignIn = (returnTo?: string) => {
    const state: NavigationState = returnTo ? { returnTo } : {};
    navigateWithErrorHandling('/signin', state);
  };

  const navigateToSignUp = (userType?: 'buyer' | 'seller', source?: string) => {
    const state: NavigationState = {};
    if (userType) state.userType = userType;
    if (source) state.source = source;
    
    navigateWithErrorHandling('/signup', Object.keys(state).length > 0 ? state : undefined);
  };

  const navigateToSellerSignUp = (source: string = 'direct') => {
    navigateToSignUp('seller', source);
  };

  return {
    navigateToSignIn,
    navigateToSignUp,
    navigateToSellerSignUp,
    navigateWithErrorHandling
  };
};

// URL parameter helpers
export const getUrlParams = (search: string) => {
  return new URLSearchParams(search);
};

export const buildSignUpUrl = (userType?: 'buyer' | 'seller') => {
  const params = new URLSearchParams();
  if (userType) {
    params.set('userType', userType);
  }
  return `/signup${params.toString() ? `?${params.toString()}` : ''}`;
};

// Validation helpers
export const isValidUserType = (userType: string): userType is 'buyer' | 'seller' => {
  return userType === 'buyer' || userType === 'seller';
};

export const sanitizeNavigationState = (state: any): NavigationState => {
  const sanitized: NavigationState = {};
  
  if (state?.userType && isValidUserType(state.userType)) {
    sanitized.userType = state.userType;
  }
  
  if (state?.source && typeof state.source === 'string') {
    sanitized.source = state.source;
  }
  
  if (state?.returnTo && typeof state.returnTo === 'string') {
    sanitized.returnTo = state.returnTo;
  }
  
  return sanitized;
};

// Analytics helpers for tracking navigation
export const trackNavigation = (from: string, to: string, userType?: string) => {
  // This would integrate with your analytics service
  console.log('Navigation tracked:', { from, to, userType });
  
  // Example: Google Analytics or custom analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'navigation', {
      from_page: from,
      to_page: to,
      user_type: userType
    });
  }
};
