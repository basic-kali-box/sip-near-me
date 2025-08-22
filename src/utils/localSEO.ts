// Local SEO utilities for location-based optimization

export interface LocationData {
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
}

export interface LocalBusinessData {
  name: string;
  description: string;
  address: string;
  phone: string;
  website?: string;
  hours?: string;
  category: 'coffee' | 'matcha' | 'both';
  rating?: number;
  reviewCount?: number;
  priceRange?: '$' | '$$' | '$$$';
  location: LocationData;
}

// Generate local business structured data
export const generateLocalBusinessSchema = (business: LocalBusinessData) => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": business.category === 'coffee' ? "CoffeeShop" : "Restaurant",
    "name": business.name,
    "description": business.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": business.location.city,
      "addressRegion": business.location.region,
      "addressCountry": business.location.country,
      "postalCode": business.location.postalCode
    },
    "telephone": business.phone,
    "url": business.website,
    "servesCuisine": business.category === 'coffee' ? "Coffee" : business.category === 'matcha' ? "Tea" : "Coffee and Tea",
    "priceRange": business.priceRange || "$$"
  };

  // Add geolocation if available
  if (business.location.latitude && business.location.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": business.location.latitude,
      "longitude": business.location.longitude
    };
  }

  // Add rating if available
  if (business.rating && business.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": business.rating.toString(),
      "reviewCount": business.reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add opening hours if available
  if (business.hours) {
    schema.openingHours = parseOpeningHours(business.hours);
  }

  return schema;
};

// Parse opening hours into schema.org format
const parseOpeningHours = (hours: string): string[] => {
  // Simple parser for common formats
  // You can enhance this based on your actual hours format
  const defaultHours = [
    "Mo-Fr 08:00-18:00",
    "Sa 09:00-17:00",
    "Su 10:00-16:00"
  ];
  
  try {
    // Add your custom parsing logic here
    return defaultHours;
  } catch (error) {
    return defaultHours;
  }
};

// Generate location-specific meta tags
export const generateLocationMeta = (location: LocationData, businessType: string = 'coffee and matcha') => {
  const locationString = `${location.city}${location.region ? `, ${location.region}` : ''}, ${location.country}`;
  
  return {
    title: `Best ${businessType} in ${location.city} | Machroub`,
    description: `Discover amazing ${businessType} sellers in ${locationString}. Find local artisan roasters, specialty cafes, and authentic makers near you.`,
    keywords: `${businessType} ${location.city}, coffee shops ${location.city}, matcha ${location.city}, local coffee roasters ${location.city}, specialty drinks ${location.city}`,
    geoRegion: location.region,
    geoCountry: location.country,
    geoPlacename: location.city
  };
};

// Generate city-specific landing page content
export const generateCityPageSchema = (city: string, region: string, country: string, businesses: LocalBusinessData[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Coffee & Matcha in ${city}`,
    "description": `Find the best coffee and matcha sellers in ${city}, ${region}. Discover local artisan roasters and authentic matcha makers.`,
    "url": `https://machroub.ma/city/${city.toLowerCase()}`,
    "about": {
      "@type": "Place",
      "name": city,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city,
        "addressRegion": region,
        "addressCountry": country
      }
    },
    "mainEntity": businesses.map(business => ({
      "@type": "LocalBusiness",
      "name": business.name,
      "address": business.address,
      "telephone": business.phone
    }))
  };
};

// Generate local search keywords
export const generateLocalKeywords = (baseKeywords: string[], location: LocationData): string[] => {
  const locationVariations = [
    location.city,
    `${location.city} ${location.region}`,
    `${location.city} ${location.country}`,
    location.region,
    `near ${location.city}`,
    `in ${location.city}`,
    `${location.city} area`
  ].filter(Boolean);

  const localKeywords: string[] = [];
  
  baseKeywords.forEach(keyword => {
    locationVariations.forEach(loc => {
      localKeywords.push(`${keyword} ${loc}`);
      localKeywords.push(`${keyword} near ${loc}`);
      localKeywords.push(`best ${keyword} ${loc}`);
    });
  });

  return localKeywords;
};

// Common Moroccan cities for local SEO
export const MOROCCAN_CITIES = [
  { name: 'Casablanca', region: 'Casablanca-Settat', country: 'Morocco' },
  { name: 'Rabat', region: 'Rabat-Salé-Kénitra', country: 'Morocco' },
  { name: 'Marrakech', region: 'Marrakech-Safi', country: 'Morocco' },
  { name: 'Fez', region: 'Fès-Meknès', country: 'Morocco' },
  { name: 'Tangier', region: 'Tanger-Tétouan-Al Hoceïma', country: 'Morocco' },
  { name: 'Agadir', region: 'Souss-Massa', country: 'Morocco' },
  { name: 'Meknes', region: 'Fès-Meknès', country: 'Morocco' },
  { name: 'Oujda', region: 'Oriental', country: 'Morocco' },
  { name: 'Kenitra', region: 'Rabat-Salé-Kénitra', country: 'Morocco' },
  { name: 'Tetouan', region: 'Tanger-Tétouan-Al Hoceïma', country: 'Morocco' }
];

// Generate FAQ schema for local SEO
export const generateLocalFAQSchema = (city: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where can I find the best coffee in ${city}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Machroub helps you discover the best local coffee roasters and specialty coffee shops in ${city}. Browse verified sellers, read reviews, and order directly from local artisans.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I order matcha in ${city}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Use Machroub to find authentic matcha makers in ${city}. View their menus, check availability, and place orders for pickup or delivery directly through our platform.`
        }
      },
      {
        "@type": "Question",
        "name": `Are there specialty coffee roasters in ${city}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes! ${city} has many talented local coffee roasters. Machroub connects you with artisan roasters who offer fresh, high-quality coffee beans and specialty drinks.`
        }
      },
      {
        "@type": "Question",
        "name": `Can I get coffee delivered in ${city}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Many coffee and matcha sellers in ${city} offer delivery through Machroub. Check individual seller profiles for delivery options and areas they serve.`
        }
      }
    ]
  };
};

// Generate hreflang tags for multi-language support
export const generateHreflangTags = (currentUrl: string, languages: string[] = ['en', 'fr', 'ar']) => {
  return languages.map(lang => ({
    rel: 'alternate',
    hreflang: lang,
    href: `${currentUrl}?lang=${lang}`
  }));
};

// Local business hours formatter
export const formatBusinessHours = (hours: string): string => {
  // Convert various hour formats to a standardized display
  // This is a simple implementation - enhance based on your needs
  return hours || 'Hours vary - contact for details';
};
