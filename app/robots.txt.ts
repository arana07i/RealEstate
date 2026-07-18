import { getSiteUrl } from '@/lib/env';

export const runtime = 'edge';

export async function GET() {
  const siteUrl = getSiteUrl();
  const content = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /api

Sitemap: ${siteUrl}/sitemap.xml`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}