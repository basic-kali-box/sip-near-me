// Manual test file for seller profile validation
// This can be imported and run in the browser console for testing

import { validateSellerProfile, isSellerProfileComplete, getMissingFieldsSummary } from './sellerProfileValidation';
import { Seller } from '@/lib/database.types';

// Test data
const completeSeller: Seller['Row'] = {
  id: 'test-id',
  name: 'John Doe',
  business_name: 'Coffee Shop',
  address: '123 Main St',
  latitude: 40.7128,
  longitude: -74.0060,
  phone: '+1234567890',
  hours: 'Mon-Fri: 9AM-5PM',
  photo_url: null,
  specialty: 'coffee',
  is_available: true,
  rating_average: 4.5,
  rating_count: 10,
  description: 'Great coffee shop',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

const incompleteSeller: Seller['Row'] = {
  ...completeSeller,
  business_name: '', // Missing business name
  phone: '', // Missing phone
  hours: null // Missing hours
};

export function runSellerValidationTests() {
  console.log('🧪 Running Seller Profile Validation Tests...');
  
  // Test 1: Complete seller profile
  console.log('\n📋 Test 1: Complete seller profile');
  const completeResult = validateSellerProfile(completeSeller);
  console.log('Result:', completeResult);
  console.log('Is complete:', completeResult.isComplete);
  console.log('Summary:', getMissingFieldsSummary(completeResult));
  
  // Test 2: Incomplete seller profile
  console.log('\n📋 Test 2: Incomplete seller profile');
  const incompleteResult = validateSellerProfile(incompleteSeller);
  console.log('Result:', incompleteResult);
  console.log('Is complete:', incompleteResult.isComplete);
  console.log('Missing fields:', incompleteResult.missingFields);
  console.log('Summary:', getMissingFieldsSummary(incompleteResult));
  
  // Test 3: Null seller profile
  console.log('\n📋 Test 3: Null seller profile');
  const nullResult = validateSellerProfile(null);
  console.log('Result:', nullResult);
  console.log('Is complete:', nullResult.isComplete);
  console.log('Summary:', getMissingFieldsSummary(nullResult));
  
  // Test 4: Invalid phone number
  console.log('\n📋 Test 4: Invalid phone number');
  const invalidPhoneSeller = { ...completeSeller, phone: '123' };
  const invalidPhoneResult = validateSellerProfile(invalidPhoneSeller);
  console.log('Result:', invalidPhoneResult);
  console.log('Is complete:', invalidPhoneResult.isComplete);
  console.log('Summary:', getMissingFieldsSummary(invalidPhoneResult));
  
  console.log('\n✅ All tests completed!');
  
  return {
    completeResult,
    incompleteResult,
    nullResult,
    invalidPhoneResult
  };
}

// Make it available globally for browser console testing
(window as any).runSellerValidationTests = runSellerValidationTests;
