# BrewNear API Documentation

Complete API reference for the BrewNear marketplace backend services.

## 🔐 Authentication

### UserService

#### `getCurrentUserProfile()`
Get the current authenticated user's profile.

```typescript
const user = await UserService.getCurrentUserProfile();
```

**Returns:** `User | null`

#### `createUserProfile(userData)`
Create a new user profile after authentication.

```typescript
const user = await UserService.createUserProfile({
  id: 'uuid',
  email: 'user@example.com',
  name: 'John Doe',
  user_type: 'buyer'
});
```

**Parameters:**
- `userData: UserInsert` - User profile data

**Returns:** `User`

#### `updateUserProfile(userId, updates)`
Update user profile information.

```typescript
const user = await UserService.updateUserProfile('user-id', {
  name: 'New Name',
  phone: '+1234567890'
});
```

**Parameters:**
- `userId: string` - User ID
- `updates: UserUpdate` - Fields to update

**Returns:** `User`

#### `uploadAvatar(userId, file)`
Upload user avatar image.

```typescript
const avatarUrl = await UserService.uploadAvatar('user-id', file);
```

**Parameters:**
- `userId: string` - User ID
- `file: File` - Image file

**Returns:** `string` - Public URL of uploaded image

---

## 🏪 Seller Management

### SellerService

#### `getNearbySellers(latitude, longitude, filters?)`
Find sellers within specified radius with optional filters.

```typescript
const sellers = await SellerService.getNearbySellers(40.7128, -74.0060, {
  radiusKm: 10,
  specialty: 'coffee',
  isAvailable: true,
  minRating: 4.0
});
```

**Parameters:**
- `latitude: number` - User's latitude
- `longitude: number` - User's longitude
- `filters?: object` - Optional filters
  - `radiusKm?: number` - Search radius (default: 10)
  - `specialty?: 'coffee' | 'matcha' | 'both'` - Seller specialty
  - `isAvailable?: boolean` - Only available sellers
  - `minRating?: number` - Minimum rating

**Returns:** `Seller[]` with distance information

#### `getSellerById(sellerId, viewerId?)`
Get detailed seller information with menu items.

```typescript
const seller = await SellerService.getSellerById('seller-id', 'viewer-id');
```

**Parameters:**
- `sellerId: string` - Seller ID
- `viewerId?: string` - Optional viewer ID for analytics

**Returns:** `Seller & { drinks?: Drink[] } | null`

#### `createSellerProfile(sellerData)`
Create new seller profile.

```typescript
const seller = await SellerService.createSellerProfile({
  id: 'user-id',
  business_name: 'Coffee Shop',
  address: '123 Main St',
  phone: '+1234567890',
  specialty: 'coffee'
});
```

**Parameters:**
- `sellerData: SellerInsert` - Seller profile data

**Returns:** `Seller`

#### `toggleAvailability(sellerId)`
Toggle seller online/offline status.

```typescript
const isOnline = await SellerService.toggleAvailability('seller-id');
```

**Parameters:**
- `sellerId: string` - Seller ID

**Returns:** `boolean` - New availability status

#### `getSellerAnalytics(sellerId, days?)`
Get seller analytics and statistics.

```typescript
const analytics = await SellerService.getSellerAnalytics('seller-id', 30);
```

**Parameters:**
- `sellerId: string` - Seller ID
- `days?: number` - Number of days to analyze (default: 30)

**Returns:** Analytics object with views, contacts, orders, revenue

---

## 🍹 Drink Management

### DrinkService

#### `getDrinksBySeller(sellerId, includeUnavailable?)`
Get all drinks for a specific seller.

```typescript
const drinks = await DrinkService.getDrinksBySeller('seller-id', false);
```

**Parameters:**
- `sellerId: string` - Seller ID
- `includeUnavailable?: boolean` - Include unavailable drinks (default: false)

**Returns:** `Drink[]`

#### `createDrink(drinkData)`
Create new drink menu item.

```typescript
const drink = await DrinkService.createDrink({
  seller_id: 'seller-id',
  name: 'Matcha Latte',
  description: 'Premium ceremonial grade matcha',
  price: 5.50,
  category: 'matcha'
});
```

**Parameters:**
- `drinkData: DrinkInsert` - Drink information

**Returns:** `Drink`

#### `updateDrink(drinkId, updates)`
Update existing drink.

```typescript
const drink = await DrinkService.updateDrink('drink-id', {
  price: 6.00,
  is_available: false
});
```

**Parameters:**
- `drinkId: string` - Drink ID
- `updates: DrinkUpdate` - Fields to update

**Returns:** `Drink`

#### `uploadDrinkPhoto(drinkId, file)`
Upload drink photo.

```typescript
const photoUrl = await DrinkService.uploadDrinkPhoto('drink-id', file);
```

**Parameters:**
- `drinkId: string` - Drink ID
- `file: File` - Image file

**Returns:** `string` - Public URL of uploaded image

#### `searchDrinks(query, filters?)`
Search drinks by name with optional filters.

```typescript
const drinks = await DrinkService.searchDrinks('latte', {
  category: 'coffee',
  minPrice: 3.00,
  maxPrice: 8.00
});
```

**Parameters:**
- `query: string` - Search term
- `filters?: object` - Optional filters
  - `category?: string` - Drink category
  - `minPrice?: number` - Minimum price
  - `maxPrice?: number` - Maximum price
  - `sellerId?: string` - Specific seller

**Returns:** `Drink[]` with seller information

---

## ⭐ Rating System

### RatingService

#### `getSellerRatings(sellerId, limit?)`
Get all ratings for a seller.

