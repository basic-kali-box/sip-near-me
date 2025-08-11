// Sitemap generation utilities for SEO

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (urls: SitemapUrl[]): string => {
  const urlElements = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
};

export const getStaticSitemapUrls = (): SitemapUrl[] => {
  const baseUrl = 'https://brewnear.app';
  const currentDate = new Date().toISOString().split('T')[0];

  return [
    {
      loc: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/app`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.9
    },
    {
      loc: `${baseUrl}/auth`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: `${baseUrl}/signin`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: `${baseUrl}/signup`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: `${baseUrl}/help`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.5
    },
    {
      loc: `${baseUrl}/terms`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.3
    },
    {
      loc: `${baseUrl}/privacy`,
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.3
    }
  ];
};

// Generate dynamic URLs for sellers
export const getSellerSitemapUrls = (sellers: any[]): SitemapUrl[] => {
  const baseUrl = 'https://brewnear.app';
  const currentDate = new Date().toISOString().split('T')[0];

  return sellers.map(seller => ({
    loc: `${baseUrl}/seller/${seller.id}`,
    lastmod: seller.updated_at ? new Date(seller.updated_at).toISOString().split('T')[0] : currentDate,
    changefreq: 'weekly' as const,
    priority: 0.8
  }));
};

// Generate robots.txt content
export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://brewnear.app';
  
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /debug-data
Disallow: /location-demo
Disallow: /auth/callback
Disallow: /email-confirmation
Disallow: /reset-password
Disallow: /complete-profile

# Specific bot permissions
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Host preference
Host: ${baseUrl}`;
};

// Generate a complete sitemap with all URLs
export const generateCompleteSitemap = async (sellers?: any[]): Promise<string> => {
  const staticUrls = getStaticSitemapUrls();
  const sellerUrls = sellers ? getSellerSitemapUrls(sellers) : [];
  
  const allUrls = [...staticUrls, ...sellerUrls];
  
  return generateSitemap(allUrls);
};

// SEO-friendly URL slug generator
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Generate SEO-friendly URLs for sellers
export const generateSellerUrl = (seller: any): string => {
  const slug = generateSlug(seller.business_name);
  return `/seller/${seller.id}/${slug}`;
};

// Meta description generator for dynamic content
export const generateMetaDescription = (
  type: 'seller' | 'product' | 'location',
  data: any
): string => {
  switch (type) {
    case 'seller':
      return `Order premium ${data.specialty} from ${data.business_name} in ${data.address}. Fresh quality, local delivery, and exceptional taste. ${data.rating_average ? `Rated ${data.rating_average}/5 stars.` : ''}`.substring(0, 160);
    
    case 'product':
      return `${data.name} - ${data.description}. Premium quality ${data.category} available for order. Fresh preparation and local delivery.`.substring(0, 160);
    
    case 'location':
      return `Find the best coffee and matcha sellers in ${data.location}. Discover local artisan roasters, specialty cafes, and authentic matcha makers near you.`.substring(0, 160);
    
    default:
      return 'Discover amazing coffee and matcha sellers near you. Premium quality, local delivery, authentic flavors.';
  }
};

// Generate page titles for SEO
export const generatePageTitle = (
  type: 'seller' | 'product' | 'location' | 'category',
  data: any,
  siteName: string = 'BrewNear'
): string => {
  switch (type) {
    case 'seller':
      return `${data.business_name} - Premium ${data.specialty} in ${data.address} | ${siteName}`;
    
    case 'product':
      return `${data.name} - ${data.category} | ${siteName}`;
    
    case 'location':
      return `Coffee & Matcha in ${data.location} | ${siteName}`;
    
    case 'category':
      return `${data.category} Near You | ${siteName}`;
    
    default:
      return `Find Amazing Coffee & Matcha Near You | ${siteName}`;
  }
};
