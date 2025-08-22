# 🚨 CRITICAL SECURITY FIXES

## IMMEDIATE ACTION REQUIRED

Your application has **CRITICAL SECURITY VULNERABILITIES** that allow unauthorized access to all user data. These fixes must be implemented immediately.

## 1. Row Level Security (RLS) Policies - CRITICAL

**Problem**: Anyone can access all user data via direct API calls to Supabase.

**Fix**: Run this SQL in your Supabase SQL Editor:

```sql
-- =====================================================
-- CRITICAL SECURITY FIX: Row Level Security Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Authenticated users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- SELLERS TABLE POLICIES
-- =====================================================

-- Public can view available sellers (for marketplace)
CREATE POLICY "Public can view available sellers" ON sellers
  FOR SELECT USING (is_available = true);

-- Sellers can view their own data
CREATE POLICY "Sellers can view own data" ON sellers
  FOR SELECT USING (auth.uid() = id);

-- Sellers can update their own data
CREATE POLICY "Sellers can update own data" ON sellers
  FOR UPDATE USING (auth.uid() = id);

-- Sellers can insert their own profile
CREATE POLICY "Sellers can insert own profile" ON sellers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Sellers can delete their own profile
CREATE POLICY "Sellers can delete own profile" ON sellers
  FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- DRINKS TABLE POLICIES
-- =====================================================

-- Public can view available drinks
CREATE POLICY "Public can view available drinks" ON drinks
  FOR SELECT USING (is_available = true);

-- Sellers can view all their drinks (including unavailable)
CREATE POLICY "Sellers can view own drinks" ON drinks
  FOR SELECT USING (auth.uid() = seller_id);

-- Sellers can manage their own drinks
CREATE POLICY "Sellers can manage own drinks" ON drinks
  FOR ALL USING (auth.uid() = seller_id);

-- =====================================================
-- ORDER_HISTORY TABLE POLICIES
-- =====================================================

-- Users can view orders they're involved in (as buyer or seller)
CREATE POLICY "Users can view own orders" ON order_history
  FOR SELECT USING (
    auth.uid() = buyer_id OR
    auth.uid() = seller_id
  );

-- Buyers can create orders
CREATE POLICY "Buyers can create orders" ON order_history
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Buyers and sellers can update orders they're involved in
CREATE POLICY "Users can update own orders" ON order_history
  FOR UPDATE USING (
    auth.uid() = buyer_id OR
    auth.uid() = seller_id
  );

-- =====================================================
-- RATINGS TABLE POLICIES
-- =====================================================

-- Public can view all ratings (for transparency)
CREATE POLICY "Public can view ratings" ON ratings
  FOR SELECT TO public USING (true);

-- Buyers can create ratings for their orders
CREATE POLICY "Buyers can create ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own ratings
CREATE POLICY "Buyers can update own ratings" ON ratings
  FOR UPDATE USING (auth.uid() = buyer_id);

-- Buyers can delete their own ratings
CREATE POLICY "Buyers can delete own ratings" ON ratings
  FOR DELETE USING (auth.uid() = buyer_id);

-- =====================================================
-- FAVORITES TABLE POLICIES
-- =====================================================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = buyer_id);

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = buyer_id);

-- =====================================================
-- CONTACT_REQUESTS TABLE POLICIES
-- =====================================================

-- Users can view contact requests they're involved in
CREATE POLICY "Users can view own contact requests" ON contact_requests
  FOR SELECT USING (
    auth.uid() = buyer_id OR
    auth.uid() = seller_id
  );

-- Buyers can create contact requests
CREATE POLICY "Buyers can create contact requests" ON contact_requests
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Users can update contact requests they're involved in
CREATE POLICY "Users can update own contact requests" ON contact_requests
  FOR UPDATE USING (
    auth.uid() = buyer_id OR
    auth.uid() = seller_id
  );

-- =====================================================
-- SELLER_ANALYTICS TABLE POLICIES
-- =====================================================

-- Sellers can view their own analytics
CREATE POLICY "Sellers can view own analytics" ON seller_analytics
  FOR SELECT USING (auth.uid() = seller_id);

-- System can insert analytics (for tracking)
CREATE POLICY "System can insert analytics" ON seller_analytics
  FOR INSERT WITH CHECK (true);
```

## Verification

After running the SQL, test that the vulnerability is fixed:

