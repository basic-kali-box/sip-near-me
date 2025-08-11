# Google OAuth Setup Guide for BrewNear

## 🔑 Your Google Client ID
```
750298159534-05hfkft27aq028ggm02rebkivh4gogsf.apps.googleusercontent.com
```

## 🚀 Quick Setup Steps

### Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Select your project** (or create a new one)
3. **Enable APIs**:
   - Go to **APIs & Services** → **Library**
   - Enable **Google+ API**
   - Enable **People API** (recommended)

4. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Choose **External** (for public app)
   - Fill required fields:
     ```
     App name: BrewNear
     User support email: your-email@domain.com
     Developer contact: your-email@domain.com
     ```
   - Add scopes: `email`, `profile`, `openid`

5. **Update OAuth Credentials**:
   - Go to **APIs & Services** → **Credentials**
   - Find your existing OAuth 2.0 Client ID
   - Edit the configuration:

   **Authorized JavaScript origins:**
   ```
   http://localhost:8081
   http://localhost:3000
   https://your-production-domain.com
   ```

   **Authorized redirect URIs:**
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   
   ⚠️ **Replace `your-project-ref`** with your actual Supabase project reference

### Step 2: Configure Supabase

1. **Go to Supabase Dashboard**: https://supabase.com
2. **Navigate to your project**
3. **Enable Google Provider**:
   - Go to **Authentication** → **Providers**
   - Find **Google** and toggle it **ON**

4. **Add OAuth Credentials**:
   - **Client ID**: `750298159534-05hfkft27aq028ggm02rebkivh4gogsf.apps.googleusercontent.com`
   - **Client Secret**: [Get this from Google Cloud Console]
   - **Redirect URL**: `https://your-project-ref.supabase.co/auth/v1/callback`

### Step 3: Environment Variables

Create/update your `.env` file:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=750298159534-05hfkft27aq028ggm02rebkivh4gogsf.apps.googleusercontent.com
```

## 🔍 Finding Your Supabase Project Reference

Your Supabase URL looks like: `https://abcdefghijklmnop.supabase.co`

The project reference is: `abcdefghijklmnop`

So your redirect URI should be: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

## ✅ Verification Checklist

- [ ] Google+ API enabled in Google Cloud Console
- [ ] OAuth consent screen configured
- [ ] Authorized origins include your domains
- [ ] Redirect URI matches Supabase callback URL exactly
- [ ] Google provider enabled in Supabase
- [ ] Client ID added to Supabase: `750298159534-05hfkft27aq028ggm02rebkivh4gogsf.apps.googleusercontent.com`
- [ ] Client Secret added to Supabase
- [ ] Environment variables set correctly

## 🧪 Testing

1. **Clear browser cache and localStorage**
2. **Open browser console** to see debug logs
3. **Try Google sign-in**
4. **Check console for detailed error messages**

## 🔧 Common Issues

| Error | Solution |
|-------|----------|
| `provider is not enabled` | Enable Google in Supabase Authentication → Providers |
| `invalid_client` | Check Client ID and Secret in Supabase match Google Console |
| `redirect_uri_mismatch` | Ensure redirect URI in Google Console exactly matches Supabase callback |
| `access_denied` | User cancelled or OAuth consent screen not published |

## 📞 Debug Information

The app now includes detailed logging. Check browser console for:
- OAuth configuration status
- Client ID verification
- Redirect URI validation
- Environment variable checks

## 🌐 Production Deployment

When deploying to production:

1. **Add production domain** to Google Console authorized origins
2. **Update Supabase Site URL** to your production domain
3. **Verify redirect URI** still points to Supabase callback

## 🔒 Security Notes

- Client ID is safe to expose in frontend code
- Keep Client Secret secure (only in Supabase dashboard)
- Redirect URI must exactly match configured values
- Use HTTPS in production
