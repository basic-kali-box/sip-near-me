# Seller Registration Flow Test

## Test Steps

### 1. Navigate to Signup Page
- Go to `http://localhost:8081/signup`
- Select "Seller" as user type
- Fill out the form:
  - Name: "Test Seller"
  - Email: "testseller@example.com"
  - Password: "TestPassword123"
  - Confirm Password: "TestPassword123"
  - Accept Terms: ✓

### 2. Submit Registration
- Click "Create Seller Account"
- Should see loading state
- Should redirect to `/complete-profile`

### 3. Complete Profile Page
- Should show "Completing profile as: Seller"
- Fill out seller-specific fields:
  - Business Name: "Test Coffee Shop"
  - Business Address: "123 Main St, Test City, TS 12345"
  - Phone Number: "+1 (555) 123-4567"
  - Specialty: "Both Coffee & Matcha"
  - Business Hours: "Mon-Fri: 7AM-7PM, Sat-Sun: 8AM-6PM"

### 4. Submit Profile
- Click "Complete Seller Profile"
- Should see loading state with spinner
- Should show success toast
- Should redirect to `/seller-dashboard`

## Expected Results

### Database Records
1. **users table**: New record with user_type = 'seller'
2. **sellers table**: New record with business information

### Navigation Flow
1. `/signup` → `/complete-profile` → `/seller-dashboard`

### User State
- User should be authenticated
- User should have seller type
- User should have complete profile data

## Console Logs to Check

Look for these log messages in browser console:
- 🔐 Starting registration for: testseller@example.com as seller
- ✅ Auth user created: [user-id]
- ✅ User profile created successfully
- ✅ Registration completed successfully
- 🔄 Starting profile completion for user type: seller
- ✅ Auth user found: [user-id]
- ✅ User profile updated successfully
- 🔄 Creating seller profile...
- ✅ Seller profile created successfully
- ✅ Profile completion successful, redirecting...

## Troubleshooting

### If Registration Hangs
- Check browser console for timeout errors
- Check network tab for pending requests
- Verify Supabase connection

### If Profile Creation Fails
- Check seller profile creation logs
- Verify database permissions
- Check for duplicate key errors

### If Navigation Fails
- Check user authentication state
- Verify route configuration
- Check for JavaScript errors
