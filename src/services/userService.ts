import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class UserService {
  // Get user profile by ID (direct database query)
  static async getUserProfileById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile by ID:', error);
      return null;
    }
  }

  // Get current user profile
  static async getCurrentUserProfile(): Promise<User | null> {
    try {
      console.log('👤 UserService: Getting current user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log('👤 UserService: No auth user found:', userError?.message);
        return null;
      }
      console.log('👤 UserService: Auth user found:', user.id);

      return await this.getUserProfileById(user.id);
    } catch (error) {
      console.error('💥 UserService: Error fetching current user profile:', error);
      return null;
    }
  }

  // Create user profile manually (bypassing trigger) with timeout
  static async createUserProfile(userData: UserInsert): Promise<User> {
    console.log('➕ UserService: Creating user profile with timeout for:', userData.id);

    try {
      // Add timeout to the entire creation process
      const createPromise = this._createUserProfileInternal(userData);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User profile creation timeout')), 8000); // 8 second timeout
      });

      return await Promise.race([createPromise, timeoutPromise]) as User;
    } catch (error: any) {
      console.error('💥 UserService: Create user profile error:', error);
      if (error.message === 'User profile creation timeout') {
        console.error('💥 UserService: User profile creation timed out');
      }
      throw error;
    }
  }

  // Internal method for creating user profile
  private static async _createUserProfileInternal(userData: UserInsert): Promise<User> {
    try {
      console.log('➕ UserService: Starting internal profile creation...');

      // First check if profile already exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing user:', selectError);
      }

      if (existingUser) {
        // User profile already exists
        return existingUser;
      }

      // Try RPC function for secure profile creation if available, otherwise fall back
      // Attempting RPC to create profile (if available)
      try {
        const { data: rpcResult } = await supabase
          .rpc('create_user_profile_secure', {
            user_id: userData.id,
            user_email: userData.email,
            user_name: userData.name,
            user_type_val: userData.user_type,
            user_phone: userData.phone || null,
            user_avatar_url: userData.avatar_url || null
          });
        if (rpcResult) {
          // Profile created via RPC
          return rpcResult as User;
        }
      } catch (rpcError) {
        console.warn('RPC not available or failed, falling back to direct insert:', rpcError);
      }

      // Fallback: try direct insert
      // Trying direct insert
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          user_type: userData.user_type,
          phone: userData.phone || null,
          avatar_url: userData.avatar_url || null,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) {
        console.error('Direct insert error:', error);

        // Handle duplicate key error
        if (error.code === '23505') {
          const { data: duplicateUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', userData.id)
            .single();

          if (duplicateUser) {
            return duplicateUser;
          }
        }
        throw error;
      }

      // Profile created via direct insert
      return data;
    } catch (error) {
      console.error('UserService.createUserProfile error:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: UserUpdate): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Upload user avatar
  static async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile with avatar URL
      await this.updateUserProfile(userId, { avatar_url: data.publicUrl });

      return data.publicUrl;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Delete user account (profile only - auth deletion requires admin)
  static async deleteUserAccount(userId: string): Promise<void> {
    try {
      // Delete user profile (cascades to related tables)
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Note: Auth user deletion requires admin privileges
      // In production, this would be handled by a server-side function
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get user by ID (public info only)
  static async getUserById(userId: string): Promise<Partial<User> | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  // Search users by name (for admin purposes)
  static async searchUsers(query: string, userType?: 'buyer' | 'seller'): Promise<User[]> {
    try {
      let queryBuilder = supabase
        .from('users')
        .select('*')
        .ilike('name', `%${query}%`);

      if (userType) {
        queryBuilder = queryBuilder.eq('user_type', userType);
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<{
    totalOrders?: number;
    totalSpent?: number;
    favoriteCount?: number;
    reviewCount?: number;
  }> {
    try {
      const user = await this.getCurrentUserProfile();
      if (!user) throw new Error('User not found');

      const stats: any = {};

      if (user.user_type === 'buyer') {
        // Get buyer stats
        const [ordersResult, favoritesResult, reviewsResult] = await Promise.all([
          supabase
            .from('order_history')
            .select('total_amount')
            .eq('buyer_id', userId),
          supabase
            .from('favorites')
            .select('id')
            .eq('buyer_id', userId),
          supabase
            .from('ratings')
            .select('id')
            .eq('buyer_id', userId)
        ]);

        stats.totalOrders = ordersResult.data?.length || 0;
        stats.totalSpent = ordersResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        stats.favoriteCount = favoritesResult.data?.length || 0;
        stats.reviewCount = reviewsResult.data?.length || 0;
      }

      return stats;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update user preferences
  static async updateUserPreferences(userId: string, preferences: {
    notifications?: boolean;
    locationSharing?: boolean;
    marketingEmails?: boolean;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          // Store preferences in metadata or separate table
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Verify user email
  static async verifyEmail(_token: string): Promise<void> {
    try {
      // Note: Email verification is handled automatically by Supabase
      // This method is kept for compatibility
      // Email verification handled by Supabase automatically
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update password
  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}
