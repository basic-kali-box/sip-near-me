import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'business.business';
  locale?: string;
  siteName?: string;
  twitterHandle?: string;
  structuredData?: object;
}

const DEFAULT_SEO = {
  siteName: 'BrewNear',
  title: 'BrewNear - Find Amazing Coffee & Matcha Near You',
  description: 'Discover local artisan coffee roasters and authentic matcha makers in Morocco. Find premium coffee shops, specialty matcha cafes, and order directly from local sellers near you.',
  keywords: 'coffee near me, matcha near me, coffee shops Morocco, matcha cafe, local coffee roasters, specialty coffee, premium matcha, coffee delivery, matcha delivery, artisan coffee',
  image: '/og-image.jpg',
  type: 'website' as const,
  locale: 'en_US',
  twitterHandle: '@brewnear_app'
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  locale = 'en_US',
  siteName = DEFAULT_SEO.siteName,
  twitterHandle = DEFAULT_SEO.twitterHandle,
  structuredData
}) => {
  const location = useLocation();
  
  // Construct full URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://brewnear.app';
  const fullUrl = url || `${baseUrl}${location.pathname}`;
  
  // Use defaults if not provided
  const seoTitle = title ? `${title} | ${siteName}` : DEFAULT_SEO.title;
  const seoDescription = description || DEFAULT_SEO.description;
  const seoKeywords = keywords || DEFAULT_SEO.keywords;
  const seoImage = image ? `${baseUrl}${image}` : `${baseUrl}${DEFAULT_SEO.image}`;

  useEffect(() => {
    // Update document title
    document.title = seoTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', seoDescription);
    updateMetaTag('keywords', seoKeywords);
    
    // OpenGraph tags
    updateMetaTag('og:title', seoTitle, true);
    updateMetaTag('og:description', seoDescription, true);
    updateMetaTag('og:image', seoImage, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', siteName, true);
    updateMetaTag('og:locale', locale, true);

    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', twitterHandle);
    updateMetaTag('twitter:title', seoTitle);
    updateMetaTag('twitter:description', seoDescription);
    updateMetaTag('twitter:image', seoImage);

    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'BrewNear Team');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Language and region
    document.documentElement.setAttribute('lang', locale.split('_')[0]);

  }, [seoTitle, seoDescription, seoKeywords, seoImage, fullUrl, type, locale, siteName, twitterHandle, structuredData]);

  return null; // This component doesn't render anything
};

// Predefined SEO configurations for different pages
export const SEO_CONFIGS = {
  home: {
    title: 'Find Amazing Coffee & Matcha Near You',
    description: 'Discover local artisan coffee roasters and authentic matcha makers in Morocco. Find premium coffee shops, specialty matcha cafes, and order directly from local sellers.',
    keywords: 'coffee near me, matcha near me, coffee shops Morocco, local coffee roasters, specialty coffee, premium matcha'
  },
  
  sellers: {
    title: 'Local Coffee & Matcha Sellers',
    description: 'Browse verified local coffee roasters and matcha makers. Discover unique flavors, premium quality, and authentic experiences from passionate local sellers.',
    keywords: 'local coffee sellers, matcha makers, coffee roasters, specialty coffee shops, artisan coffee'
  },
  
  seller: (sellerName: string, location: string) => ({
    title: `${sellerName} - Premium Coffee & Matcha in ${location}`,
    description: `Order premium coffee and matcha from ${sellerName} in ${location}. Fresh roasted coffee, authentic matcha, and exceptional quality delivered locally.`,
    keywords: `${sellerName}, coffee ${location}, matcha ${location}, local coffee shop, specialty drinks`
  }),
  
  order: {
    title: 'Order Coffee & Matcha',
    description: 'Place your order for premium coffee and matcha. Fast delivery from local sellers, fresh quality guaranteed.',
    keywords: 'order coffee, order matcha, coffee delivery, matcha delivery, local coffee order'
  },
  
  auth: {
    title: 'Sign In to BrewNear',
    description: 'Sign in to your BrewNear account to discover amazing coffee and matcha near you. Join our community of coffee and matcha lovers.',
    keywords: 'sign in, login, coffee community, matcha community'
  },
  
  signup: {
    title: 'Join BrewNear - Coffee & Matcha Community',
    description: 'Join BrewNear to discover local coffee roasters and matcha makers. Sign up as a buyer to find amazing drinks or as a seller to share your craft.',
    keywords: 'sign up, join, coffee community, matcha sellers, local business'
  }
};

export default SEO;
