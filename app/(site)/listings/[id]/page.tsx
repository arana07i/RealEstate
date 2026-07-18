import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getListingById, getListingIds } from '@/lib/listings';
import { formatPrice, formatDate, PLACEHOLDER_IMAGE } from '@/lib/utils';
import { generatePropertySchema, generateBreadcrumbSchema } from '@/lib/seo';
import { siteConfig } from '@/config/site';
import { PropertyGallery } from '@/components/PropertyGallery';
import { VideoTour } from '@/components/VideoTour';
import { VirtualTour } from '@/components/VirtualTour';
import { LocationMap } from '@/components/LocationMap';
import { AmenitiesGrid } from '@/components/AmenitiesGrid';
import { FloorPlansViewer } from '@/components/FloorPlansViewer';
import { ScheduleVisitSidebar } from '@/components/ScheduleVisitSidebar';
import { MortgageCalculator } from '@/components/MortgageCalculator';
import { EmiCalculator } from '@/components/EmiCalculator';
import { PriceSparkline } from '@/components/PriceSparkline';
import { NeighborhoodScore } from '@/components/NeighborhoodScore';
import { WalkScoreBadge } from '@/components/WalkScoreBadge';
import { AgentCard } from '@/components/AgentCard';
import { ReviewsSection } from '@/components/ReviewsSection';
import { RelatedProperties } from '@/components/RelatedProperties';
import { ShareActions } from '@/components/ShareActions';

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
    title: `${listing.title} | ${siteConfig.name}`,
    description,
    openGraph: {
      title: listing.title,
      description,
      type: 'website',
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.socialLinks.twitter?.replace('https://twitter.com/', '@') ?? '@propertyhub',
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
    { name: 'Home', url: `${siteConfig.seo.ogImage?.replace('/images/og-image.jpg', '') ?? 'https://propertyhub.com'}/` },
    { name: 'Properties', url: `${siteConfig.seo.ogImage?.replace('/images/og-image.jpg', '') ?? 'https://propertyhub.com'}#listings` },
    { name: listing.title, url: `${siteConfig.seo.ogImage?.replace('/images/og-image.jpg', '') ?? 'https://propertyhub.com'}/listings/${listing.id}` },
  ]);

  const propertyUrl = `${siteConfig.seo.ogImage?.replace('/images/og-image.jpg', '') ?? 'https://propertyhub.com'}/listings/${listing.id}`;

  return (
    <article className="pt-[72px] bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <PropertyGallery images={images} title={listing.title} />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link href="/#listings" className="text-sm font-medium text-accent hover:underline">
          ← Back to Listings
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div>
              <p className="section-eyebrow">{listing.location}</p>
              <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl mb-5">{listing.title}</h1>
              
              <div className="mt-4 flex items-end gap-6">
                <p className="text-3xl font-bold text-primary">{formatPrice(Number(listing.price))}</p>
                {listing.previous_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    was {formatPrice(listing.previous_price)}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <PriceSparkline price={listing.price} previousPrice={listing.previous_price} />
              </div>

              {(listing.bedrooms || listing.bathrooms || listing.area_sqft) && (
                <ul className="mt-8 flex flex-wrap gap-8 border-y border-border py-6">
                  {listing.bedrooms != null && (
                    <li>
                      <span className="block text-2xl font-bold text-primary">{listing.bedrooms}</span>
                      <span className="text-sm text-muted-foreground">Bedrooms</span>
                    </li>
                  )}
                  {listing.bathrooms != null && (
                    <li>
                      <span className="block text-2xl font-bold text-primary">{listing.bathrooms}</span>
                      <span className="text-sm text-muted-foreground">Bathrooms</span>
                    </li>
                  )}
                  {listing.area_sqft != null && (
                    <li>
                      <span className="block text-2xl font-bold text-primary">{listing.area_sqft.toLocaleString('en-US')}</span>
                      <span className="text-sm text-muted-foreground">sq ft</span>
                    </li>
                  )}
                </ul>
              )}

              <ShareActions propertyId={listing.id} propertyTitle={listing.title} propertyUrl={propertyUrl} />
            </div>

            <div className="mt-12">
              <h2 className="text-xl font-semibold text-primary mb-5">About This Property</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground mb-10">{listing.description}</p>
            </div>

            <AmenitiesGrid amenities={listing.amenities} />

            <FloorPlansViewer floorPlans={listing.floor_plans} />

            {listing.video_url && <VideoTour videoUrl={listing.video_url!} />}

            {listing.virtual_tour_url && <VirtualTour virtualTourUrl={listing.virtual_tour_url} />}

            <LocationMap location={listing.location} />

            <NeighborhoodScore score={listing.property_score} />

            <WalkScoreBadge score={85} />

            <AgentCard
              agentName={listing.agent_name}
              agentPhone={listing.agent_phone}
              agentAvatar={listing.agent_avatar}
              availability={listing.agent_availability}
            />

            <ReviewsSection listingId={listing.id} />

            <MortgageCalculator price={listing.price} />

            <EmiCalculator price={listing.price} />

            <RelatedProperties />

            <p className="mt-8 text-sm text-muted-foreground">Listed on {formatDate(listing.created_at)}</p>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-20">
                <ScheduleVisitSidebar propertyId={listing.id} propertyTitle={listing.title} />
              </div>
            </div>
          </div>
        </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card p-4 lg:hidden">
        <div className="flex gap-3">
          <button className="btn btn-primary flex-1">
            Schedule Visit
          </button>
          <button className="btn btn-outline w-12">
            <Heart size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}