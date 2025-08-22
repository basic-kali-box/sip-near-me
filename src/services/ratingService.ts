import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Rating = Database['public']['Tables']['ratings']['Row'];
type RatingInsert = Database['public']['Tables']['ratings']['Insert'];
type RatingUpdate = Database['public']['Tables']['ratings']['Update'];

export class RatingService {
  // Get ratings for a seller
  static async getSellerRatings(sellerId: string, limit?: number): Promise<any[]> {
    try {
      let query = supabase
        .from('ratings')
        .select(`
          *,
          buyer:users!buyer_id(name, avatar_url)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get rating by buyer and seller
  static async getRatingByBuyerAndSeller(buyerId: string, sellerId: string): Promise<Rating | null> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    } catch (error) {
      console.error('Error fetching rating:', error);
      return null;
    }
  }

  // Create or update rating
  static async submitRating(ratingData: RatingInsert): Promise<Rating> {
    try {
      // Ensure we have a valid authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required to submit rating');
      }

      // Verify the buyer_id matches the authenticated user
      if (ratingData.buyer_id !== user.id) {
        throw new Error('You can only submit ratings for yourself');
      }

      // Check if rating already exists
      const existingRating = await this.getRatingByBuyerAndSeller(
        ratingData.buyer_id,
        ratingData.seller_id
      );

      if (existingRating) {
        // Update existing rating
        const { data, error } = await supabase
          .from('ratings')
          .update({
            rating: ratingData.rating,
            comment: ratingData.comment,
            order_items: ratingData.order_items,
            created_at: new Date().toISOString() // Update timestamp
          })
          .eq('id', existingRating.id)
          .eq('buyer_id', user.id) // Additional security check
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new rating with explicit timestamp
        const insertData = {
          ...ratingData,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('ratings')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Delete rating
  static async deleteRating(ratingId: string): Promise<void> {
    try {
      // SECURITY FIX: Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required to delete rating');
      }

      // SECURITY FIX: Check if user owns this rating
      const { data: rating, error: ratingError } = await supabase
        .from('ratings')
        .select('buyer_id')
        .eq('id', ratingId)
        .single();

      if (ratingError) throw ratingError;
      if (!rating) throw new Error('Rating not found');

      // Only allow the buyer who created the rating to delete it
      if (rating.buyer_id !== user.id) {
        throw new Error('Unauthorized: You can only delete your own ratings');
      }

      // Perform the deletion with additional security check
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', ratingId)
        .eq('buyer_id', user.id); // Double-check ownership

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get rating statistics for a seller
  static async getSellerRatingStats(sellerId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: Record<number, number>;
    recentRatings: any[];
  }> {
    try {
      const ratings = await this.getSellerRatings(sellerId);

      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0;

      // Calculate rating distribution
      const ratingDistribution: Record<number, number> = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };

      ratings.forEach(rating => {
        ratingDistribution[rating.rating] = (ratingDistribution[rating.rating] || 0) + 1;
      });

      // Get recent ratings (last 5)
      const recentRatings = ratings.slice(0, 5);

      return {
        averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        totalRatings,
        ratingDistribution,
        recentRatings
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get ratings by buyer
  static async getBuyerRatings(buyerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          seller:sellers!seller_id(business_name, photo_url)
        `)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get top-rated sellers
  static async getTopRatedSellers(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select(`
          *,
          ratings:ratings(rating)
        `)
        .eq('is_available', true)
        .gte('rating_count', 3) // At least 3 ratings
        .order('rating_average', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get recent ratings across platform
  static async getRecentRatings(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          buyer:users!buyer_id(name, avatar_url),
          seller:sellers!seller_id(business_name, photo_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Search ratings by comment content
  static async searchRatings(query: string, sellerId?: string): Promise<any[]> {
    try {
      let queryBuilder = supabase
        .from('ratings')
        .select(`
          *,
          buyer:users!buyer_id(name, avatar_url),
          seller:sellers!seller_id(business_name, photo_url)
        `)
        .ilike('comment', `%${query}%`)
        .not('comment', 'is', null);

      if (sellerId) {
        queryBuilder = queryBuilder.eq('seller_id', sellerId);
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get rating trends for seller (monthly)
  static async getSellerRatingTrends(sellerId: string, months: number = 6): Promise<{
    monthlyAverages: { month: string; average: number; count: number }[];
    overallTrend: 'improving' | 'declining' | 'stable';
  }> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data, error } = await supabase
        .from('ratings')
        .select('rating, created_at')
        .eq('seller_id', sellerId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group ratings by month
      const monthlyData: Record<string, { ratings: number[]; month: string }> = {};
      
      (data || []).forEach(rating => {
        const date = new Date(rating.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { ratings: [], month: monthName };
        }
        monthlyData[monthKey].ratings.push(rating.rating);
      });

      // Calculate monthly averages
      const monthlyAverages = Object.values(monthlyData).map(({ ratings, month }) => ({
        month,
        average: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100,
        count: ratings.length
      }));

      // Determine trend
      let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (monthlyAverages.length >= 2) {
        const firstHalf = monthlyAverages.slice(0, Math.ceil(monthlyAverages.length / 2));
        const secondHalf = monthlyAverages.slice(Math.floor(monthlyAverages.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, m) => sum + m.average, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, m) => sum + m.average, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 0.2) {
          overallTrend = 'improving';
        } else if (secondAvg < firstAvg - 0.2) {
          overallTrend = 'declining';
        }
      }

      return {
        monthlyAverages,
        overallTrend
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Report inappropriate rating
  static async reportRating(ratingId: string, reason: string, reporterId: string): Promise<void> {
    try {
      // In a real app, this would create a report record
      // For now, we'll just log it
      console.log('Rating reported:', { ratingId, reason, reporterId });
      
      // Could implement a reports table and moderation system
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}
