# BrewNear Supabase Backend Setup Guide

This guide will help you set up the complete Supabase backend for the BrewNear coffee/matcha marketplace application.

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `brewnear-marketplace`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)
   - **Service role key** (starts with `eyJ...`) - Keep this secret!

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 4. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the schema

This will create:
- All necessary tables with proper relationships
- Row Level Security (RLS) policies
- Database functions for location queries and analytics
- Storage buckets for images
- Indexes for optimal performance

### 5. Enable Required Extensions

The schema automatically enables these extensions:
- **PostGIS**: For location-based queries
- **uuid-ossp**: For UUID generation

### 6. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following:

#### Email Settings
- **Enable email confirmations**: Recommended for production
- **Email templates**: Customize welcome and reset emails

#### URL Configuration
- **Site URL**: `http://localhost:8080` (development) or your production URL
- **Redirect URLs**: Add your domain(s)

#### Social Providers (Optional)
You can enable Google, Facebook, etc. for social login

### 7. Set Up Storage

The schema automatically creates storage buckets:
- `avatars`: User profile pictures
- `seller-photos`: Business photos
- `drink-photos`: Menu item images

Storage policies are configured to allow:
- Public read access to all images
- Users can only upload/update their own content

## 📊 Database Schema Overview

### Core Tables

#### Users (`users`)
- Extends Supabase auth.users
- Stores user profiles for both buyers and sellers
- Links to sellers table for seller-specific data

#### Sellers (`sellers`)
- Business information and settings
- Location data for proximity searches
- Availability status and ratings

#### Drinks (`drinks`)
- Menu items for each seller
- Pricing and availability
- Categories and descriptions

#### Ratings (`ratings`)
- 5-star rating system
- One rating per buyer per seller
- Automatic seller rating calculation

#### Additional Tables
- `favorites`: Buyer's favorite sellers
- `contact_requests`: Track buyer-seller communications
- `order_history`: Transaction records
- `seller_analytics`: View and interaction tracking

### Key Features

#### Location-Based Queries
```sql
-- Find sellers within 10km
SELECT * FROM find_nearby_sellers(40.7128, -74.0060, 10);
```

#### Real-time Subscriptions
- Seller availability changes
- New seller registrations
- Order status updates

#### Analytics Functions
```sql
-- Get seller dashboard stats
SELECT get_seller_dashboard_stats('seller-uuid');
```

## 🔒 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Public data (sellers, drinks, ratings) is readable by all
- Sellers can only modify their own content
- Buyers can only create their own orders and favorites

### Authentication
- JWT-based authentication
- Secure password hashing
- Email verification support
- Password reset functionality

## 🛠 Development Tools

### Supabase CLI (Optional)
For advanced development:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local development
supabase init

# Start local development
supabase start

# Generate TypeScript types
supabase gen types typescript --local > src/lib/database.types.ts
```

### Database Migrations
For production deployments, consider using migrations:

```bash
# Create migration
supabase migration new initial_schema

# Apply migrations
supabase db push
```

## 📱 API Usage Examples

### Authentication
```typescript
import { supabase } from '@/lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      name: 'John Doe',
      user_type: 'buyer'
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### Data Operations
```typescript
// Get nearby sellers
const { data, error } = await supabase
  .rpc('find_nearby_sellers', {
    user_lat: 40.7128,
    user_lng: -74.0060,
    radius_km: 10
  });

// Create seller profile
const { data, error } = await supabase
  .from('sellers')
  .insert({
    business_name: 'Coffee Shop',
    address: '123 Main St',
    specialty: 'coffee'
  });
```

### Real-time Subscriptions
```typescript
// Subscribe to seller availability changes
const subscription = supabase
  .channel('seller-availability')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'sellers',
    filter: 'is_available=eq.true'
  }, (payload) => {
    console.log('Seller availability changed:', payload);
  })
  .subscribe();
```

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Database Optimization
- Enable connection pooling
- Set up read replicas for high traffic
- Configure backup schedules
- Monitor query performance

### Security Checklist
- [ ] RLS policies tested and verified
- [ ] Service role key kept secure
- [ ] CORS settings configured
- [ ] Rate limiting enabled
- [ ] SSL certificates configured

## 📞 Support

### Supabase Resources
- [Documentation](https://supabase.com/docs)
- [Community Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

### BrewNear Specific
- Check the service files in `src/services/` for API usage examples
- Review the database types in `src/lib/database.types.ts`
- Test with the provided mock data and functions

## 🎉 You're Ready!

Your BrewNear backend is now fully configured with:
- ✅ Complete database schema
- ✅ Authentication system
- ✅ File storage
- ✅ Real-time subscriptions
- ✅ Location-based queries
- ✅ Security policies
- ✅ Analytics functions

Start your development server and begin building the future of local coffee/matcha marketplaces! ☕🍃
