// Structured Data (JSON-LD) schemas for SEO

export interface BusinessLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
}

export interface BusinessHours {
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

export interface Seller {
  id: string;
  business_name: string;
  description?: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating_average?: number;
  rating_count?: number;
  specialty: 'coffee' | 'matcha' | 'both';
  hours?: string;
  photo_url?: string;
}

// Main application schema
export const getWebApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Machroub",
  "description": "Find amazing coffee and matcha sellers near you. Discover local artisan coffee roasters and authentic matcha makers in Morocco.",
  "url": "https://machroub.ma",
  "applicationCategory": "Food & Drink",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "MAD"
  },
  "author": {
    "@type": "Organization",
    "name": "Machroub Team"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  }
});

// Local business schema for individual sellers
export const getLocalBusinessSchema = (seller: Seller) => {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": seller.specialty === 'coffee' ? "CoffeeShop" : "Restaurant",
    "name": seller.business_name,
    "description": seller.description || `Premium ${seller.specialty} seller offering exceptional quality and authentic flavors.`,
    "telephone": seller.phone,
    "servesCuisine": seller.specialty === 'coffee' ? "Coffee" : seller.specialty === 'matcha' ? "Tea" : "Coffee and Tea",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": seller.address,
      "addressCountry": "MA"
    }
  };

  // Add location if available
  if (seller.latitude && seller.longitude) {
    (baseSchema as any).geo = {
      "@type": "GeoCoordinates",
      "latitude": seller.latitude,
      "longitude": seller.longitude
    };
  }

  // Add rating if available
  if (seller.rating_average && seller.rating_count) {
    (baseSchema as any).aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": seller.rating_average.toString(),
      "reviewCount": seller.rating_count.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add image if available
  if (seller.photo_url) {
    (baseSchema as any).image = seller.photo_url;
  }

  // Add opening hours if available
  if (seller.hours) {
    try {
      // Parse hours string and convert to schema format
      (baseSchema as any).openingHours = parseBusinessHours(seller.hours);
    } catch (error) {
      console.warn('Could not parse business hours:', seller.hours);
    }
  }

  return baseSchema;
};

// Product schema for drinks/menu items
export const getProductSchema = (drink: any, seller: Seller) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": drink.name,
  "description": drink.description,
  "category": drink.category,
  "offers": {
    "@type": "Offer",
    "price": parseFloat(drink.price.replace(' Dh', '')),
    "priceCurrency": "MAD",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": seller.business_name
    }
  },
  "brand": {
    "@type": "Brand",
    "name": seller.business_name
  }
});

// Breadcrumb schema for navigation
export const getBreadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// FAQ schema for help pages
export const getFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Organization schema for the company
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Machroub",
  "description": "Connecting coffee and matcha lovers with local artisan sellers across Morocco.",
  "url": "https://machroub.ma",
  "logo": "https://machroub.ma/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["English", "French", "Arabic"]
  },
  "sameAs": [
    "https://twitter.com/machroub_ma",
    "https://instagram.com/machroub_ma",
    "https://facebook.com/machroub.ma"
  ]
});

// Helper function to parse business hours
const parseBusinessHours = (hoursString: string): string[] => {
  // This is a simple parser - you might want to make it more sophisticated
  // Expected format: "Mon-Fri 9:00-17:00, Sat 10:00-15:00"
  const hours: string[] = [];
  
  // For now, return a default format
  // You can enhance this based on your actual hours format
  return [
    "Mo-Fr 09:00-17:00",
    "Sa 10:00-15:00"
  ];
};

// Search action schema for the app
export const getSearchActionSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Machroub",
  "url": "https://machroub.ma",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://machroub.ma/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

// Event schema for special offers or events
export const getEventSchema = (event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  organizer: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": event.name,
  "description": event.description,
  "startDate": event.startDate,
  "endDate": event.endDate,
  "location": {
    "@type": "Place",
    "name": event.location
  },
  "organizer": {
    "@type": "Organization",
    "name": event.organizer
  }
});
