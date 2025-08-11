// Analytics and SEO tracking utilities

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Google Analytics configuration
export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
    page_title: title || document.title,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// SEO-specific event tracking
export const trackSEOEvents = {
  // Track when users find sellers through search
  sellerDiscovery: (sellerId: string, searchMethod: 'map' | 'list' | 'search') => {
    trackEvent('seller_discovery', 'SEO', `${searchMethod}_${sellerId}`);
  },

  // Track location-based searches
  locationSearch: (location: string, resultCount: number) => {
    trackEvent('location_search', 'SEO', location, resultCount);
  },

  // Track when users contact sellers
  sellerContact: (sellerId: string, contactMethod: 'whatsapp' | 'phone' | 'order') => {
    trackEvent('seller_contact', 'conversion', `${contactMethod}_${sellerId}`);
  },

  // Track successful orders
  orderPlacement: (sellerId: string, orderValue: number) => {
    trackEvent('order_placed', 'conversion', sellerId, orderValue);
  },

  // Track user registration
  userRegistration: (userType: 'buyer' | 'seller') => {
    trackEvent('user_registration', 'conversion', userType);
  },

  // Track search queries
  searchQuery: (query: string, resultCount: number) => {
    trackEvent('search_query', 'engagement', query, resultCount);
  }
};

// Google Search Console verification
export const addSearchConsoleVerification = (verificationCode: string) => {
  if (typeof document === 'undefined') return;

  const meta = document.createElement('meta');
  meta.name = 'google-site-verification';
  meta.content = verificationCode;
  document.head.appendChild(meta);
};

// Bing Webmaster Tools verification
export const addBingVerification = (verificationCode: string) => {
  if (typeof document === 'undefined') return;

  const meta = document.createElement('meta');
  meta.name = 'msvalidate.01';
  meta.content = verificationCode;
  document.head.appendChild(meta);
};

// Track Core Web Vitals for SEO
export const trackWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Track Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        trackEvent('web_vitals', 'performance', 'LCP', Math.round(entry.startTime));
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Browser doesn't support this metric
  }

  // Track First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'first-input') {
        const fid = entry.processingStart - entry.startTime;
        trackEvent('web_vitals', 'performance', 'FID', Math.round(fid));
      }
    }
  });

  try {
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // Browser doesn't support this metric
  }

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    
    // Report CLS when the page is about to be unloaded
    window.addEventListener('beforeunload', () => {
      trackEvent('web_vitals', 'performance', 'CLS', Math.round(clsValue * 1000));
    });
  } catch (e) {
    // Browser doesn't support this metric
  }
};

// Track user engagement for SEO signals
export const trackEngagement = {
  // Track time spent on page
  timeOnPage: (startTime: number) => {
    const timeSpent = Date.now() - startTime;
    trackEvent('engagement', 'time_on_page', window.location.pathname, Math.round(timeSpent / 1000));
  },

  // Track scroll depth
  scrollDepth: (percentage: number) => {
    trackEvent('engagement', 'scroll_depth', window.location.pathname, percentage);
  },

  // Track clicks on important elements
  elementClick: (elementType: string, elementId?: string) => {
    trackEvent('engagement', 'element_click', `${elementType}_${elementId || 'unknown'}`);
  }
};

// Initialize scroll depth tracking
export const initScrollTracking = () => {
  if (typeof window === 'undefined') return;

  let maxScroll = 0;
  const trackingPoints = [25, 50, 75, 90, 100];
  const trackedPoints = new Set<number>();

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      // Track milestone percentages
      trackingPoints.forEach(point => {
        if (scrollPercent >= point && !trackedPoints.has(point)) {
          trackedPoints.add(point);
          trackEngagement.scrollDepth(point);
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', handleScroll);
  });
};

// Facebook Pixel integration (optional)
export const initFacebookPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Load Facebook Pixel
  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
};
