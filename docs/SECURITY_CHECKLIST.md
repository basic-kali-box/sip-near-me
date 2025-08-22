# Security Checklist & Hardening Guide

## 🚨 IMMEDIATE ACTIONS (CRITICAL)

### 1. Rotate Exposed API Keys
- [ ] **OpenRoute Service**: Generate new API key at https://openrouteservice.org/dev/#/home
- [ ] **Supabase**: Review if anon key rotation is needed (usually not required if RLS is proper)
- [ ] **Google OAuth**: Review client ID usage and domain restrictions

### 2. Verify Row Level Security (RLS)
- [ ] Check all Supabase tables have RLS enabled
- [ ] Review and test RLS policies
- [ ] Ensure users can only access their own data

### 3. API Key Restrictions
- [ ] Add domain restrictions to OpenRoute Service API key
- [ ] Configure Google OAuth authorized domains
- [ ] Set up Supabase domain restrictions if available

## 🛡️ SECURITY HARDENING

### Database Security (Supabase)
- [ ] Enable RLS on ALL tables
- [ ] Review and strengthen RLS policies
- [ ] Implement proper user authentication checks
- [ ] Set up database activity monitoring
- [ ] Regular backup verification

### API Security
- [ ] Implement rate limiting on API endpoints
- [ ] Add request validation and sanitization
- [ ] Set up API usage monitoring
- [ ] Configure CORS properly
- [ ] Add request logging

### Frontend Security
- [ ] Implement Content Security Policy (CSP)
- [ ] Add security headers (HSTS, X-Frame-Options, etc.)
- [ ] Validate all user inputs
- [ ] Sanitize data before display
- [ ] Implement proper error handling (don't expose sensitive info)

### Authentication & Authorization
- [ ] Implement proper session management
- [ ] Add multi-factor authentication (MFA) for admin accounts
- [ ] Set up proper password policies
- [ ] Implement account lockout mechanisms
- [ ] Regular security audits of user permissions

## 🔍 MONITORING & ALERTING

### Set Up Monitoring
- [ ] API usage monitoring
- [ ] Failed authentication attempts
- [ ] Unusual database access patterns
- [ ] Error rate monitoring
- [ ] Performance monitoring

### Alerting
- [ ] High API usage alerts
- [ ] Failed login attempt alerts
- [ ] Database error alerts
- [ ] Security incident response plan

## 📋 REGULAR SECURITY TASKS

### Weekly
- [ ] Review API usage patterns
- [ ] Check for failed authentication attempts
- [ ] Monitor error logs

### Monthly
- [ ] Security dependency updates
- [ ] Review user access permissions
- [ ] API key rotation (if needed)
- [ ] Security policy review

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Backup and recovery testing
- [ ] Security training for team

## 🔧 IMPLEMENTATION STEPS

### 1. Supabase RLS Policies Example
```sql
-- Example RLS policy for drinks table
CREATE POLICY "Users can view available drinks" ON drinks
  FOR SELECT USING (is_available = true);

CREATE POLICY "Sellers can manage own drinks" ON drinks
  FOR ALL USING (auth.uid() = seller_id);
```

### 2. Environment Variables Security
```bash
# Use different keys for different environments
VITE_SUPABASE_URL_DEV=your_dev_url
VITE_SUPABASE_URL_PROD=your_prod_url
VITE_ORS_API_KEY_DEV=your_dev_key
VITE_ORS_API_KEY_PROD=your_prod_key
```

### 3. Security Headers (Vercel)
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 🚨 INCIDENT RESPONSE

### If Security Breach Detected
1. **Immediate**: Rotate all API keys
2. **Assess**: Determine scope of breach
3. **Contain**: Block unauthorized access
4. **Investigate**: Review logs and access patterns
5. **Notify**: Inform affected users if needed
6. **Document**: Record incident and lessons learned
7. **Improve**: Update security measures

### Emergency Contacts
- [ ] Set up security incident response team
- [ ] Document escalation procedures
- [ ] Prepare communication templates

## 📚 RESOURCES

- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Checklist](https://web.dev/security-checklist/)
- [Vercel Security Headers](https://vercel.com/docs/edge-network/headers)

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular reviews and updates are essential.
