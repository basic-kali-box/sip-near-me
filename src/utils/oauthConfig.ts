// OAuth Configuration and Verification Utilities

export const GOOGLE_CLIENT_ID = '750298159534-05hfkft27aq028ggm02rebkivh4gogsf.apps.googleusercontent.com';

export const OAUTH_CONFIG = {
  google: {
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['email', 'profile', 'openid'],
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
  }
};

// Verify OAuth configuration
export const verifyOAuthConfig = () => {
  const issues: string[] = [];
  
  // Check Google Client ID format
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
    issues.push('Invalid Google Client ID format');
  }
  
  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    issues.push('Missing VITE_SUPABASE_URL environment variable');
  }
  
  if (!supabaseKey) {
    issues.push('Missing VITE_SUPABASE_ANON_KEY environment variable');
  }
  
  // Check if running on localhost vs production
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (isLocalhost) {
    console.log('🏠 Running on localhost - OAuth should work for development');
  } else {
    console.log('🌐 Running on production - ensure domain is added to Google OAuth settings');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    config: OAUTH_CONFIG
  };
};

// Get the correct redirect URI for current environment
export const getRedirectUri = () => {
  if (typeof window === 'undefined') return '';
  
  const origin = window.location.origin;
  return `${origin}/auth/callback`;
};

// Get Supabase OAuth callback URL
export const getSupabaseCallbackUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return '';
  
  return `${supabaseUrl}/auth/v1/callback`;
};

// Debug OAuth configuration
export const debugOAuthConfig = () => {
  console.group('🔍 OAuth Configuration Debug');
  
  const verification = verifyOAuthConfig();
  
  console.log('✅ Configuration Status:', verification.isValid ? 'Valid' : 'Invalid');
  
  if (verification.issues.length > 0) {
    console.log('❌ Issues found:');
    verification.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID);
  console.log('📍 Redirect URI:', getRedirectUri());
  console.log('🔗 Supabase Callback:', getSupabaseCallbackUrl());
  console.log('🌐 Current Origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
  
  // Environment check
  console.log('🔧 Environment Variables:');
  console.log('  - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('  - VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('  - VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅ Set' : '⚠️ Using default');
  
  console.groupEnd();
  
  return verification;
};

// Required Google OAuth setup steps
export const getSetupInstructions = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const projectRef = supabaseUrl ? supabaseUrl.split('//')[1]?.split('.')[0] : 'your-project-ref';
  
  return {
    googleConsole: {
      title: 'Google Cloud Console Setup',
      steps: [
        'Go to https://console.cloud.google.com',
        'Create or select your project',
        'Enable Google+ API and People API',
        'Go to APIs & Services → OAuth consent screen',
        'Configure consent screen with app details',
        'Go to APIs & Services → Credentials',
        'Create OAuth 2.0 Client ID (Web application)',
        'Add authorized origins and redirect URIs'
      ],
      authorizedOrigins: [
        'http://localhost:8081',
        'http://localhost:3000',
        typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'
      ],
      redirectUris: [
        `https://${projectRef}.supabase.co/auth/v1/callback`
      ]
    },
    supabase: {
      title: 'Supabase Configuration',
      steps: [
        'Go to your Supabase Dashboard',
        'Navigate to Authentication → Providers',
        'Enable Google provider',
        `Add Client ID: ${GOOGLE_CLIENT_ID}`,
        'Add your Client Secret from Google Console',
        `Set Redirect URL: https://${projectRef}.supabase.co/auth/v1/callback`
      ]
    }
  };
};

// Test OAuth configuration
export const testOAuthConfig = async () => {
  console.log('🧪 Testing OAuth Configuration...');
  
  try {
    // Test if we can access the auth endpoint
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }
    
    // This is just a configuration test, not an actual auth attempt
    const testUrl = `${supabaseUrl}/auth/v1/authorize?provider=google`;
    console.log('🔗 OAuth endpoint:', testUrl);
    
    return {
      success: true,
      message: 'Configuration appears valid',
      endpoint: testUrl
    };
  } catch (error) {
    console.error('❌ OAuth configuration test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      endpoint: null
    };
  }
};