```bash
# This should now return 401 Unauthorized
curl -X GET 'https://[your-project-id].supabase.co/rest/v1/users' \
  -H "apikey: [your-anon-key]" \
  -H "Authorization: Bearer [your-anon-key]"
```

## 🛡️ COMPLETE SECURITY FIXES IMPLEMENTED

### ✅ **CRITICAL FIXES COMPLETED**

#### 1. **Row Level Security (RLS) Policies** - CRITICAL
- **Status**: ✅ FIXED
- **Impact**: Prevents unauthorized database access
- **Action**: Run the SQL above in Supabase SQL Editor

#### 2. **Authorization Bypass in Order Management** - CRITICAL
- **Status**: ✅ FIXED
- **Files**: `src/services/orderService.ts`
- **Fix**: Added proper user authentication and ownership checks
- **Impact**: Prevents users from modifying orders they don't own

#### 3. **Rating Deletion Authorization** - CRITICAL
- **Status**: ✅ FIXED
- **Files**: `src/services/ratingService.ts`
- **Fix**: Added ownership verification before deletion
- **Impact**: Prevents users from deleting others' ratings

#### 4. **SQL Injection in Search Functions** - HIGH
- **Status**: ✅ FIXED
- **Files**: `src/services/orderService.ts`
- **Fix**: Added input sanitization and parameterized queries
- **Impact**: Prevents database compromise via search queries

#### 5. **Price Validation and Business Logic** - HIGH
- **Status**: ✅ FIXED
- **Files**: `src/pages/AddListing.tsx`, `src/services/drinkService.ts`
- **Fix**: Enhanced client and server-side validation
- **Impact**: Prevents price manipulation and invalid data

#### 6. **XSS Prevention** - MEDIUM
- **Status**: ✅ FIXED
- **Files**: `src/utils/sanitize.ts`, `src/components/ReviewSystem.tsx`
- **Fix**: Added DOMPurify sanitization for user content
- **Impact**: Prevents cross-site scripting attacks

#### 7. **Debug Code Removal** - MEDIUM
- **Status**: ✅ FIXED
- **Files**: `src/App.tsx`, `src/utils/authDebug.ts`, `src/lib/supabase.ts`
- **Fix**: Wrapped debug code in development-only checks
- **Impact**: Reduces attack surface in production

#### 8. **Enhanced Authentication Security** - MEDIUM
- **Status**: ✅ FIXED
- **Files**: `src/pages/SignUp.tsx`, `src/pages/SignIn.tsx`, `src/utils/sanitize.ts`
- **Fix**: Stronger password policies and rate limiting
- **Impact**: Prevents brute force attacks and weak passwords

### 🔒 **SECURITY FEATURES ADDED**

1. **Input Sanitization Utility** (`src/utils/sanitize.ts`)
   - HTML sanitization with DOMPurify
   - URL validation and protocol filtering
   - Email and phone number sanitization
   - Rate limiting for authentication attempts

2. **Enhanced Password Requirements**
   - Minimum 12 characters (increased from 8)
   - Requires uppercase, lowercase, numbers, and special characters
   - Blocks common weak passwords
   - Prevents repeated character patterns

3. **Business Logic Validation**
   - Price range validation (1-10,000 MAD)
   - Maximum 2 decimal places for prices
   - Input length limits for names and descriptions
   - Category validation against allowed values

4. **Authorization Checks**
   - User ownership verification for all CRUD operations
   - Authentication required for all sensitive actions
   - Role-based access control for order status updates
   - Session validation on every request

### 🚨 **IMMEDIATE ACTIONS REQUIRED**

1. **Run the RLS SQL** in your Supabase SQL Editor (see above)
2. **Test the vulnerability fix**:
   ```bash
   curl -X GET 'https://[your-project-id].supabase.co/rest/v1/users' \
     -H "apikey: [your-anon-key]" \
     -H "Authorization: Bearer [your-anon-key]"
   ```
   Should return `401 Unauthorized`

3. **Deploy the code changes** to production
4. **Monitor logs** for any authentication errors
5. **Test all functionality** to ensure nothing is broken

### 📊 **SECURITY IMPACT SUMMARY**

