export const runtime = 'edge';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://himalayancrestrealty.com';
  const date = new Date().toISOString();

  const staticUrls = [
    '/',
    '/#listings',
    '/#about',
    '/#contact',
    '/privacy',
    '/terms',
  ];

  const urlElements = staticUrls
    .map((url) => `  <url><loc>${baseUrl}${url}</loc><lastmod>${date}</lastmod><changefreq>${url === '/' || url === '/#listings' ? 'daily' : 'monthly'}</changefreq><priority>${url === '/' ? '1.0' : '0.8'}</priority></url>`)
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}