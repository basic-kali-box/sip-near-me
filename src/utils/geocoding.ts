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
 * Geocode an address using a geocoding service
 * This is a placeholder for future implementation with services like:
 * - Google Maps Geocoding API
 * - Mapbox Geocoding API
 * - OpenStreetMap Nominatim
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    // TODO: Implement actual geocoding service
    // For now, return default coordinates based on simple city detection
    console.log('🔄 Geocoding address:', address);
    
    const coordinates = getDefaultCoordinates(address);
    
    return {
      coordinates,
      formattedAddress: address
    };
  } catch (error) {
    console.error('❌ Geocoding failed:', error);
    return null;
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
 * Get user's current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Return default coordinates instead of rejecting
        resolve(DEFAULT_COORDINATES.default);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}