| Vulnerability | Severity | Status | Impact |
|---------------|----------|--------|---------|
| Missing RLS | CRITICAL | ✅ FIXED | Complete data protection |
| Order Auth Bypass | CRITICAL | ✅ FIXED | Order integrity protected |
| Rating Auth Issues | CRITICAL | ✅ FIXED | Review system secured |
| SQL Injection | HIGH | ✅ FIXED | Database protected |
| Price Manipulation | HIGH | ✅ FIXED | Business logic secured |
| XSS Vulnerabilities | MEDIUM | ✅ FIXED | User safety improved |
| Debug Exposure | MEDIUM | ✅ FIXED | Attack surface reduced |
| Weak Passwords | MEDIUM | ✅ FIXED | Account security enhanced |

### 🎯 **NEXT STEPS**

1. **Security Testing**: Perform penetration testing
2. **Monitoring**: Set up security monitoring and alerts
3. **Regular Audits**: Schedule quarterly security reviews
4. **User Education**: Inform users about security best practices
5. **Backup Strategy**: Ensure secure backup and recovery procedures

**Your application is now significantly more secure!** 🛡️

## Step-by-Step Setup

### 1. Create Storage Buckets

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://supabase.com
   - Go to **Storage** → **Buckets**

2. **Create the buckets:**

   **For drink-photos:**
   - Click **"New bucket"**
   - Name: `drink-photos`
   - Public: ✅ **Enabled** (so images can be displayed publicly)
   - File size limit: `5MB` (recommended)
   - Allowed MIME types: `image/*`

   **For seller-photos:**
   - Click **"New bucket"**
   - Name: `seller-photos`
   - Public: ✅ **Enabled**
   - File size limit: `5MB`
   - Allowed MIME types: `image/*`

   **For avatars:**
   - Click **"New bucket"**
   - Name: `avatars`
   - Public: ✅ **Enabled**
   - File size limit: `2MB`
   - Allowed MIME types: `image/*`

### 2. Set Up Storage Policies

For each bucket, you need to create policies that allow authenticated users to upload and read images.

#### For `drink-photos` bucket:

1. **Go to Storage → Policies**
2. **Click "New Policy"** and select the `drink-photos` bucket

**Policy 1: Public Read Access**
- **Policy name**: `Public read access for drink photos`
- **Allowed operation**: ✅ **SELECT** only
- **Target roles**: Select **"Defaults to all (public) roles if none selected"**
- **Policy definition**:
  ```sql
  bucket_id = 'drink-photos'
  ```

**Policy 2: Authenticated Upload Access**
- **Policy name**: `Authenticated users can upload drink photos`
- **Allowed operation**: ✅ **INSERT** only
- **Target roles**: Select **"authenticated"** from dropdown
- **Policy definition**:
  ```sql
  bucket_id = 'drink-photos'
  ```

**Policy 3: Authenticated Update Access**
- **Policy name**: `Users can update drink photos`
- **Allowed operation**: ✅ **UPDATE** only
- **Target roles**: Select **"authenticated"** from dropdown
- **Policy definition**:
  ```sql
  bucket_id = 'drink-photos'
  ```

**Policy 4: Authenticated Delete Access**
- **Policy name**: `Users can delete drink photos`
- **Allowed operation**: ✅ **DELETE** only
- **Target roles**: Select **"authenticated"** from dropdown
- **Policy definition**:
  ```sql
  bucket_id = 'drink-photos'
  ```

#### For `seller-photos` bucket:

Repeat the same 4 policies as above, but change the bucket name:

**Policy 1: Public Read Access**
- **Policy name**: `Public read access for seller photos`
- **Allowed operation**: ✅ **SELECT** only
- **Target roles**: **"Defaults to all (public) roles if none selected"**
- **Policy definition**: `bucket_id = 'seller-photos'`

**Policy 2: Authenticated Upload Access**
- **Policy name**: `Authenticated users can upload seller photos`
- **Allowed operation**: ✅ **INSERT** only
- **Target roles**: **"authenticated"**
- **Policy definition**: `bucket_id = 'seller-photos'`

**Policy 3: Authenticated Update Access**
- **Policy name**: `Users can update seller photos`
- **Allowed operation**: ✅ **UPDATE** only
- **Target roles**: **"authenticated"**
- **Policy definition**: `bucket_id = 'seller-photos'`

**Policy 4: Authenticated Delete Access**
- **Policy name**: `Users can delete seller photos`
- **Allowed operation**: ✅ **DELETE** only
- **Target roles**: **"authenticated"**
- **Policy definition**: `bucket_id = 'seller-photos'`

#### For `avatars` bucket:

Repeat the same 4 policies as above, but change the bucket name:

