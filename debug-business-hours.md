# Business Hours Debug Guide

## Issue
The profile shows "Missing: Business hours" even when business hours are set in the database.

## Debug Steps

### 1. Check Console Logs
Open browser console and look for these logs when visiting `/profile`:

```
🔍 Initial profile state: { businessHours: "...", userBusinessHours: "..." }
🔍 Loading seller details - hours from DB: "..."
✅ Profile updated with business hours: "..."
🔍 Full profile state after update: { businessHours: "..." }
🔍 Profile completeness check: { isComplete: false, businessHours: false, businessHoursValue: "..." }
🔍 Business hours missing check: { businessHours: "...", isNull: false }
```

### 2. Check Database
Verify business hours are actually stored:
```sql
SELECT id, business_name, hours FROM sellers WHERE id = 'your-user-id';
```

### 3. Check User Context
The UserContext loads business hours in background. Check if:
- User object initially has no businessHours
- Background loading updates the user object
- Profile component loads seller details separately

### 4. Timing Issues
The issue might be:
1. Profile completion check runs before seller details load
2. Business hours are null/empty in database
3. Business hours format is invalid
4. Profile state not updating correctly

### 5. Expected Flow
1. User loads → UserContext creates user object (no business hours initially)
2. Profile component loads → Fetches seller details from database
3. Profile state updates with business hours from database
4. Profile completion check should now pass

### 6. Possible Solutions
- Ensure `profileDataLoaded` state prevents early completion checks
- Handle null/empty business hours properly
- Verify database has valid business hours format
- Check if seller profile exists in database

## Test Cases
1. Fresh seller with no business hours set
2. Existing seller with business hours in database
3. Seller with invalid business hours format
4. Network/database errors during loading
