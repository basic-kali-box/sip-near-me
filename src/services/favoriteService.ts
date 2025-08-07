import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Favorite = Database['public']['Tables']['favorites']['Row'];

export class FavoriteService {
  // Get user's favorite sellers
  static async getUserFavorites(buyerId: string): Promise<any[]> {
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

  // Check if seller is favorited by user
  static async isFavorited(buyerId: string, sellerId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return !!data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Add seller to favorites
  static async addToFavorites(buyerId: string, sellerId: string): Promise<Favorite> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          buyer_id: buyerId,
          seller_id: sellerId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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

  // Toggle favorite status
  static async toggleFavorite(buyerId: string, sellerId: string): Promise<boolean> {
    try {
      const isFav = await this.isFavorited(buyerId, sellerId);
      
      if (isFav) {
        await this.removeFromFavorites(buyerId, sellerId);
        return false;
      } else {
        await this.addToFavorites(buyerId, sellerId);
        return true;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get favorite count for seller
  static async getSellerFavoriteCount(sellerId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get most favorited sellers
  static async getMostFavoritedSellers(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_most_favorited_sellers', { result_limit: limit });

      if (error) throw error;
      return data || [];
    } catch (error) {
      // Fallback if RPC function doesn't exist
      try {
        const { data, error: fallbackError } = await supabase
          .from('sellers')
          .select(`
            *,
            favorites:favorites(count)
          `)
          .eq('is_available', true)
          .limit(limit);

        if (fallbackError) throw fallbackError;
        
        // Sort by favorite count (this is a simplified approach)
        return (data || []).sort((a, b) => 
          (b.favorites?.length || 0) - (a.favorites?.length || 0)
        );
      } catch (fallbackError) {
        throw new Error(handleSupabaseError(fallbackError));
      }
    }
  }

  // Get recent favorites activity
  static async getRecentFavoritesActivity(buyerId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          seller:sellers(
            business_name,
            photo_url,
            specialty,
            is_available,
            rating_average
          )
        `)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get favorite sellers by specialty
  static async getFavoritesBySpecialty(buyerId: string, specialty: 'coffee' | 'matcha' | 'both'): Promise<any[]> {
    try {
      let query = supabase
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
            rating_count
          )
        `)
        .eq('buyer_id', buyerId);

      if (specialty !== 'both') {
        query = query.eq('seller.specialty', specialty);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get available favorite sellers (for quick ordering)
  static async getAvailableFavorites(buyerId: string): Promise<any[]> {
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
            phone,
            rating_average,
            rating_count
          )
        `)
        .eq('buyer_id', buyerId)
        .eq('seller.is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Bulk remove favorites
  static async bulkRemoveFavorites(buyerId: string, sellerIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('buyer_id', buyerId)
        .in('seller_id', sellerIds);

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get favorite statistics for user
  static async getFavoriteStats(buyerId: string): Promise<{
    totalFavorites: number;
    availableFavorites: number;
    specialtyBreakdown: Record<string, number>;
    averageRating: number;
  }> {
    try {
      const favorites = await this.getUserFavorites(buyerId);
      
      const totalFavorites = favorites.length;
      const availableFavorites = favorites.filter(f => f.seller?.is_available).length;
      
      const specialtyBreakdown: Record<string, number> = {};
      let totalRating = 0;
      let ratedCount = 0;

      favorites.forEach(favorite => {
        if (favorite.seller?.specialty) {
          const specialty = favorite.seller.specialty;
          specialtyBreakdown[specialty] = (specialtyBreakdown[specialty] || 0) + 1;
        }
        
        if (favorite.seller?.rating_average) {
          totalRating += favorite.seller.rating_average;
          ratedCount++;
        }
      });

      const averageRating = ratedCount > 0 ? totalRating / ratedCount : 0;

      return {
        totalFavorites,
        availableFavorites,
        specialtyBreakdown,
        averageRating: Math.round(averageRating * 100) / 100
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}
