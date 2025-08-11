import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class UserService {
  // Clean up duplicate user records for a given user ID
  static async cleanupDuplicateUsers(userId: string): Promise<void> {
    try {
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error || !allUsers || allUsers.length <= 1) {
        return; // No duplicates or error
      }

      console.warn(`⚠️ Found ${allUsers.length} duplicate user records for ${userId}`);

      // Keep the most recent record
      const userToKeep = allUsers.reduce((latest, current) => {
        if (!latest.updated_at && !current.updated_at) return latest;
        if (!latest.updated_at) return current;
        if (!current.updated_at) return latest;
        return new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest;
      });

      // Delete duplicates
      const duplicateIds = allUsers.filter(u => u !== userToKeep).map(u => u.id);

      if (duplicateIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .in('id', duplicateIds);

        if (deleteError) {
          console.error('❌ Error deleting duplicate users:', deleteError);
        } else {
          console.log(`✅ Cleaned up ${duplicateIds.length} duplicate user records`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate users:', error);
    }
  }

  // Get user profile by ID (direct database query)
  static async getUserProfileById(userId: string): Promise<User | null> {
    try {
      // First check for multiple records
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!allUsers || allUsers.length === 0) {
        return null;
      }

      if (allUsers.length > 1) {
        console.warn(`⚠️ Found ${allUsers.length} user records for ID ${userId}, cleaning up duplicates`);

        // Keep the most recent record (or first if no timestamps)
        const userToKeep = allUsers.reduce((latest, current) => {
          if (!latest.updated_at && !current.updated_at) return latest;
          if (!latest.updated_at) return current;
          if (!current.updated_at) return latest;
          return new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest;
        });

        // Delete duplicate records
        const duplicateIds = allUsers.filter(u => u !== userToKeep).map(u => u.id);

        if (duplicateIds.length > 0) {
          console.log('🗑️ Removing duplicate user records:', duplicateIds);
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .in('id', duplicateIds);

          if (deleteError) {
            console.error('❌ Error deleting duplicate users:', deleteError);
          } else {
            console.log('✅ Successfully cleaned up duplicate user records');
          }
        }

        return userToKeep;
      }

      return allUsers[0];
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

      let profile = await this.getUserProfileById(user.id);

      // If no profile exists for authenticated user, create one
      if (!profile) {
        console.log('👤 No profile found for authenticated user, creating...');
        try {
          profile = await this.ensureUserProfileExists(user.id);
        } catch (error) {
          console.error('❌ Failed to create profile for authenticated user:', error);
          return null;
        }
      }

      return profile;
    } catch (error) {
      console.error('💥 UserService: Error fetching current user profile:', error);
      return null;
    }
  }

  // Ensure user profile exists for authenticated user
  static async ensureUserProfileExists(userId: string): Promise<User> {
    try {
      // Check if profile already exists
      const existingProfile = await this.getUserProfileById(userId);
      if (existingProfile) {
        return existingProfile;
      }

      // Get auth user info
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser || authUser.id !== userId) {
        throw new Error('Cannot create profile: Auth user mismatch');
      }

      // Create basic profile from auth data
      const newUserData: UserInsert = {
        id: userId,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
        phone: authUser.user_metadata?.phone || null,
        user_type: 'buyer', // Default to buyer, can be changed later
        avatar_url: authUser.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('➕ Creating user profile from auth data:', newUserData);

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user profile:', createError);
        throw createError;
      }

      console.log('✅ User profile created successfully:', newUser);
      return newUser;
    } catch (error) {
      console.error('❌ ensureUserProfileExists failed:', error);
      throw error;
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
      console.log('🔄 Updating user profile for ID:', userId);
      console.log('📝 Updates:', updates);

      // First, check if user exists and how many records there are
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (checkError) {
        console.error('❌ Error checking existing users:', checkError);
        throw checkError;
      }

      console.log('👥 Found users:', existingUsers?.length || 0);

      if (!existingUsers || existingUsers.length === 0) {
        console.log('👤 User record not found, creating new profile...');

        // Get auth user info to create profile
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          throw new Error('Cannot create profile: No authenticated user found');
        }

        // Create new user profile
        const newUserData: UserInsert = {
          id: userId,
          email: authUser.email!,
          name: updates.name || authUser.user_metadata?.name || authUser.email!.split('@')[0],
          phone: updates.phone || null,
          user_type: updates.user_type || 'buyer',
          avatar_url: updates.avatar_url || authUser.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('➕ Creating user profile:', newUserData);

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert(newUserData)
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating user profile:', createError);
          throw createError;
        }

        console.log('✅ User profile created successfully:', newUser);
        return newUser;
      }

      if (existingUsers.length > 1) {
        console.error('⚠️ Multiple user records found:', existingUsers);
        // Delete duplicate records, keeping the first one
        const userToKeep = existingUsers[0];
        const duplicateIds = existingUsers.slice(1).map(u => u.id);

        if (duplicateIds.length > 0) {
          console.log('🗑️ Removing duplicate user records:', duplicateIds);
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .in('id', duplicateIds);

          if (deleteError) {
            console.error('❌ Error deleting duplicates:', deleteError);
          }
        }
      }

      // Now update the user profile
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }

      console.log('✅ User profile updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ updateUserProfile failed:', error);
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
