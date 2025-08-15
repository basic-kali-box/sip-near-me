import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '750298159534-05hfkft27aq028ggm02rebkivh4gogsf.apps.googleusercontent.com';

console.log('🔧 Supabase Config Check:');
console.log('  URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signUp = async (email: string, password: string, userData?: {
  name?: string;
  phone?: string;
  user_type?: 'buyer' | 'seller';
}) => {
  const userType = userData?.user_type || 'buyer';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      ...(userData && { data: userData }),
      // Remove email confirmation requirement
      // emailRedirectTo: `${window.location.origin}/auth/callback?userType=${userType}`
    }
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  console.log('🔄 Attempting Google OAuth sign-in...');
  console.log('📍 Redirect URL:', `${window.location.origin}/auth/callback`);
  console.log('🔑 Google Client ID:', googleClientId);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        client_id: googleClientId
      },
      scopes: 'email profile openid'
    }
  });

  if (error) {
    console.error('❌ Google sign-in error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code || 'unknown',
      clientId: googleClientId
    });

    // Provide specific error guidance
    if (error.message?.includes('provider is not enabled')) {
      console.error('🚨 Google OAuth is not enabled in Supabase. Please:');
      console.error('1. Go to Supabase Dashboard → Authentication → Providers');
      console.error('2. Enable Google provider');
      console.error('3. Add Client ID:', googleClientId);
    }

    throw error;
  }

  console.log('✅ Google OAuth initiated successfully');
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Check if Google OAuth is properly configured
export const checkGoogleOAuthConfig = async () => {
  try {
    console.log('🔍 Checking Google OAuth configuration...');

    // Try to get the current session to check if auth is working
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Auth session error:', error);
      return false;
    }

    console.log('✅ Supabase auth is working');
    console.log('📊 Current session:', session ? 'Active' : 'None');

    return true;
  } catch (error) {
    console.error('❌ OAuth config check failed:', error);
    return false;
  }
};

// Real-time subscriptions
export const subscribeToSellerAvailability = (callback: (payload: any) => void) => {
  return supabase
    .channel('seller-availability')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'sellers',
      filter: 'is_available=eq.true'
    }, callback)
    .subscribe();
};

export const subscribeToNewSellers = (callback: (payload: any) => void) => {
  return supabase
    .channel('new-sellers')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'sellers'
    }, callback)
    .subscribe();
};

// Location-based queries
export const findNearbySellers = async (
  latitude: number, 
  longitude: number, 
  radiusKm: number = 10,
  filters?: {
    specialty?: 'coffee' | 'matcha' | 'both';
    isAvailable?: boolean;
    minRating?: number;
  }
) => {
  let query = supabase
    .rpc('find_nearby_sellers', {
      user_lat: latitude,
      user_lng: longitude,
      radius_km: radiusKm
    });

  if (filters?.specialty && filters.specialty !== 'both') {
    query = query.eq('specialty', filters.specialty);
  }

  if (filters?.isAvailable !== undefined) {
    query = query.eq('is_available', filters.isAvailable);
  }

  if (filters?.minRating) {
    query = query.gte('rating_average', filters.minRating);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// File upload helpers
export const uploadImage = async (
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string;
    upsert?: boolean;
  }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false
    });

  if (error) throw error;
  return data;
};

export const getImageUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const deleteImage = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

// Analytics helpers
export const trackSellerView = async (sellerId: string, viewerId?: string) => {
  const { error } = await supabase
    .from('seller_analytics')
    .insert({
      seller_id: sellerId,
      viewer_id: viewerId,
      event_type: 'profile_view',
      created_at: new Date().toISOString()
    });

  if (error) console.error('Failed to track seller view:', error);
};

export const trackContactAttempt = async (
  sellerId: string, 
  buyerId: string, 
  contactType: 'whatsapp' | 'phone' | 'inquiry'
) => {
  const { error } = await supabase
    .from('contact_requests')
    .insert({
      seller_id: sellerId,
      buyer_id: buyerId,
      contact_type: contactType,
      status: 'pending',
      created_at: new Date().toISOString()
    });

  if (error) console.error('Failed to track contact attempt:', error);
};

// Error handling wrapper
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);

  // Handle auth-specific errors
  if (error.message?.includes('Database error saving new user')) {
    return 'Registration failed due to a database error. Please run the database fix script and try again.';
  } else if (error.message?.includes('over_email_send_rate_limit')) {
    return 'Too many signup attempts. Please wait a moment before trying again.';
  } else if (error.message?.includes('rate_limit')) {
    return 'Rate limit exceeded. Please wait a moment before trying again.';
  } else if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  } else if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  } else if (error.message?.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  } else if (error.message?.includes('signup_disabled')) {
    return 'New user registration is currently disabled.';
  }

  // Handle database errors
  if (error.code === 'PGRST301') {
    return 'Resource not found';
  } else if (error.code === '23505') {
    return 'This item already exists';
  } else if (error.code === '42501') {
    return 'Permission denied - please check your account permissions';
  } else if (error.code === '23503') {
    return 'Database constraint violation - please contact support';
  } else if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again or contact support.';
};
