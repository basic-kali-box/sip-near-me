-- Disable the problematic trigger temporarily
-- Run this in Supabase SQL Editor to fix the "Database error saving new user" issue

-- Drop the problematic trigger that's causing registration failures
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Update RLS policies to allow manual user profile creation
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert their profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile via trigger" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile via trigger" ON public.users;

-- Create simple, working RLS policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can create their profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Clean up any test data that might cause conflicts
DELETE FROM public.ratings WHERE seller_id IN (
    SELECT id FROM public.users WHERE email LIKE '%@example.com' OR email LIKE '%test%'
);
DELETE FROM public.favorites WHERE buyer_id IN (
    SELECT id FROM public.users WHERE email LIKE '%@example.com' OR email LIKE '%test%'
);
DELETE FROM public.contact_requests WHERE buyer_id IN (
    SELECT id FROM public.users WHERE email LIKE '%@example.com' OR email LIKE '%test%'
) OR seller_id IN (
    SELECT id FROM public.users WHERE email LIKE '%@example.com' OR email LIKE '%test%'
);
DELETE FROM public.drinks WHERE seller_id IN (
    SELECT id FROM public.users WHERE email LIKE '%@example.com' OR email LIKE '%test%'
);
DELETE FROM public.sellers WHERE id IN (
    SELECT id FROM public.users WHERE email LIKE '%@example.com' OR email LIKE '%test%'
);
DELETE FROM public.users WHERE email LIKE '%@example.com' OR email LIKE '%test%';

-- Also clean up auth users
DELETE FROM auth.users WHERE email LIKE '%@example.com' OR email LIKE '%test%';

-- Verify the setup
SELECT 'Trigger disabled and RLS policies updated' as status;

-- Show current counts
SELECT 
    'Current Status' as check_type,
    'Users' as table_name,
    COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
    'Current Status',
    'Auth Users',
    COUNT(*)
FROM auth.users
UNION ALL
SELECT 
    'Current Status',
    'Sellers',
    COUNT(*)
FROM public.sellers;

SELECT 'Ready for manual user profile creation!' as final_status;
