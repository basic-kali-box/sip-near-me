// OpenRouteService Configuration
// Get your free API key at: https://openrouteservice.org/dev/#/signup

export const ORS_CONFIG = {
  // Replace with your actual OpenRouteService API key
  API_KEY: process.env.REACT_APP_ORS_API_KEY || '5b3ce3597851110001cf6248a1b2c8b8b8b84b8b8b8b8b8b8b8b8b8b8b8b8b8b8',
  BASE_URL: 'https://api.openrouteservice.org/v2',
  
  // Default routing profile
  PROFILE: 'driving-car', // Options: driving-car, foot-walking, cycling-regular
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Maximum number of coordinates for routing
  MAX_COORDINATES: 50,
};

// Rate limiting configuration
export const RATE_LIMIT = {
  // Free tier: 2000 requests per day, 40 requests per minute
  REQUESTS_PER_MINUTE: 40,
  REQUESTS_PER_DAY: 2000,
};

// Supported routing profiles
export const ROUTING_PROFILES = {
  DRIVING: 'driving-car',
  WALKING: 'foot-walking',
  CYCLING: 'cycling-regular',
  HEAVY_VEHICLE: 'driving-hgv',
  WHEELCHAIR: 'wheelchair',
} as const;

// Error messages
export const ORS_ERRORS = {
  NO_API_KEY: 'OpenRouteService API key is required',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  INVALID_COORDINATES: 'Invalid coordinates provided',
  ROUTE_NOT_FOUND: 'No route found between the specified points',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;
