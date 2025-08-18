import { supabase, handleSupabaseError, findNearbySellers, trackSellerView } from '@/lib/supabase';
import { getDefaultCoordinates } from '@/utils/geocoding';
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

      console.log('🔍 SellerService: Querying seller with ID:', sellerId);
      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select(`
          *,
          drinks:drinks(*)
        `)
        .eq('id', sellerId)
        .single();

      console.log('🔍 SellerService: Query result:', { seller, error: sellerError });

      if (sellerError) {
        console.error('🔍 SellerService: Database error:', sellerError);
        throw sellerError;
      }

      console.log('🔍 SellerService: Returning seller data:', seller);
      return seller;
    } catch (error) {
      console.error('🔍 SellerService: Error fetching seller:', error);
      return null;
    }
  }

  // Create seller profile with retry logic
  static async createSellerProfile(sellerData: SellerInsert): Promise<Seller> {
    try {
      console.log('🔄 SellerService: Creating seller profile for:', sellerData.id);

      // First check if seller profile already exists
      const { data: existingSeller, error: checkError } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerData.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.warn('⚠️ Error checking existing seller:', checkError);
      }

      if (existingSeller) {
        console.log('✅ Seller profile already exists, returning existing profile');
        return existingSeller;
      }

      // Create new seller profile
      console.log('🔄 SellerService: Seller data to insert:', JSON.stringify(sellerData, null, 2));

      const insertData = {
        id: sellerData.id,
        name: sellerData.business_name, // Add the missing name field using business_name
        business_name: sellerData.business_name,
        address: sellerData.address,
        phone: sellerData.phone,
        specialty: sellerData.specialty || 'coffee',
        hours: sellerData.hours || 'Mon-Fri: 9AM-5PM',
        description: sellerData.description || null,
        is_available: sellerData.is_available ?? true,
        rating_average: sellerData.rating_average ?? 0,
        rating_count: sellerData.rating_count ?? 0,
        // Provide coordinates based on address or use defaults
        latitude: sellerData.latitude ?? getDefaultCoordinates(sellerData.address).latitude,
        longitude: sellerData.longitude ?? getDefaultCoordinates(sellerData.address).longitude,
        photo_url: sellerData.photo_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🔄 SellerService: Final insert data:', JSON.stringify(insertData, null, 2));

      const { data, error } = await supabase
        .from('sellers')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ SellerService: Insert error:', error);

        // Handle duplicate key error
        if (error.code === '23505') {
          console.log('🔄 Duplicate key error, fetching existing seller...');
          const { data: duplicateSeller } = await supabase
            .from('sellers')
            .select('*')
            .eq('id', sellerData.id)
            .single();

          if (duplicateSeller) {
            return duplicateSeller;
          }
        }
        throw error;
      }

      console.log('✅ SellerService: Seller profile created successfully');
      return data;
    } catch (error) {
      console.error('❌ SellerService: Create seller profile error:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  // Check if seller profile exists
  static async sellerProfileExists(sellerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('id')
        .eq('id', sellerId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - seller profile doesn't exist
          return false;
        } else if (error.code === '42501' || error.message?.includes('permission denied')) {
          // Permission denied - might be RLS policy issue, assume doesn't exist
          console.warn('⚠️ Permission denied checking seller profile, assuming does not exist');
          return false;
        } else {
          console.warn('⚠️ Error checking seller profile existence:', error);
          return false;
        }
      }

      return !!data;
    } catch (error) {
      console.error('❌ Exception checking seller profile existence:', error);
      return false;
    }
  }

  // Update seller profile
  static async updateSellerProfile(sellerId: string, updates: SellerUpdate): Promise<Seller> {
    try {
      console.log('🔄 SellerService: Updating seller profile for:', sellerId);

      const { data, error } = await supabase
        .from('sellers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sellerId)
        .select()
        .single();

      if (error) {
        console.error('❌ SellerService: Update error:', error);
        throw error;
      }

      console.log('✅ SellerService: Seller profile updated successfully');
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Set seller as always available
  static async setSellerAvailable(sellerId: string): Promise<boolean> {
    try {
      console.log('🔄 SellerService: Setting seller as available:', sellerId);

      const { error: updateError } = await supabase
        .from('sellers')
        .update({
          is_available: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', sellerId);

      if (updateError) {
        console.error('❌ SellerService: Error setting availability:', updateError);
        throw updateError;
      }

      console.log('✅ SellerService: Seller set as available');
      return true;
    } catch (error) {
      console.error('❌ SellerService: Set availability error:', error);
      throw new Error(handleSupabaseError(error));
    }
  }

  // Upload seller photo
  static async uploadSellerPhoto(sellerId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${sellerId}/profile-${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('seller-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('seller-photos')
        .getPublicUrl(fileName);

      // Add cache-busting parameter to the URL
      const photoUrlWithCacheBust = `${data.publicUrl}?t=${timestamp}`;

      // Update seller profile with photo URL
      await this.updateSellerProfile(sellerId, { photo_url: photoUrlWithCacheBust });

      return photoUrlWithCacheBust;
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
