// Security utilities and validation

// Domain allowlist for production
const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'machroub.ma',
  'www.machroub.ma',
  // Add your production domains here
];

// Check if current domain is allowed
export const isAllowedDomain = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const hostname = window.location.hostname;
  return ALLOWED_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
};

// Validate environment configuration
export const validateEnvironment = () => {
  const issues: string[] = [];
  
  // Check if we're in production with proper domain
  if (import.meta.env.PROD && !isAllowedDomain()) {
    issues.push('Application running on unauthorized domain');
  }
  
  // Check for required environment variables
  if (!import.meta.env.VITE_SUPABASE_URL) {
    issues.push('Missing VITE_SUPABASE_URL');
  }
  
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    issues.push('Missing VITE_SUPABASE_ANON_KEY');
  }
  
  // Warn about exposed API keys in development
  if (import.meta.env.DEV) {
    console.warn('🔒 Security Notice: API keys are exposed in development mode');
    console.warn('🔒 Ensure Row Level Security (RLS) is enabled on all Supabase tables');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
  
  reset(key: string): void {
    this.requests.delete(key);
  }
}

// API key validation (for development)
export const validateApiKeys = () => {
  const warnings: string[] = [];
  
  // Check if API keys look like they might be exposed
  const orsKey = import.meta.env.VITE_ORS_API_KEY;
  if (orsKey && orsKey.length > 20) {
    warnings.push('OpenRoute Service API key detected - ensure it has domain restrictions');
  }
  
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (supabaseKey && supabaseKey.startsWith('eyJ')) {
    warnings.push('Supabase anon key detected - ensure RLS is enabled on all tables');
  }
  
  return warnings;
};

// Security headers check
export const checkSecurityHeaders = async (): Promise<{
  hasCSP: boolean;
  hasHSTS: boolean;
  hasXFrameOptions: boolean;
  recommendations: string[];
}> => {
  const recommendations: string[] = [];
  
  try {
    const response = await fetch(window.location.origin, { method: 'HEAD' });
    const headers = response.headers;
    
    const hasCSP = headers.has('content-security-policy');
    const hasHSTS = headers.has('strict-transport-security');
    const hasXFrameOptions = headers.has('x-frame-options');
    
    if (!hasCSP) {
      recommendations.push('Add Content Security Policy (CSP) headers');
    }
    
    if (!hasHSTS && window.location.protocol === 'https:') {
      recommendations.push('Add HTTP Strict Transport Security (HSTS) headers');
    }
    
    if (!hasXFrameOptions) {
      recommendations.push('Add X-Frame-Options header to prevent clickjacking');
    }
    
    return {
      hasCSP,
      hasHSTS,
      hasXFrameOptions,
      recommendations
    };
  } catch (error) {
    return {
      hasCSP: false,
      hasHSTS: false,
      hasXFrameOptions: false,
      recommendations: ['Unable to check security headers']
    };
  }
};

// Initialize security checks
export const initSecurity = () => {
  // Validate environment
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    console.error('🚨 Security Issues:', envValidation.issues);
  }
  
  // Check API keys in development
  if (import.meta.env.DEV) {
    const apiKeyWarnings = validateApiKeys();
    if (apiKeyWarnings.length > 0) {
      console.warn('🔑 API Key Warnings:', apiKeyWarnings);
    }
  }
  
  // Domain validation
  if (!isAllowedDomain()) {
    console.error('🚨 Unauthorized domain detected:', window.location.hostname);
    // In production, you might want to redirect or block access
  }
};

// Export rate limiter instance for API calls
export const apiRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute
