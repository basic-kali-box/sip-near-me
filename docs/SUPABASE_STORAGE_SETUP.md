# Supabase Storage Setup for Image Uploads

## Overview

This guide will help you set up Supabase Storage for handling image uploads in the BrewNear app. The app requires specific storage buckets and policies to function correctly.

## Required Storage Buckets

The app uses the following storage buckets:

1. **`drink-photos`** - For product/drink images
2. **`seller-photos`** - For seller profile images
3. **`avatars`** - For user avatar images

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
