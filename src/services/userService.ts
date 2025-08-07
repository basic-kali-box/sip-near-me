import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class UserService {
  // Get current user profile
  static async getCurrentUserProfile(): Promise<User | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Create user profile manually (bypassing trigger)
  static async createUserProfile(userData: UserInsert): Promise<User> {
    try {
      console.log('Creating user profile for:', userData.id);

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
        console.log('User profile already exists');
        return existingUser;
      }

      // Use RPC function for secure profile creation
      console.log('Using RPC function to create profile...');
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('create_user_profile_secure', {
          user_id: userData.id,
          user_email: userData.email,
          user_name: userData.name,
          user_type_val: userData.user_type,
          user_phone: userData.phone || null,
          user_avatar_url: userData.avatar_url || null
        });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw rpcError;
      }

      if (rpcResult) {
        console.log('Profile created via RPC:', rpcResult);
        return rpcResult as User;
      }

      // Fallback: try direct insert (if RLS is disabled)
      console.log('Trying direct insert...');
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

      console.log('Profile created via direct insert:', data);
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
      console.log('Email verification handled by Supabase automatically');
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
