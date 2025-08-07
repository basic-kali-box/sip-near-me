# 🧪 Authentication Test Guide

After running the SQL fix (`supabase/disable-trigger.sql`), test the authentication flow:

## ✅ Test Registration

### Test 1: Buyer Registration
1. Go to `/signup`
2. Fill out form:
   - **Email**: `buyer@test.com`
   - **Password**: `password123`
   - **Name**: `Test Buyer`
   - **User Type**: Select "Find Drinks" (buyer)
3. Click **Sign Up**
4. **Expected**: Success, redirected to home page

### Test 2: Seller Registration
1. Go to `/signup`
2. Fill out form:
   - **Email**: `seller@test.com`
   - **Password**: `password123`
   - **Name**: `Test Seller`
   - **User Type**: Select "Sell Drinks" (seller)
   - **Business Name**: `Test Coffee Shop`
   - **Business Address**: `123 Test St`
   - **Specialty**: `Coffee`
3. Click **Sign Up**
4. **Expected**: Success, redirected to seller dashboard

## ✅ Test Login

### Test 3: Buyer Login
1. Go to `/signin`
2. Use credentials from Test 1
3. **Expected**: Success, redirected to home page

### Test 4: Seller Login
1. Go to `/signin`
2. Use credentials from Test 2
3. **Expected**: Success, redirected to seller dashboard

## 🔍 Verify Database

After successful registration, check in Supabase:

### Check Users Table
```sql
SELECT id, email, name, user_type FROM public.users ORDER BY created_at DESC LIMIT 5;
```
**Expected**: See your test users

### Check Sellers Table
```sql
SELECT id, business_name, specialty FROM public.sellers ORDER BY created_at DESC LIMIT 5;
```
**Expected**: See seller profiles for seller accounts

### Check Auth Users
```sql
SELECT id, email, email_confirmed_at FROM auth.users ORDER BY created_at DESC LIMIT 5;
```
**Expected**: See auth records for your test users

## 🚨 If Tests Fail

### Registration Still Fails
1. Check browser console for errors
2. Verify SQL script was run successfully
3. Check Supabase logs in Dashboard → Logs → Database

### Login Fails
1. Verify user exists in both `auth.users` and `public.users`
2. Check if email confirmation is required
3. Try password reset if needed

### Profile Not Created
1. Check RLS policies are correct
2. Verify user has permission to insert into `public.users`
3. Check for any foreign key constraint errors

## ✅ Success Indicators

When everything works correctly:
- ✅ No "Database error saving new user" errors
- ✅ Registration completes without errors
- ✅ User profile appears in database
- ✅ Login works immediately after registration
- ✅ Correct navigation based on user type
- ✅ No console errors

## 🎉 Ready for Production

Once tests pass, your authentication is production-ready!
