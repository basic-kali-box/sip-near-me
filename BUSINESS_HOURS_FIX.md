# Business Hours Profile Completion Fix

## Problem
The profile page was showing "Missing: Business hours" even when business hours were already set in the database.

## Root Cause
The issue was caused by timing problems in the profile loading sequence:

1. **Initial State**: Profile component starts with empty business hours from user context
2. **Background Loading**: UserContext loads seller details in background, but this happens asynchronously
3. **Early Check**: Profile completion check was running before seller details were fully loaded
4. **Missing Profile**: Some sellers might not have a complete seller profile in the database

## Solution Implemented

### 1. Added Profile Data Loading State
```typescript
const [profileDataLoaded, setProfileDataLoaded] = useState(false);
const [sellerProfileExists, setSellerProfileExists] = useState<boolean | null>(null);
```

### 2. Improved Loading Sequence
- Wait for seller details to load from database before showing completion check
- Track whether seller profile exists in database
- Set `profileDataLoaded` to true only after all data is loaded

### 3. Enhanced Validation Logic
```typescript
const isSellerProfileComplete = () => {
  if (user?.userType !== 'seller') return true;
  return !!(
    profile.businessName?.trim() &&
    profile.address?.trim() &&
    profile.businessHours?.trim() &&
    profile.businessHours !== 'null' && // Handle string 'null'
    profile.phone?.trim()
  );
};
```

### 4. Conditional Alert Display
```typescript
{user?.userType === 'seller' && profileDataLoaded && 
 (sellerProfileExists === false || !isSellerProfileComplete()) && (
  // Show completion alert
)}
```

### 5. Better Error Messages
- If seller profile doesn't exist: "Complete seller profile setup"
- If profile exists but missing fields: Show specific missing fields

## Key Changes Made

1. **Timing Fix**: Only show completion alert after `profileDataLoaded` is true
2. **Database Check**: Verify seller profile exists in database
3. **Null Handling**: Handle null/empty business hours properly
4. **Better Validation**: Trim whitespace and check for string 'null'
5. **Improved Logging**: Debug logs to track loading sequence

## Expected Behavior Now

1. **Fresh Seller**: Shows "Complete seller profile setup" if no database record
2. **Existing Seller**: Shows specific missing fields if profile incomplete
3. **Complete Seller**: No completion alert shown
4. **Loading State**: No premature alerts during data loading

## Testing
- Console logs show the loading sequence
- Profile completion check only runs after data is loaded
- Business hours are properly loaded from database
- Validation handles edge cases (null, empty, whitespace)

This fix ensures that the profile completion check is accurate and only shows when the seller actually needs to complete missing information.
