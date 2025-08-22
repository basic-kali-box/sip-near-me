export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          name: string
          user_type: 'buyer' | 'seller'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          name: string
          user_type: 'buyer' | 'seller'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          name?: string
          user_type?: 'buyer' | 'seller'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sellers: {
        Row: {
          id: string
          name: string
          business_name: string
          address: string
          latitude: number
          longitude: number
          phone: string
          hours: string | null
          photo_url: string | null
          specialty: 'coffee' | 'matcha' | 'both'
          is_available: boolean
          rating_average: number
          rating_count: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          business_name: string
          address: string
          latitude: number
          longitude: number
          phone: string
          hours?: string | null
          photo_url?: string | null
          specialty: 'coffee' | 'matcha' | 'both'
          is_available?: boolean
          rating_average?: number
          rating_count?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          business_name?: string
          address?: string
          latitude?: number
          longitude?: number
          phone?: string
          hours?: string | null
          photo_url?: string | null
          specialty?: 'coffee' | 'matcha' | 'both'
          is_available?: boolean
          rating_average?: number
          rating_count?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      drinks: {
        Row: {
          id: string
          seller_id: string
          name: string
          description: string | null
          price: number
          photo_url: string | null
          category: string | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          name: string
          description?: string | null
          price: number
          photo_url?: string | null
          category?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          name?: string
          description?: string | null
          price?: number
          photo_url?: string | null
          category?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          seller_id: string
          buyer_id: string
          rating: number
          comment: string | null
          order_items: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          buyer_id: string
          rating: number
          comment?: string | null
          order_items?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          buyer_id?: string
          rating?: number
          comment?: string | null
          order_items?: string[] | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          created_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          created_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          created_at?: string
        }
      }
      contact_requests: {
        Row: {
          id: string
          seller_id: string
          buyer_id: string
          contact_type: 'whatsapp' | 'phone' | 'inquiry'
          message: string | null
          status: 'pending' | 'responded' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          buyer_id: string
          contact_type: 'whatsapp' | 'phone' | 'inquiry'
          message?: string | null
          status?: 'pending' | 'responded' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          buyer_id?: string
          contact_type?: 'whatsapp' | 'phone' | 'inquiry'
          message?: string | null
          status?: 'pending' | 'responded' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      seller_analytics: {
        Row: {
          id: string
          seller_id: string
          viewer_id: string | null
          event_type: 'profile_view' | 'contact_attempt' | 'order_inquiry'
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          viewer_id?: string | null
          event_type: 'profile_view' | 'contact_attempt' | 'order_inquiry'
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          viewer_id?: string | null
          event_type?: 'profile_view' | 'contact_attempt' | 'order_inquiry'
          metadata?: Json | null
          created_at?: string
        }
      }

    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_nearby_sellers: {
        Args: {
          user_lat: number
          user_lng: number
          radius_km: number
        }
        Returns: {
          id: string
          business_name: string
          address: string
          latitude: number
          longitude: number
          phone: string
          hours: string
          photo_url: string
          specialty: string
          is_available: boolean
          rating_average: number
          rating_count: number
          description: string
          distance_km: number
        }[]
      }
      update_seller_rating: {
        Args: {
          seller_id: string
          new_rating: number
        }
        Returns: void
      }
    }
    Enums: {
      user_type: 'buyer' | 'seller'
      contact_type: 'whatsapp' | 'phone' | 'inquiry'

      specialty_type: 'coffee' | 'matcha' | 'both'
    }
  }
}
