// Authentication Debug Utilities

export const clearAllAuthData = () => {
  console.log('🧹 Clearing all authentication data...');
  
  // Clear all possible localStorage keys
  const keysToRemove = [
    'machroub_user_essentials',
    'brewnear_user_essentials', // old key
    'machroub_contacts',
    'brewnear_contacts', // old key
    'auth_returnTo',
    'pending_confirmation_email',
    'pending_confirmation_userType',
    'oauth_userType'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('🗑️ Cleared sessionStorage');
  
  console.log('✅ All authentication data cleared');
};

export const debugAuthState = async () => {
  console.group('🔍 Authentication Debug Info');

  // Check current URL and domain info
  console.log('📍 Current URL:', window.location.href);
  console.log('🌐 Origin:', window.location.origin);
  console.log('🌐 Hostname:', window.location.hostname);
  console.log('🌐 Protocol:', window.location.protocol);
  console.log('📍 Expected redirect URL:', `${window.location.origin}/auth/callback`);

  // Check localStorage
  console.log('💾 LocalStorage keys:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('machroub') || key.includes('brewnear') || key.includes('auth'))) {
      console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
    }
  }
  
  // Check Supabase session
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Supabase session error:', error.message);
    } else if (session) {
      console.log('✅ Supabase session found:');
      console.log('  - User ID:', session.user.id);
      console.log('  - Email:', session.user.email);
      console.log('  - Provider:', session.user.app_metadata.provider);
      console.log('  - Expires at:', new Date(session.expires_at! * 1000).toLocaleString());
    } else {
      console.log('❌ No Supabase session found');
    }
  } catch (error) {
    console.log('❌ Error checking Supabase session:', error);
  }
  
  console.groupEnd();
};

export const checkDomainRedirect = () => {
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  const hash = window.location.hash;

  console.log('🔍 Checking domain redirect...');
  console.log('📍 Current URL:', currentUrl);
  console.log('🌐 Hostname:', hostname);
  console.log('🔗 Hash:', hash);

  // Check if this is an OAuth callback with tokens in hash (regardless of domain)
  if (hash && (hash.includes('access_token=') || hash.includes('error='))) {
    console.log('🔍 Detected OAuth tokens in URL hash');
    console.log('🔧 Attempting to redirect to correct callback URL...');

    // If we're not already on the callback page, redirect there with the hash
    if (!window.location.pathname.includes('/auth/callback')) {
      const newUrl = `${window.location.origin}/auth/callback${hash}`;
      console.log('🔄 Redirecting to callback URL:', newUrl);
      window.location.href = newUrl;
      return true;
    }
  }

  // Check if we're on www subdomain when we shouldn't be
  if (hostname === 'www.machroub.ma') {
    console.log('⚠️ Detected www subdomain - this might cause OAuth issues');
    console.log('💡 Consider redirecting www.machroub.ma to machroub.ma');

    // If there's a hash, preserve it during redirect
    if (hash) {
      const newUrl = `https://machroub.ma${window.location.pathname}${hash}`;
      console.log('🔄 Redirecting to apex domain:', newUrl);
      window.location.href = newUrl;
      return true;
    }
  }

  return false;
};

export const testAuthFlow = async () => {
  console.log('🧪 Testing authentication flow...');

  // Check for domain issues first
  if (checkDomainRedirect()) {
    return; // Redirect is happening
  }

  // Clear all data first
  clearAllAuthData();

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Reload the page to reset state
  console.log('🔄 Reloading page to reset authentication state...');
  window.location.reload();
};

// SECURITY FIX: Only expose debug utilities in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).authDebug = {
    clearAllAuthData,
    debugAuthState,
    testAuthFlow,
    checkDomainRedirect
  };

  console.log('🔧 Auth debug utilities available at window.authDebug');
  console.log('  - window.authDebug.clearAllAuthData()');
  console.log('  - window.authDebug.debugAuthState()');
  console.log('  - window.authDebug.testAuthFlow()');
  console.log('  - window.authDebug.checkDomainRedirect()');
}