```typescript
const ratings = await RatingService.getSellerRatings('seller-id', 10);
```

**Parameters:**
- `sellerId: string` - Seller ID
- `limit?: number` - Maximum number of ratings

**Returns:** Rating array with buyer information

#### `submitRating(ratingData)`
Submit or update a rating.

```typescript
const rating = await RatingService.submitRating({
  seller_id: 'seller-id',
  buyer_id: 'buyer-id',
  rating: 5,
  comment: 'Excellent service!',
  order_items: ['Matcha Latte', 'Croissant']
});
```

**Parameters:**
- `ratingData: RatingInsert` - Rating information

**Returns:** `Rating`

#### `getSellerRatingStats(sellerId)`
Get comprehensive rating statistics.

```typescript
const stats = await RatingService.getSellerRatingStats('seller-id');
```

**Parameters:**
- `sellerId: string` - Seller ID

**Returns:** Object with average rating, distribution, recent ratings

---

## ❤️ Favorites System

### FavoriteService

#### `getUserFavorites(buyerId)`
Get user's favorite sellers.

```typescript
const favorites = await FavoriteService.getUserFavorites('buyer-id');
```

**Parameters:**
- `buyerId: string` - Buyer ID

**Returns:** Favorite array with seller information

#### `toggleFavorite(buyerId, sellerId)`
Add or remove seller from favorites.

```typescript
const isFavorited = await FavoriteService.toggleFavorite('buyer-id', 'seller-id');
```

**Parameters:**
- `buyerId: string` - Buyer ID
- `sellerId: string` - Seller ID

**Returns:** `boolean` - New favorite status

#### `isFavorited(buyerId, sellerId)`
Check if seller is favorited.

```typescript
const isFav = await FavoriteService.isFavorited('buyer-id', 'seller-id');
```

**Parameters:**
- `buyerId: string` - Buyer ID
- `sellerId: string` - Seller ID

**Returns:** `boolean`

---

## 📦 Order Management

### OrderService

#### `createOrder(orderData)`
Create new order record.

```typescript
const order = await OrderService.createOrder({
  buyerId: 'buyer-id',
  sellerId: 'seller-id',
  items: [
    { id: 'drink-id', name: 'Latte', price: 5.00, quantity: 2 }
  ],
  totalAmount: 10.00,
  contactMethod: 'whatsapp',
  pickupTime: '2024-01-15T14:00:00Z',
  specialInstructions: 'Extra hot please'
});
```

**Parameters:**
- `orderData: object` - Order information
  - `buyerId: string` - Buyer ID
  - `sellerId: string` - Seller ID
  - `items: OrderItem[]` - Order items
  - `totalAmount: number` - Total price
  - `contactMethod: 'whatsapp' | 'phone'` - Contact method
  - `pickupTime?: string` - Pickup time
  - `specialInstructions?: string` - Special notes

**Returns:** `OrderHistory`

#### `getBuyerOrders(buyerId, status?)`
Get buyer's order history.

```typescript
const orders = await OrderService.getBuyerOrders('buyer-id', 'completed');
```

**Parameters:**
- `buyerId: string` - Buyer ID
- `status?: string` - Filter by status

**Returns:** Order array with seller information

#### `updateOrderStatus(orderId, status, updatedBy)`
Update order status.

```typescript
await OrderService.updateOrderStatus('order-id', 'completed', 'seller-id');
```

**Parameters:**
- `orderId: string` - Order ID
- `status: 'pending' | 'confirmed' | 'completed' | 'cancelled'` - New status
- `updatedBy: string` - User ID making the update

**Returns:** `OrderHistory`

---

## 🔄 Real-time Features

### Subscriptions

#### Seller Availability Changes
```typescript
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

#### New Seller Registrations
```typescript
const subscription = supabase
  .channel('new-sellers')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sellers'
  }, (payload) => {
    console.log('New seller registered:', payload);
  })
  .subscribe();
```

---

## 🗄️ Database Functions

### Location Queries

#### `find_nearby_sellers(lat, lng, radius)`
PostgreSQL function for location-based seller search.

```sql
SELECT * FROM find_nearby_sellers(40.7128, -74.0060, 10);
```

#### `search_sellers_fulltext(query, lat?, lng?, radius?)`
Full-text search with optional location filtering.

```sql
SELECT * FROM search_sellers_fulltext('coffee', 40.7128, -74.0060, 25);
```

### Analytics

#### `get_seller_dashboard_stats(seller_id)`
Get comprehensive seller statistics.

```sql
SELECT get_seller_dashboard_stats('seller-uuid');
```

#### `get_most_favorited_sellers(limit)`
Get most favorited sellers.

```sql
SELECT * FROM get_most_favorited_sellers(10);
```

---

## 🚨 Error Handling

All services use the `handleSupabaseError` utility for consistent error handling:

```typescript
try {
  const result = await SomeService.someMethod();
} catch (error) {
  // Error is already processed and user-friendly
  console.error(error.message);
}
```

Common error types:
- `PGRST301`: Resource not found
- `23505`: Duplicate entry
- `42501`: Permission denied

---

## 📊 Response Types

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  user_type: 'buyer' | 'seller';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
```

### Seller
```typescript
interface Seller {
  id: string;
  business_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  hours: string | null;
  photo_url: string | null;
  specialty: 'coffee' | 'matcha' | 'both';
  is_available: boolean;
  rating_average: number;
  rating_count: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}
```

### Drink
```typescript
interface Drink {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  category: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
```

This API provides comprehensive functionality for building a complete coffee/matcha marketplace application with real-time features, location-based search, and robust user management.
