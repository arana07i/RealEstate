import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getListingById, getListingIds } from '@/lib/listings';
import { formatPrice, formatDate, PLACEHOLDER_IMAGE } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { InquiryForm } from '@/components/InquiryForm';
import { generatePropertySchema, generateBreadcrumbSchema } from '@/lib/seo';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const ids = await getListingIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return { title: 'Property Not Found' };
  }

  const description = listing.description.slice(0, 160);
  const image = listing.image_urls[0];

  return {
    title: listing.title,
    description,
    openGraph: {
      title: listing.title,
      description,
      type: 'website',
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@himalayancrest',
      title: listing.title,
      description,
      ...(image && { images: [{ url: image }] }),
    },
    alternates: {
      canonical: `/listings/${listing.id}`,
    },
  };
}

export const revalidate = 60;

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing || listing.status !== 'active') {
    notFound();
  }

  const images = listing.image_urls.length > 0 ? listing.image_urls : [PLACEHOLDER_IMAGE];
  const propertySchema = generatePropertySchema(listing);
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://himalayancrestrealty.com/' },
    { name: 'Properties', url: 'https://himalayancrestrealty.com/#listings' },
    { name: listing.title, url: `https://himalayancrestrealty.com/listings/${listing.id}` },
  ]);

  return (
    <article className="pt-[72px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      
      <div className="bg-primary-dark">
        <div className="mx-auto grid max-w-7xl gap-1 px-0 md:grid-cols-2 md:px-6 md:py-6">
          <div className="relative aspect-[16/10] md:rounded-l-xl overflow-hidden">
            <ImageWithFallback src={images[0]} alt={listing.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          {images.length > 1 && (
            <div className="hidden grid-cols-2 gap-1 md:grid">
              {images.slice(1, 5).map((url, i) => (
                <div key={url} className={`relative aspect-[4/3] overflow-hidden ${i === 1 ? 'rounded-tr-xl' : ''} ${i === 3 ? 'rounded-br-xl' : ''}`}>
                  <ImageWithFallback src={url} alt={`${listing.title} — photo ${i + 2}`} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link href="/#listings" className="text-sm font-medium text-accent hover:underline">
          ← Back to Listings
        </Link>

        <div className="mt-6 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="section-eyebrow">{listing.location}</p>
            <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">{listing.title}</h1>
            <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(Number(listing.price))}</p>

            {(listing.bedrooms || listing.bathrooms || listing.area_sqft) && (
              <ul className="mt-6 flex flex-wrap gap-6 border-y border-stone-200 py-6 text-stone-600">
                {listing.bedrooms != null && (
                  <li><strong className="text-primary">{listing.bedrooms}</strong> Bedrooms</li>
                )}
                {listing.bathrooms != null && (
                  <li><strong className="text-primary">{listing.bathrooms}</strong> Bathrooms</li>
                )}
                {listing.area_sqft != null && (
                  <li><strong className="text-primary">{listing.area_sqft.toLocaleString('en-IN')}</strong> sq ft</li>
                )}
              </ul>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-primary">About This Property</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-stone-600">{listing.description}</p>
            </div>

            <p className="mt-8 text-sm text-stone-400">Listed on {formatDate(listing.created_at)}</p>
          </div>

          <aside className="card h-fit p-8">
            <h2 className="text-lg font-semibold text-primary">Schedule a Viewing</h2>
            <p className="mt-2 text-sm text-stone-600">
              Interested in this property? Contact our team for a private viewing.
            </p>
            <InquiryForm propertyId={listing.id} />
          </aside>
        </div>
      </div>
    </article>
  );
}