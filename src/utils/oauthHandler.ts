// Global OAuth Token Handler
// This handles OAuth tokens that might land on any page due to redirect issues

import { supabase } from '@/lib/supabase';

export const handleOAuthTokensInUrl = async (): Promise<boolean> => {
  const hash = window.location.hash;
  
  // Check if we have OAuth tokens in the URL hash
  if (!hash || (!hash.includes('access_token=') && !hash.includes('error='))) {
    return false;
  }
  
  console.log('🔍 OAuth tokens detected in URL hash');
  console.log('📍 Current URL:', window.location.href);
  
  try {
    // Parse the hash parameters
    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const expiresIn = hashParams.get('expires_in');
    const tokenType = hashParams.get('token_type');
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error) {
      console.error('❌ OAuth error:', error, errorDescription);
      throw new Error(`OAuth error: ${error} - ${errorDescription}`);
    }
    
    if (accessToken && refreshToken) {
      console.log('✅ Valid OAuth tokens found, setting session...');
      
      // Set the session using the tokens
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (sessionError) {
        console.error('❌ Error setting session:', sessionError);
        throw sessionError;
      }
      
      if (data.session) {
        console.log('✅ Session set successfully');
        console.log('👤 User ID:', data.session.user.id);
        console.log('📧 Email:', data.session.user.email);
        
        // Clean up the URL by removing the hash
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Redirect to the auth callback to complete the flow
        console.log('🔄 Redirecting to auth callback to complete flow...');
        window.location.href = '/auth/callback';
        return true;
      }
    }
    
    console.log('⚠️ No valid tokens found in hash');
    return false;
    
  } catch (error) {
    console.error('❌ Error processing OAuth tokens:', error);
    
    // Clean up the URL even if there was an error
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    
    // Redirect to sign in page with error
    window.location.href = '/signin?error=oauth_failed';
    return true;
  }
};

// Check if current URL has OAuth tokens and handle them
export const checkAndHandleOAuthTokens = async (): Promise<boolean> => {
  // Only run this on the client side
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Don't process if we're already on the auth callback page
  if (window.location.pathname === '/auth/callback') {
    return false;
  }
  
  return await handleOAuthTokensInUrl();
};

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).oauthHandler = {
    handleOAuthTokensInUrl,
    checkAndHandleOAuthTokens
  };
}
