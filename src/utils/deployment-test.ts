/**
 * Deployment verification tests for Vercel
 * Run these tests after deployment to verify all features work
 */

import { geocodeAddress, searchAddresses, reverseGeocode } from './geocoding';

export interface DeploymentTestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export async function runDeploymentTests(): Promise<DeploymentTestResult[]> {
  const results: DeploymentTestResult[] = [];
  
  console.log('🧪 Running deployment verification tests...');

  // Test 1: Environment Variables
  try {
    const orsKey = import.meta.env.VITE_ORS_API_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!orsKey) {
      results.push({
        test: 'Environment Variables',
        status: 'fail',
        message: 'VITE_ORS_API_KEY is missing'
      });
    } else if (!supabaseUrl || !supabaseKey) {
      results.push({
        test: 'Environment Variables',
        status: 'warning',
        message: 'Supabase environment variables missing'
      });
    } else {
      results.push({
        test: 'Environment Variables',
        status: 'pass',
        message: 'All environment variables present'
      });
    }
  } catch (error) {
    results.push({
      test: 'Environment Variables',
      status: 'fail',
      message: 'Failed to check environment variables',
      details: error
    });
  }

  // Test 2: ORS Geocoding API
  try {
    const geocodeResult = await geocodeAddress('New York, NY');
    if (geocodeResult && geocodeResult.coordinates) {
      results.push({
        test: 'ORS Geocoding',
        status: 'pass',
        message: 'Geocoding API working correctly',
        details: geocodeResult
      });
    } else {
      results.push({
        test: 'ORS Geocoding',
        status: 'fail',
        message: 'Geocoding returned no results'
      });
    }
  } catch (error) {
    results.push({
      test: 'ORS Geocoding',
      status: 'fail',
      message: 'Geocoding API failed',
      details: error
    });
  }

  // Test 3: Address Search
  try {
    const searchResults = await searchAddresses('Starbucks', 3);
    if (searchResults && searchResults.length > 0) {
      results.push({
        test: 'Address Search',
        status: 'pass',
        message: `Found ${searchResults.length} search results`,
        details: searchResults
      });
    } else {
      results.push({
        test: 'Address Search',
        status: 'warning',
        message: 'Address search returned no results'
      });
    }
  } catch (error) {
    results.push({
      test: 'Address Search',
      status: 'fail',
      message: 'Address search failed',
      details: error
    });
  }

  // Test 4: Reverse Geocoding
  try {
    const address = await reverseGeocode(40.7128, -74.0060); // NYC coordinates
    if (address) {
      results.push({
        test: 'Reverse Geocoding',
        status: 'pass',
        message: 'Reverse geocoding working',
        details: address
      });
    } else {
      results.push({
        test: 'Reverse Geocoding',
        status: 'warning',
        message: 'Reverse geocoding returned no address'
      });
    }
  } catch (error) {
    results.push({
      test: 'Reverse Geocoding',
      status: 'fail',
      message: 'Reverse geocoding failed',
      details: error
    });
  }

  // Test 5: Browser Environment
  try {
    const hasWindow = typeof window !== 'undefined';
    const hasNavigator = typeof navigator !== 'undefined';
    const hasGeolocation = hasNavigator && 'geolocation' in navigator;

    if (hasWindow && hasNavigator) {
      results.push({
        test: 'Browser Environment',
        status: 'pass',
        message: `Browser environment ready (geolocation: ${hasGeolocation})`,
        details: {
          window: hasWindow,
          navigator: hasNavigator,
          geolocation: hasGeolocation
        }
      });
    } else {
      results.push({
        test: 'Browser Environment',
        status: 'fail',
        message: 'Browser environment not available'
      });
    }
  } catch (error) {
    results.push({
      test: 'Browser Environment',
      status: 'fail',
      message: 'Failed to check browser environment',
      details: error
    });
  }

  // Test 6: External CDN Access
  try {
    const testImage = new Image();
    const cdnTest = new Promise<boolean>((resolve) => {
      testImage.onload = () => resolve(true);
      testImage.onerror = () => resolve(false);
      testImage.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
    });

    const cdnWorking = await Promise.race([
      cdnTest,
      new Promise<boolean>(resolve => setTimeout(() => resolve(false), 5000))
    ]);

    if (cdnWorking) {
      results.push({
        test: 'CDN Access',
        status: 'pass',
        message: 'Leaflet CDN accessible'
      });
    } else {
      results.push({
        test: 'CDN Access',
        status: 'warning',
        message: 'CDN access may be blocked or slow'
      });
    }
  } catch (error) {
    results.push({
      test: 'CDN Access',
      status: 'fail',
      message: 'Failed to test CDN access',
      details: error
    });
  }

  return results;
}

export function printTestResults(results: DeploymentTestResult[]): void {
  console.log('\n📊 Deployment Test Results:');
  console.log('================================');
  
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  });

  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'fail').length;

  console.log('\n📈 Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 All critical tests passed! Ready for production.');
  } else {
    console.log('\n🚨 Some tests failed. Please check the issues above.');
  }
}

// Make available in browser console
(window as any).runDeploymentTests = runDeploymentTests;
(window as any).printTestResults = printTestResults;
