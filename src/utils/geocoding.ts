/**
 * Geocoding utilities for converting addresses to coordinates
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeResult {
  coordinates: Coordinates;
  formattedAddress: string;
}

/**
 * Default coordinates for major cities (fallback values)
 */
export const DEFAULT_COORDINATES: Record<string, Coordinates> = {
  'new_york': { latitude: 40.7128, longitude: -74.0060 },
  'los_angeles': { latitude: 34.0522, longitude: -118.2437 },
  'chicago': { latitude: 41.8781, longitude: -87.6298 },
  'houston': { latitude: 29.7604, longitude: -95.3698 },
  'phoenix': { latitude: 33.4484, longitude: -112.0740 },
  'philadelphia': { latitude: 39.9526, longitude: -75.1652 },
  'san_antonio': { latitude: 29.4241, longitude: -98.4936 },
  'san_diego': { latitude: 32.7157, longitude: -117.1611 },
  'dallas': { latitude: 32.7767, longitude: -96.7970 },
  'san_jose': { latitude: 37.3382, longitude: -121.8863 },
  'default': { latitude: 40.7128, longitude: -74.0060 } // NYC as default
};

/**
 * Get default coordinates based on address or return NYC coordinates
 */
export function getDefaultCoordinates(address?: string): Coordinates {
  if (!address) {
    return DEFAULT_COORDINATES.default;
  }

  const lowerAddress = address.toLowerCase();
  
  // Simple city detection
  for (const [city, coords] of Object.entries(DEFAULT_COORDINATES)) {
    if (city !== 'default' && lowerAddress.includes(city.replace('_', ' '))) {
      return coords;
    }
  }

  return DEFAULT_COORDINATES.default;
}

/**
 * Geocode an address using OpenRouteService
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    console.log('🔄 Geocoding address with ORS:', address);

    const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
    if (!ORS_API_KEY) {
      console.warn('⚠️ ORS API key not found, using fallback coordinates');
      return {
        coordinates: getDefaultCoordinates(address),
        formattedAddress: address
      };
    }

    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}&size=1`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ORS Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.geometry.coordinates;

      return {
        coordinates: { latitude, longitude },
        formattedAddress: feature.properties.label || address
      };
    } else {
      console.warn('⚠️ No geocoding results found, using fallback coordinates');
      return {
        coordinates: getDefaultCoordinates(address),
        formattedAddress: address
      };
    }
  } catch (error) {
    console.error('❌ Geocoding failed:', error);
    return {
      coordinates: getDefaultCoordinates(address),
      formattedAddress: address
    };
  }
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Calculate distance between two coordinates (in kilometers)
 * Using the Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Search for addresses using OpenRouteService autocomplete
 */
export async function searchAddresses(query: string, limit: number = 5): Promise<GeocodeResult[]> {
  try {
    if (!query || query.length < 3) {
      return [];
    }

    const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
    if (!ORS_API_KEY) {
      console.warn('⚠️ ORS API key not found');
      return [];
    }

    const response = await fetch(
      `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(query)}&size=${limit}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ORS Autocomplete API error: ${response.status}`);
    }

    const data = await response.json();

    return (data.features || []).map((feature: any) => ({
      coordinates: {
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0]
      },
      formattedAddress: feature.properties.label
    }));
  } catch (error) {
    console.error('❌ Address search failed:', error);
    return [];
  }
}

/**
 * Reverse geocode coordinates to get address using OpenRouteService
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
    if (!ORS_API_KEY) {
      console.warn('⚠️ ORS API key not found');
      return null;
    }

    const response = await fetch(
      `https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_API_KEY}&point.lon=${longitude}&point.lat=${latitude}&size=1`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ORS Reverse Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].properties.label;
    }

    return null;
  } catch (error) {
    console.error('❌ Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Get user's current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Geolocation success:', position.coords.latitude, position.coords.longitude);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn('❌ Geolocation error:', error.message, 'Code:', error.code);

        // Handle different error types appropriately
        if (error.code === error.PERMISSION_DENIED) {
          console.log('🚫 User denied geolocation permission, using default coordinates');
          resolve(DEFAULT_COORDINATES.default);
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          console.log('📍 Position unavailable (common in production), using default coordinates');
          // In production, position unavailable is common, so fallback gracefully
          resolve(DEFAULT_COORDINATES.default);
        } else if (error.code === error.TIMEOUT) {
          console.log('⏰ Geolocation timeout, using default coordinates');
          resolve(DEFAULT_COORDINATES.default);
        } else {
          // Unknown error, still fallback to default
          console.log('❓ Unknown geolocation error, using default coordinates');
          resolve(DEFAULT_COORDINATES.default);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}
