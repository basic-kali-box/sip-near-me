import { supabase, handleSupabaseError, trackContactAttempt } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type OrderHistory = Database['public']['Tables']['order_history']['Row'];
type OrderInsert = Database['public']['Tables']['order_history']['Insert'];
type OrderUpdate = Database['public']['Tables']['order_history']['Update'];

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export class OrderService {
  // Create new order
  static async createOrder(orderData: {
    buyerId: string;
    sellerId: string;
    items: OrderItem[];
    totalAmount: number;
    contactMethod: 'whatsapp' | 'phone';
    pickupTime?: string;
    specialInstructions?: string;
  }): Promise<OrderHistory> {
    try {
      const { data, error } = await supabase
        .from('order_history')
        .insert({
          buyer_id: orderData.buyerId,
          seller_id: orderData.sellerId,
          items: orderData.items as any,
          total_amount: orderData.totalAmount,
          contact_method: orderData.contactMethod,
          pickup_time: orderData.pickupTime,
          special_instructions: orderData.specialInstructions,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Track the contact attempt
      await trackContactAttempt(orderData.sellerId, orderData.buyerId, orderData.contactMethod);

      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('order_history')
        .select(`
          *,
          buyer:users!buyer_id(name, phone, avatar_url),
          seller:sellers!seller_id(business_name, phone, address, photo_url)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  // Get buyer's order history
  static async getBuyerOrders(buyerId: string, status?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('order_history')
        .select(`
          *,
          seller:sellers!seller_id(business_name, phone, address, photo_url, rating_average)
        `)
        .eq('buyer_id', buyerId);

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

  // Get seller's orders
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
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    updatedBy: string
  ): Promise<OrderHistory> {
    try {
      const { data, error } = await supabase
        .from('order_history')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get order statistics for buyer
  static async getBuyerOrderStats(buyerId: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteSellerIds: string[];
    monthlySpending: { month: string; amount: number }[];
  }> {
    try {
      const orders = await this.getBuyerOrders(buyerId);
      
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      // Find favorite sellers (most ordered from)
      const sellerCounts: Record<string, number> = {};
      orders.forEach(order => {
        sellerCounts[order.seller_id] = (sellerCounts[order.seller_id] || 0) + 1;
      });
      
      const favoriteSellerIds = Object.entries(sellerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([sellerId]) => sellerId);

      // Calculate monthly spending (last 6 months)
      const monthlySpending: { month: string; amount: number }[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        });
        
        const monthAmount = monthOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        monthlySpending.push({ month: monthKey, amount: monthAmount });
      }

      return {
        totalOrders,
        completedOrders,
        totalSpent,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        favoriteSellerIds,
        monthlySpending
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get order statistics for seller
  static async getSellerOrderStats(sellerId: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topItems: { name: string; count: number }[];
    monthlyRevenue: { month: string; amount: number }[];
  }> {
    try {
      const orders = await this.getSellerOrders(sellerId);
      
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Find top items
      const itemCounts: Record<string, number> = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
          });
        }
      });
      
      const topItems = Object.entries(itemCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Calculate monthly revenue (last 6 months)
      const monthlyRevenue: { month: string; amount: number }[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        });
        
        const monthAmount = monthOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        monthlyRevenue.push({ month: monthKey, amount: monthAmount });
      }

      return {
        totalOrders,
        completedOrders,
        totalRevenue,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        topItems,
        monthlyRevenue
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Get recent orders (for dashboard)
  static async getRecentOrders(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('order_history')
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

  // Search orders
  static async searchOrders(query: string, userId?: string, userType?: 'buyer' | 'seller'): Promise<any[]> {
    try {
      let queryBuilder = supabase
        .from('order_history')
        .select(`
          *,
          buyer:users!buyer_id(name, avatar_url),
          seller:sellers!seller_id(business_name, photo_url)
        `);

      if (userId && userType === 'buyer') {
        queryBuilder = queryBuilder.eq('buyer_id', userId);
      } else if (userId && userType === 'seller') {
        queryBuilder = queryBuilder.eq('seller_id', userId);
      }

      // Search in special instructions or items
      queryBuilder = queryBuilder.or(
        `special_instructions.ilike.%${query}%,items.cs.{"name":"${query}"}`
      );

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      await this.updateOrderStatus(orderId, 'cancelled', '');
      
      // Could add cancellation reason to a separate table or metadata
      if (reason) {
        console.log('Order cancelled:', { orderId, reason });
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Reorder (create new order based on previous order)
  static async reorder(originalOrderId: string, buyerId: string): Promise<OrderHistory> {
    try {
      const originalOrder = await this.getOrderById(originalOrderId);
      if (!originalOrder || originalOrder.buyer_id !== buyerId) {
        throw new Error('Original order not found or access denied');
      }

      return await this.createOrder({
        buyerId,
        sellerId: originalOrder.seller_id,
        items: originalOrder.items,
        totalAmount: originalOrder.total_amount,
        contactMethod: originalOrder.contact_method,
        specialInstructions: originalOrder.special_instructions
      });
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}
