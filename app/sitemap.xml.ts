import { getListings } from '@/lib/listings';

export const runtime = 'edge';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://himalayancrestrealty.com';
  const date = new Date().toISOString();

  const staticUrls = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/#listings', changefreq: 'daily', priority: '0.9' },
    { url: '/#features', changefreq: 'monthly', priority: '0.8' },
    { url: '/#pricing', changefreq: 'monthly', priority: '0.8' },
    { url: '/privacy', changefreq: 'monthly', priority: '0.5' },
    { url: '/terms', changefreq: 'monthly', priority: '0.5' },
    { url: '/onboarding', changefreq: 'monthly', priority: '0.7' },
  ];

  const listings = await getListings({ status: 'active' });
  
  const listingUrls = listings.map((listing) => ({
    url: `/listings/${listing.id}`,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const allUrls = [...staticUrls, ...listingUrls];

  const urlElements = allUrls
    .map(({ url, changefreq, priority }) => 
      `  <url><loc>${baseUrl}${url}</loc><lastmod>${date}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`)
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}