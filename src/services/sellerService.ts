import { supabase, handleSupabaseError, findNearbySellers, trackSellerView } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Seller = Database['public']['Tables']['sellers']['Row'];
type SellerInsert = Database['public']['Tables']['sellers']['Insert'];
type SellerUpdate = Database['public']['Tables']['sellers']['Update'];

export class SellerService {
  // Get nearby sellers with location-based filtering
  static async getNearbySellers(
    latitude: number,
    longitude: number,
    filters?: {
      radiusKm?: number;
      specialty?: 'coffee' | 'matcha' | 'both';
      isAvailable?: boolean;
      minRating?: number;
    }
  ): Promise<any[]> {
    try {
      const sellers = await findNearbySellers(
        latitude,
        longitude,
        filters?.radiusKm || 10,
        filters
      );

      return sellers || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get seller by ID with drinks
  static async getSellerById(sellerId: string, viewerId?: string): Promise<Seller & { drinks?: any[] } | null> {
    try {
      // Track the view
      if (viewerId) {
        await trackSellerView(sellerId, viewerId);
      }

      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select(`
          *,
          drinks:drinks(*)
        `)
        .eq('id', sellerId)
        .single();

      if (sellerError) throw sellerError;

      return seller;
    } catch (error) {
      console.error('Error fetching seller:', error);
      return null;
    }
  }

  // Create seller profile
  static async createSellerProfile(sellerData: SellerInsert): Promise<Seller> {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .insert(sellerData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update seller profile
  static async updateSellerProfile(sellerId: string, updates: SellerUpdate): Promise<Seller> {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sellerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Toggle seller availability
  static async toggleAvailability(sellerId: string): Promise<boolean> {
    try {
      // Get current availability
      const { data: currentSeller, error: fetchError } = await supabase
        .from('sellers')
        .select('is_available')
        .eq('id', sellerId)
        .single();

      if (fetchError) throw fetchError;

      // Toggle availability
      const newAvailability = !currentSeller.is_available;
      
      const { error: updateError } = await supabase
        .from('sellers')
        .update({ 
          is_available: newAvailability,
          updated_at: new Date().toISOString()
        })
        .eq('id', sellerId);

      if (updateError) throw updateError;

      return newAvailability;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Upload seller photo
  static async uploadSellerPhoto(sellerId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${sellerId}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('seller-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('seller-photos')
        .getPublicUrl(fileName);

      // Update seller profile with photo URL
      await this.updateSellerProfile(sellerId, { photo_url: data.publicUrl });

      return data.publicUrl;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get seller analytics
  static async getSellerAnalytics(sellerId: string, days: number = 30): Promise<{
    profileViews: number;
    contactRequests: number;
    totalOrders: number;
    revenue: number;
    averageRating: number;
    recentActivity: any[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [analyticsResult, contactsResult, ordersResult, sellerResult] = await Promise.all([
        supabase
          .from('seller_analytics')
          .select('*')
          .eq('seller_id', sellerId)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('contact_requests')
          .select('*')
          .eq('seller_id', sellerId)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('order_history')
          .select('total_amount, status, created_at')
          .eq('seller_id', sellerId)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('sellers')
          .select('rating_average, rating_count')
          .eq('id', sellerId)
          .single()
      ]);

      const profileViews = analyticsResult.data?.filter(a => a.event_type === 'profile_view').length || 0;
      const contactRequests = contactsResult.data?.length || 0;
      const totalOrders = ordersResult.data?.length || 0;
      const revenue = ordersResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      return {
        profileViews,
        contactRequests,
        totalOrders,
        revenue,
        averageRating: Number(sellerResult.data?.rating_average || 0),
        recentActivity: [
          ...(analyticsResult.data || []),
          ...(contactsResult.data || []),
          ...(ordersResult.data || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get seller contact requests
  static async getContactRequests(sellerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          buyer:users!buyer_id(name, avatar_url)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update contact request status
  static async updateContactRequestStatus(
    requestId: string, 
    status: 'pending' | 'responded' | 'completed'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Search sellers
  static async searchSellers(query: string, filters?: {
    specialty?: 'coffee' | 'matcha' | 'both';
    isAvailable?: boolean;
    minRating?: number;
  }): Promise<Seller[]> {
    try {
      let queryBuilder = supabase
        .from('sellers')
        .select('*')
        .or(`business_name.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`);

      if (filters?.specialty && filters.specialty !== 'both') {
        queryBuilder = queryBuilder.eq('specialty', filters.specialty);
      }

      if (filters?.isAvailable !== undefined) {
        queryBuilder = queryBuilder.eq('is_available', filters.isAvailable);
      }

      if (filters?.minRating) {
        queryBuilder = queryBuilder.gte('rating_average', filters.minRating);
      }

      const { data, error } = await queryBuilder
        .order('rating_average', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get top-rated sellers
  static async getTopRatedSellers(limit: number = 10): Promise<Seller[]> {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('is_available', true)
        .gte('rating_count', 5) // At least 5 ratings
        .order('rating_average', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get seller orders
  static async getSellerOrders(sellerId: string, status?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('order_history')
        .select(`
          *,
          buyer:users!buyer_id(name, phone, avatar_url)
        `)
        .eq('seller_id', sellerId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string, 
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('order_history')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}
