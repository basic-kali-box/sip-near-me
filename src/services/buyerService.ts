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
      const [ordersResult, reviewsResult] = await Promise.all([
        supabase
          .from('order_history')
          .select('total_amount')
          .eq('buyer_id', buyerId),
        supabase
          .from('ratings')
          .select('id')
          .eq('buyer_id', buyerId)
      ]);

      const stats = {
        totalOrders: ordersResult.data?.length || 0,
        totalSpent: ordersResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
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


}