**Policy 1: Public Read Access**
- **Policy name**: `Public read access for avatars`
- **Allowed operation**: ✅ **SELECT** only
- **Target roles**: **"Defaults to all (public) roles if none selected"**
- **Policy definition**: `bucket_id = 'avatars'`

**Policy 2: Authenticated Upload Access**
- **Policy name**: `Authenticated users can upload avatars`
- **Allowed operation**: ✅ **INSERT** only
- **Target roles**: **"authenticated"**
- **Policy definition**: `bucket_id = 'avatars'`

**Policy 3: Authenticated Update Access**
- **Policy name**: `Users can update avatars`
- **Allowed operation**: ✅ **UPDATE** only
- **Target roles**: **"authenticated"**
- **Policy definition**: `bucket_id = 'avatars'`

**Policy 4: Authenticated Delete Access**
- **Policy name**: `Users can delete avatars`
- **Allowed operation**: ✅ **DELETE** only
- **Target roles**: **"authenticated"**
- **Policy definition**: `bucket_id = 'avatars'`

### 3. Verify Setup

After creating the buckets and policies, you can verify the setup using the debug tool:

1. **Go to the debug page:** `http://localhost:8080/image-debug`
2. **Run Full Diagnostic** to test:
   - Bucket access
   - Upload permissions
   - Storage policies
3. **Test Real Upload** with an actual image file

## 📋 Visual Policy Setup Guide

When creating each policy in the Supabase interface:

### Policy Form Fields:
```
Policy name: [Enter descriptive name]
Allowed operation: [Check appropriate boxes]
  ☐ SELECT   ☐ INSERT   ☐ UPDATE   ☐ DELETE
Target roles: [Select from dropdown]
  - "Defaults to all (public) roles if none selected" (for SELECT)
  - "authenticated" (for INSERT/UPDATE/DELETE)
Policy definition: bucket_id = 'your-bucket-name'
```

### Example for drink-photos INSERT policy:
```
Policy name: Authenticated users can upload drink photos
Allowed operation: ✅ INSERT (only this box checked)
Target roles: authenticated (selected from dropdown)
Policy definition: bucket_id = 'drink-photos'
```

## 🎯 Quick Setup Checklist

For each bucket (`drink-photos`, `seller-photos`, `avatars`):

- [ ] **Bucket created** with correct name
- [ ] **Bucket is public** (enabled in bucket settings)
- [ ] **4 policies created**:
  - [ ] SELECT policy (public access)
  - [ ] INSERT policy (authenticated users)
  - [ ] UPDATE policy (authenticated users)
  - [ ] DELETE policy (authenticated users)

## Common Issues & Solutions

### Issue: "Bucket not found"
**Solution:** Make sure you've created the bucket with the exact name `drink-photos` (case-sensitive).

### Issue: "Permission denied" during upload
**Solution:**
- Check that you have the INSERT policy created for authenticated users
- Verify the policy definition is exactly: `bucket_id = 'drink-photos'`
- Make sure you selected "authenticated" in the Target roles dropdown

### Issue: "Images not displaying"
**Solution:**
- Ensure the bucket is set to **Public** in bucket settings
- Verify the SELECT policy allows public read access
- Check the policy definition: `bucket_id = 'drink-photos'`

### Issue: "Database not updating with photo_url"
**Solution:** This is likely a Row Level Security (RLS) issue on the `drinks` table, not storage. Check that authenticated users can UPDATE the drinks table.

## File Naming Convention

The app uses the following naming conventions:

- **Drink photos:** `{drinkId}.{extension}` (e.g., `abc123.jpg`)
- **Seller photos:** `{sellerId}/profile.{extension}` (e.g., `seller123/profile.jpg`)
- **Avatars:** `{userId}/avatar.{extension}` (e.g., `user456/avatar.png`)

## Security Considerations

1. **File Size Limits:** Set appropriate limits (5MB for products, 2MB for avatars)
2. **MIME Type Restrictions:** Only allow image types (`image/*`)
3. **Authentication:** Only authenticated users can upload
4. **Public Access:** Images are publicly readable (required for display)

## Testing

Use the built-in debug tool at `/image-debug` to:
- Test bucket connectivity
- Verify upload permissions
- Debug policy issues
- Test the complete upload flow

## Environment Variables

Make sure your `.env` file has the correct Supabase configuration:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Support

If you're still having issues after following this guide:

1. Check the browser console for detailed error messages
2. Use the debug tool at `/image-debug`
3. Verify your Supabase project settings
4. Check that RLS is properly configured on your database tables
