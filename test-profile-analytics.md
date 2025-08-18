# Profile Analytics Test Plan

## Test Cases

### 1. Seller Profile Analytics Loading
**Steps:**
1. Login as a seller
2. Navigate to `/profile`
3. Verify analytics show real data (not hardcoded values)
4. Check that loading states appear briefly

**Expected Results:**
- Profile Views: Shows actual count from `seller_analytics` table
- Contact Requests: Shows actual count from `contact_requests` table  
- Menu Items: Shows actual count from `drinks` table
- Loading indicators appear during data fetch

### 2. Business Hours Database Integration
**Steps:**
1. Login as a seller
2. Navigate to `/profile`
3. Click "Edit Profile"
4. Modify business hours using the BusinessHoursInput component
5. Save changes
6. Refresh page and verify hours persist

**Expected Results:**
- Business hours load from database on page load
- Changes are saved to `sellers.hours` column
- Hours persist after page refresh
- Console shows loading and saving messages

### 3. Analytics Refresh Functionality
**Steps:**
1. Login as a seller
2. Navigate to `/profile`
3. Click "Refresh Analytics" button in Quick Actions
4. Verify loading state and updated data

**Expected Results:**
- Button shows loading spinner during refresh
- Analytics data updates with latest values
- Button is disabled during loading

### 4. Error Handling
**Steps:**
1. Simulate network error or database unavailability
2. Navigate to `/profile` as seller
3. Verify graceful error handling

**Expected Results:**
- Analytics show default values (0) if loading fails
- Console shows warning messages
- Page remains functional

## Database Tables Involved
- `seller_analytics` - Profile views tracking
- `contact_requests` - Contact requests from buyers
- `order_history` - Orders and revenue data
- `sellers` - Business hours and rating data
- `drinks` - Menu items count

## Console Logs to Check
- "🔍 Loading seller details - hours from DB: [hours]"
- "💾 Saving business hours: [hours]"
- "✅ Business hours saved successfully"
- "✅ Profile updated with business hours: [hours]"
