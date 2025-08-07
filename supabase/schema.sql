-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_type AS ENUM ('buyer', 'seller');
CREATE TYPE contact_type AS ENUM ('whatsapp', 'phone', 'inquiry');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE specialty_type AS ENUM ('coffee', 'matcha', 'both');
CREATE TYPE event_type AS ENUM ('profile_view', 'contact_attempt', 'order_inquiry');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    name TEXT NOT NULL,
    user_type user_type NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sellers table
CREATE TABLE public.sellers (
    id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    business_name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT NOT NULL,
    hours TEXT,
    photo_url TEXT,
    specialty specialty_type NOT NULL DEFAULT 'coffee',
    is_available BOOLEAN DEFAULT TRUE,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drinks table
CREATE TABLE public.drinks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    photo_url TEXT,
    category TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE public.ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    order_items TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seller_id, buyer_id) -- One rating per buyer per seller
);

-- Favorites table
CREATE TABLE public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, seller_id)
);

-- Contact requests table
CREATE TABLE public.contact_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    contact_type contact_type NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller analytics table
CREATE TABLE public.seller_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type event_type NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order history table
CREATE TABLE public.order_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
    status order_status DEFAULT 'pending',
    contact_method contact_type NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sellers_location ON public.sellers USING GIST (ST_Point(longitude, latitude));
CREATE INDEX idx_sellers_available ON public.sellers (is_available);
CREATE INDEX idx_sellers_specialty ON public.sellers (specialty);
CREATE INDEX idx_sellers_rating ON public.sellers (rating_average DESC);
CREATE INDEX idx_drinks_seller ON public.drinks (seller_id);
CREATE INDEX idx_drinks_available ON public.drinks (is_available);
CREATE INDEX idx_ratings_seller ON public.ratings (seller_id);
CREATE INDEX idx_favorites_buyer ON public.favorites (buyer_id);
CREATE INDEX idx_contact_requests_seller ON public.contact_requests (seller_id);
CREATE INDEX idx_analytics_seller ON public.seller_analytics (seller_id);
CREATE INDEX idx_order_history_buyer ON public.order_history (buyer_id);
CREATE INDEX idx_order_history_seller ON public.order_history (seller_id);

-- Function to find nearby sellers using PostGIS
CREATE OR REPLACE FUNCTION find_nearby_sellers(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    business_name TEXT,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    phone TEXT,
    hours TEXT,
    photo_url TEXT,
    specialty TEXT,
    is_available BOOLEAN,
    rating_average DECIMAL,
    rating_count INTEGER,
    description TEXT,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.business_name,
        s.address,
        s.latitude,
        s.longitude,
        s.phone,
        s.hours,
        s.photo_url,
        s.specialty::TEXT,
        s.is_available,
        s.rating_average,
        s.rating_count,
        s.description,
        ROUND(
            ST_Distance(
                ST_Point(user_lng, user_lat)::geography,
                ST_Point(s.longitude, s.latitude)::geography
            ) / 1000, 2
        ) AS distance_km
    FROM public.sellers s
    WHERE s.latitude IS NOT NULL 
      AND s.longitude IS NOT NULL
      AND ST_DWithin(
          ST_Point(user_lng, user_lat)::geography,
          ST_Point(s.longitude, s.latitude)::geography,
          radius_km * 1000
      )
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to update seller rating average
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.sellers 
    SET 
        rating_average = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM public.ratings 
            WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id)
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM public.ratings 
            WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.seller_id, OLD.seller_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update seller ratings
CREATE TRIGGER update_seller_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drinks_updated_at BEFORE UPDATE ON public.drinks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_requests_updated_at BEFORE UPDATE ON public.contact_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_history_updated_at BEFORE UPDATE ON public.order_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for sellers table
CREATE POLICY "Anyone can view available sellers" ON public.sellers
    FOR SELECT USING (is_available = true);

CREATE POLICY "Sellers can view their own profile" ON public.sellers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Sellers can update their own profile" ON public.sellers
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Sellers can insert their own profile" ON public.sellers
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for drinks table
CREATE POLICY "Anyone can view available drinks" ON public.drinks
    FOR SELECT USING (
        is_available = true AND
        EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND is_available = true)
    );

CREATE POLICY "Sellers can manage their own drinks" ON public.drinks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND auth.uid() = id)
    );

-- RLS Policies for ratings table
CREATE POLICY "Anyone can view ratings" ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "Buyers can insert ratings" ON public.ratings
    FOR INSERT WITH CHECK (
        auth.uid() = buyer_id AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'buyer')
    );

CREATE POLICY "Buyers can update their own ratings" ON public.ratings
    FOR UPDATE USING (auth.uid() = buyer_id);

-- RLS Policies for favorites table
CREATE POLICY "Users can view their own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can manage their own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = buyer_id);

-- RLS Policies for contact_requests table
CREATE POLICY "Sellers can view their contact requests" ON public.contact_requests
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND auth.uid() = id)
    );

