import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { getValidCategoryValues, isValidCategory } from '@/utils/categories';

type Drink = Database['public']['Tables']['drinks']['Row'];
type DrinkInsert = Database['public']['Tables']['drinks']['Insert'];
type DrinkUpdate = Database['public']['Tables']['drinks']['Update'];

export class DrinkService {
  // Get drinks by seller ID
  static async getDrinksBySeller(sellerId: string, includeUnavailable: boolean = false): Promise<Drink[]> {
    try {
      let query = supabase
        .from('drinks')
        .select('*')
        .eq('seller_id', sellerId);

      if (!includeUnavailable) {
        query = query.eq('is_available', true);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get drink by ID
  static async getDrinkById(drinkId: string): Promise<Drink | null> {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select(`
          *,
          seller:sellers(business_name, phone, address, is_available)
        `)
        .eq('id', drinkId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching drink:', error);
      return null;
    }
  }

  // Create new drink
  static async createDrink(drinkData: DrinkInsert): Promise<Drink> {
    try {
      // SECURITY FIX: Server-side validation
      if (!drinkData.name || typeof drinkData.name !== 'string') {
        throw new Error('Invalid drink name');
      }
      if (!drinkData.description || typeof drinkData.description !== 'string') {
        throw new Error('Invalid drink description');
      }
      if (!drinkData.price || typeof drinkData.price !== 'number') {
        throw new Error('Invalid price');
      }
      if (!drinkData.category || typeof drinkData.category !== 'string') {
        throw new Error('Invalid category');
      }

      // Validate name
      const name = drinkData.name.trim();
      if (name.length < 2 || name.length > 100) {
        throw new Error('Drink name must be between 2 and 100 characters');
      }

      // Validate description
      const description = drinkData.description.trim();
      if (description.length < 10 || description.length > 500) {
        throw new Error('Description must be between 10 and 500 characters');
      }

      // SECURITY FIX: Strict price validation
      const price = drinkData.price;
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a positive number');
      }
      if (price < 1) {
        throw new Error('Minimum price is 1 MAD');
      }
      if (price > 10000) {
        throw new Error('Maximum price is 10,000 MAD');
      }
      // Check for reasonable decimal places (max 2)
      if (Math.round(price * 100) !== price * 100) {
        throw new Error('Price can have at most 2 decimal places');
      }

      // Validate category
      if (!isValidCategory(drinkData.category)) {
        throw new Error(`Invalid category. Valid categories are: ${getValidCategoryValues().join(', ')}`);
      }

      // SECURITY FIX: Verify user authentication and authorization
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required to create drink');
      }

      if (drinkData.seller_id !== user.id) {
        throw new Error('You can only create drinks for yourself');
      }

      // Sanitize data before insertion
      const sanitizedData = {
        ...drinkData,
        name: name,
        description: description,
        price: Math.round(price * 100) / 100, // Ensure 2 decimal places max
        category: drinkData.category.trim()
      };

      const { data, error } = await supabase
        .from('drinks')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Update drink
  static async updateDrink(drinkId: string, updates: DrinkUpdate): Promise<Drink> {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', drinkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Delete drink
  static async deleteDrink(drinkId: string): Promise<void> {
    try {
      // First, delete the photo from storage if it exists
      const drink = await this.getDrinkById(drinkId);
      if (drink?.photo_url) {
        const path = drink.photo_url.split('/').pop();
        if (path) {
          await supabase.storage
            .from('drink-photos')
            .remove([path]);
        }
      }

      const { error } = await supabase
        .from('drinks')
        .delete()
        .eq('id', drinkId);

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Upload drink photo
  static async uploadDrinkPhoto(drinkId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${drinkId}-${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('drink-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('drink-photos')
        .getPublicUrl(fileName);

      // Add cache-busting parameter to the URL
      const photoUrlWithCacheBust = `${data.publicUrl}?t=${timestamp}`;

      // Update drink with photo URL
      await this.updateDrink(drinkId, { photo_url: photoUrlWithCacheBust });

      return photoUrlWithCacheBust;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Toggle drink availability
  static async toggleDrinkAvailability(drinkId: string): Promise<boolean> {
    try {
      // Get current availability
      const { data: currentDrink, error: fetchError } = await supabase
        .from('drinks')
        .select('is_available')
        .eq('id', drinkId)
        .single();

      if (fetchError) throw fetchError;

      // Toggle availability
      const newAvailability = !currentDrink.is_available;
      
      await this.updateDrink(drinkId, { is_available: newAvailability });

      return newAvailability;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Search drinks
  static async searchDrinks(query: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
  }): Promise<Drink[]> {
    try {
      let queryBuilder = supabase
        .from('drinks')
        .select(`
          *,
          seller:sellers(business_name, address, is_available, rating_average)
        `)
        .eq('is_available', true)
        .ilike('name', `%${query}%`);

      if (filters?.category) {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }

      if (filters?.minPrice) {
        queryBuilder = queryBuilder.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice) {
        queryBuilder = queryBuilder.lte('price', filters.maxPrice);
      }

      if (filters?.sellerId) {
        queryBuilder = queryBuilder.eq('seller_id', filters.sellerId);
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

  // Get popular drinks
  static async getPopularDrinks(limit: number = 20): Promise<Drink[]> {
    try {
      // This would ideally be based on order frequency, but for now we'll use recent drinks from top-rated sellers
      const { data, error } = await supabase
        .from('drinks')
        .select(`
          *,
          seller:sellers!inner(business_name, rating_average, is_available)
        `)
        .eq('is_available', true)
        .eq('seller.is_available', true)
        .gte('seller.rating_average', 4.0)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get drinks by category
  static async getDrinksByCategory(category: string): Promise<Drink[]> {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select(`
          *,
          seller:sellers(business_name, address, is_available, rating_average)
        `)
        .eq('is_available', true)
        .eq('category', category)
        .eq('seller.is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get drink categories
  static async getDrinkCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select('category')
        .not('category', 'is', null)
        .eq('is_available', true);

      if (error) throw error;

      // Get unique categories
      const categories = [...new Set(data?.map(d => d.category).filter(Boolean))];
      return categories as string[];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Bulk update drinks
  static async bulkUpdateDrinks(updates: { id: string; updates: DrinkUpdate }[]): Promise<void> {
    try {
      const promises = updates.map(({ id, updates: drinkUpdates }) =>
        this.updateDrink(id, drinkUpdates)
      );

      await Promise.all(promises);
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get drink statistics for seller
  static async getDrinkStats(sellerId: string): Promise<{
    totalDrinks: number;
    availableDrinks: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    categoryCounts: Record<string, number>;
  }> {
    try {
      const drinks = await this.getDrinksBySeller(sellerId, true);

      const totalDrinks = drinks.length;
      const availableDrinks = drinks.filter(d => d.is_available).length;
      const prices = drinks.map(d => Number(d.price));
      const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      const priceRange = {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      };

      const categoryCounts: Record<string, number> = {};
      drinks.forEach(drink => {
        if (drink.category) {
          categoryCounts[drink.category] = (categoryCounts[drink.category] || 0) + 1;
        }
      });

      return {
        totalDrinks,
        availableDrinks,
        averagePrice,
        priceRange,
        categoryCounts
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}
