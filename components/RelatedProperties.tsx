'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Listing } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { ImageWithFallback } from './ImageWithFallback';
import { Badge } from './ui/Badge';

interface RelatedPropertiesProps {
  properties?: Listing[];
}

export function RelatedProperties({ properties }: RelatedPropertiesProps) {
  const [offset, setOffset] = useState(0);
  const visibleCount = 3;
  
  const related = properties && properties.length > 0 ? properties : [];

  if (related.length === 0) return null;

  const canPrev = offset > 0;
  const canNext = offset < related.length - visibleCount;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">Similar Properties</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOffset((prev) => Math.max(prev - 1, 0))}
            disabled={!canPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary disabled:opacity-50 hover:bg-muted"
            aria-label="Previous properties"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setOffset((prev) => prev + 1)}
            disabled={!canNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary disabled:opacity-50 hover:bg-muted"
            aria-label="Next properties"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.slice(offset, offset + visibleCount).map((property) => (
          <Link
            key={property.id}
            href={`/listings/${property.id}`}
            className="group rounded-xl bg-card ring-1 ring-border backdrop-blur-sm overflow-hidden hover:shadow-lg transition-all dark:bg-muted dark:ring-border"
          >
            <div className="relative aspect-[3/2]">
              <ImageWithFallback
                src={property.image_urls[0] || '/images/placeholder-property.svg'}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="33vw"
              />
              {property.status === 'sold' && (
                <Badge variant="sold" size="sm" className="absolute left-3 top-3">
                  Sold
                </Badge>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">{property.location}</p>
              <h3 className="mt-1 font-semibold text-primary line-clamp-1">{property.title}</h3>
              <p className="mt-2 text-lg font-bold text-primary">{formatPrice(property.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}