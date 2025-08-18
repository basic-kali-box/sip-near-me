# Disable Email Confirmation in Supabase

## Problem
Users are getting "Email not confirmed" errors when trying to sign in after registration.

## Solution
You need to disable email confirmation in your Supabase project settings.

## Steps to Fix

### 1. Go to Supabase Dashboard
1. Open your browser and go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project

### 2. Navigate to Authentication Settings
1. In the left sidebar, click on **"Authentication"**
2. Click on **"Settings"** (under Authentication)

### 3. Disable Email Confirmation
1. Scroll down to find **"User Signups"** section
2. Look for **"Enable email confirmations"** toggle
3. **Turn OFF** the "Enable email confirmations" toggle
4. Click **"Save"** to apply the changes

### 4. Alternative: Enable Auto-Confirm
If you can't find the toggle above, look for:
1. **"Email Auth"** section
2. **"Confirm email"** setting
3. Set it to **"Disabled"** or **"Auto-confirm"**

### 5. Verify the Change
1. The setting should now show email confirmation as disabled
2. New user registrations will not require email confirmation
3. Existing users who haven't confirmed their email should now be able to sign in

## Additional Configuration (Optional)

### For Development Environment
If you want to completely bypass email verification for development:

1. Go to **Authentication → Settings**
2. Under **"Site URL"**, make sure your local development URL is listed:
   - `http://localhost:8081`
   - `http://localhost:3000` (if using different port)

### For Production
For production, you might want to:
1. Keep email confirmation enabled for security
2. Set up proper email templates
3. Configure SMTP settings for reliable email delivery

## Testing
After making these changes:
1. Try registering a new user
2. The user should be able to sign in immediately without email confirmation
3. No "Email not confirmed" errors should occur

## Troubleshooting

### If you still get email confirmation errors:
1. **Clear browser cache and cookies**
2. **Wait 5-10 minutes** for Supabase settings to propagate
3. **Check the browser console** for any additional error messages
4. **Verify the setting was saved** by refreshing the Supabase dashboard

### If the toggle is not visible:
1. Make sure you have **admin/owner** permissions on the project
2. Try refreshing the Supabase dashboard
3. Check if you're on the correct project

### Alternative SQL Method (Advanced)
If the UI method doesn't work, you can run this SQL in the Supabase SQL Editor:

```sql
-- Check current auth settings
SELECT * FROM auth.config;

-- This is for reference only - settings should be changed via dashboard
```

## Important Notes
- ⚠️ **Security**: Disabling email confirmation reduces security
- 🔄 **Changes take effect immediately** for new signups
- 👥 **Existing unconfirmed users** will be able to sign in
- 🚀 **Better for development** and testing environments

## Support
If you continue to have issues:
1. Check Supabase documentation: [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
2. Contact Supabase support
3. Check the Supabase community forums
