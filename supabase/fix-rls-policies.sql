-- Fix RLS policies to allow manual user profile creation
-- Run this in Supabase SQL Editor to fix the "Permission denied" error

-- Drop the existing RLS policy that's too restrictive
DROP POLICY IF EXISTS "Authenticated users can create their profile" ON public.users;

-- Create a more permissive policy for user profile creation
-- This allows profile creation immediately after signup when session might not be fully established
CREATE POLICY "Allow profile creation for authenticated users" ON public.users
    FOR INSERT WITH CHECK (
        -- Allow if the user is authenticated OR if it's a service role operation
        auth.role() = 'authenticated' OR
        auth.role() = 'anon' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Also ensure users can still view and update their own profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create an RPC function to create user profiles (bypasses RLS)
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    user_type_val user_type,
    user_phone TEXT DEFAULT NULL,
    user_avatar_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        user_type,
        phone,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        user_name,
        user_type_val,
        user_phone,
        user_avatar_url,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        user_type = EXCLUDED.user_type,
        phone = EXCLUDED.phone,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();

    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the policies are set correctly
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

SELECT 'RLS policies and RPC function created for profile creation' as status;
