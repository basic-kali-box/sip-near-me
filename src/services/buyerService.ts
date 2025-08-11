import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class BuyerService {
  // Get buyer profile with stats
  static async getBuyerProfile(buyerId: string): Promise<{
    user: User;
    stats: {
      totalOrders: number;
      totalSpent: number;
      favoriteCount: number;
      reviewCount: number;
    };
  } | null> {
    try {
      // Get basic user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', buyerId)
        .single();

      if (userError) throw userError;

      // Get buyer stats
      const [ordersResult, favoritesResult, reviewsResult] = await Promise.all([
        supabase
          .from('order_history')
          .select('total_amount')
          .eq('buyer_id', buyerId),
        supabase
          .from('favorites')
          .select('id')
          .eq('buyer_id', buyerId),
        supabase
          .from('ratings')
          .select('id')
          .eq('buyer_id', buyerId)
      ]);

      const stats = {
        totalOrders: ordersResult.data?.length || 0,
        totalSpent: ordersResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        favoriteCount: favoritesResult.data?.length || 0,
        reviewCount: reviewsResult.data?.length || 0
      };

      return { user, stats };
    } catch (error) {
      console.error('Error fetching buyer profile:', error);
      return null;
    }
  }

  // Update buyer profile
  static async updateBuyerProfile(buyerId: string, updates: UserUpdate): Promise<User> {
    try {
      console.log('🔄 BuyerService: Updating buyer profile for:', buyerId);

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', buyerId)
        .select()
        .single();

      if (error) {
        console.error('❌ BuyerService: Update error:', error);
        throw error;
      }

      console.log('✅ BuyerService: Buyer profile updated successfully');
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get buyer's favorite sellers
  static async getFavorites(buyerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          seller:sellers(
            id,
            business_name,
            address,
            photo_url,
            specialty,
            is_available,
            rating_average,
            rating_count,
            phone
          )
        `)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get buyer's order history
  static async getOrderHistory(buyerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('order_history')
        .select(`
          *,
          seller:sellers(
            id,
            business_name,
            photo_url,
            address
          )
        `)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Add seller to favorites
  static async addToFavorites(buyerId: string, sellerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId
        });

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Remove seller from favorites
  static async removeFromFavorites(buyerId: string, sellerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId);

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Check if seller is in favorites
  static async isFavorite(buyerId: string, sellerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
}
