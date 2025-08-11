/**
 * Test script for ORS geocoding functionality
 * This can be used to verify that the OpenRouteService integration is working correctly
 */

import { geocodeAddress, searchAddresses, reverseGeocode } from './geocoding';

export async function testGeocoding() {
  console.log('🧪 Testing ORS Geocoding Integration...');
  
  try {
    // Test 1: Geocode a specific address
    console.log('\n1. Testing address geocoding...');
    const result1 = await geocodeAddress('1600 Amphitheatre Parkway, Mountain View, CA');
    console.log('Geocoding result:', result1);
    
    // Test 2: Search for addresses
    console.log('\n2. Testing address search...');
    const results2 = await searchAddresses('Starbucks New York', 3);
    console.log('Search results:', results2);
    
    // Test 3: Reverse geocoding
    console.log('\n3. Testing reverse geocoding...');
    const result3 = await reverseGeocode(40.7128, -74.0060); // NYC coordinates
    console.log('Reverse geocoding result:', result3);
    
    console.log('\n✅ All geocoding tests completed!');
    return true;
  } catch (error) {
    console.error('❌ Geocoding test failed:', error);
    return false;
  }
}

// Function to test in browser console
(window as any).testGeocoding = testGeocoding;