CREATE POLICY "Buyers can view their contact requests" ON public.contact_requests
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can insert contact requests" ON public.contact_requests
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update contact request status" ON public.contact_requests
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND auth.uid() = id)
    );

-- RLS Policies for seller_analytics table
CREATE POLICY "Sellers can view their own analytics" ON public.seller_analytics
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND auth.uid() = id)
    );

CREATE POLICY "Anyone can insert analytics" ON public.seller_analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for order_history table
CREATE POLICY "Buyers can view their own orders" ON public.order_history
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view their orders" ON public.order_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND auth.uid() = id)
    );

CREATE POLICY "Buyers can insert orders" ON public.order_history
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order status" ON public.order_history
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND auth.uid() = id)
    );

-- Additional useful functions

-- Function to get most favorited sellers
CREATE OR REPLACE FUNCTION get_most_favorited_sellers(result_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    business_name TEXT,
    address TEXT,
    photo_url TEXT,
    specialty TEXT,
    is_available BOOLEAN,
    rating_average DECIMAL,
    rating_count INTEGER,
    favorite_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.business_name,
        s.address,
        s.photo_url,
        s.specialty::TEXT,
        s.is_available,
        s.rating_average,
        s.rating_count,
        COUNT(f.id) as favorite_count
    FROM public.sellers s
    LEFT JOIN public.favorites f ON s.id = f.seller_id
    WHERE s.is_available = true
    GROUP BY s.id, s.business_name, s.address, s.photo_url, s.specialty, s.is_available, s.rating_average, s.rating_count
    ORDER BY favorite_count DESC, s.rating_average DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get seller dashboard stats
CREATE OR REPLACE FUNCTION get_seller_dashboard_stats(seller_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    profile_views INTEGER;
    contact_requests INTEGER;
    total_orders INTEGER;
    total_revenue DECIMAL;
    avg_rating DECIMAL;
BEGIN
    -- Get profile views (last 30 days)
    SELECT COUNT(*) INTO profile_views
    FROM public.seller_analytics
    WHERE seller_id = seller_uuid
      AND event_type = 'profile_view'
      AND created_at >= NOW() - INTERVAL '30 days';

    -- Get contact requests (last 30 days)
    SELECT COUNT(*) INTO contact_requests
    FROM public.contact_requests
    WHERE seller_id = seller_uuid
      AND created_at >= NOW() - INTERVAL '30 days';

    -- Get total orders and revenue
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0) INTO total_orders, total_revenue
    FROM public.order_history
    WHERE seller_id = seller_uuid;

    -- Get average rating
    SELECT rating_average INTO avg_rating
    FROM public.sellers
    WHERE id = seller_uuid;

    -- Build result JSON
    result := json_build_object(
        'profile_views', profile_views,
        'contact_requests', contact_requests,
        'total_orders', total_orders,
        'total_revenue', total_revenue,
        'average_rating', COALESCE(avg_rating, 0)
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search sellers with full-text search
CREATE OR REPLACE FUNCTION search_sellers_fulltext(
    search_query TEXT,
    user_lat DECIMAL DEFAULT NULL,
    user_lng DECIMAL DEFAULT NULL,
    radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    business_name TEXT,
    address TEXT,
    photo_url TEXT,
    specialty TEXT,
    is_available BOOLEAN,
    rating_average DECIMAL,
    rating_count INTEGER,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.business_name,
        s.address,
        s.photo_url,
        s.specialty::TEXT,
        s.is_available,
        s.rating_average,
        s.rating_count,
        CASE
            WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL
            THEN ROUND(
                ST_Distance(
                    ST_Point(user_lng, user_lat)::geography,
                    ST_Point(s.longitude, s.latitude)::geography
                ) / 1000, 2
            )
            ELSE NULL
        END AS distance_km
    FROM public.sellers s
    WHERE s.is_available = true
      AND (
          s.business_name ILIKE '%' || search_query || '%' OR
          s.address ILIKE '%' || search_query || '%' OR
          s.description ILIKE '%' || search_query || '%'
      )
      AND (
          user_lat IS NULL OR user_lng IS NULL OR s.latitude IS NULL OR s.longitude IS NULL OR
          ST_DWithin(
              ST_Point(user_lng, user_lat)::geography,
              ST_Point(s.longitude, s.latitude)::geography,
              radius_km * 1000
          )
      )
    ORDER BY
        CASE WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN distance_km END ASC,
        s.rating_average DESC;
END;
$$ LANGUAGE plpgsql;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
    ('avatars', 'avatars', true),
    ('seller-photos', 'seller-photos', true),
    ('drink-photos', 'drink-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Seller photos are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'seller-photos');

CREATE POLICY "Sellers can upload their own photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'seller-photos' AND
        EXISTS (SELECT 1 FROM public.sellers WHERE id = auth.uid())
    );

CREATE POLICY "Drink photos are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'drink-photos');

CREATE POLICY "Sellers can upload drink photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'drink-photos' AND
        EXISTS (SELECT 1 FROM public.sellers WHERE id = auth.uid())
    );
