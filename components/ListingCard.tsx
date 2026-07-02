import Link from 'next/link';
import { type Listing } from '@/lib/types';
import { formatPrice, PLACEHOLDER_IMAGE } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ImageWithFallback';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.image_urls[0] || PLACEHOLDER_IMAGE;

  return (
    <article className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-[3/2] overflow-hidden bg-primary/10">
          <ImageWithFallback
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {listing.status === 'sold' && (
            <span className="absolute left-4 top-4 rounded bg-red-600 px-3 py-1 text-xs font-semibold uppercase text-white">
              Sold
            </span>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">{listing.location}</p>
          <h3 className="mt-1 text-lg font-semibold text-primary">{listing.title}</h3>
          {(listing.bedrooms || listing.bathrooms || listing.area_sqft) && (
            <ul className="mt-3 flex flex-wrap gap-4 border-b border-stone-200 pb-4 text-sm text-stone-500">
              {listing.bedrooms != null && <li>{listing.bedrooms} Beds</li>}
              {listing.bathrooms != null && <li>{listing.bathrooms} Baths</li>}
              {listing.area_sqft != null && <li>{listing.area_sqft.toLocaleString('en-IN')} sq ft</li>}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-primary">{formatPrice(Number(listing.price))}</span>
            <span className="text-sm font-semibold text-accent group-hover:underline">View Details →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}