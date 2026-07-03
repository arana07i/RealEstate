'use client';

import { useState } from 'react';
import { ImageWithFallback } from './ImageWithFallback';

interface ListingGalleryProps {
  images: string[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
        <ImageWithFallback
          src={images[selectedIndex]}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 66vw"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative aspect-[4/3] overflow-hidden rounded border-2 transition ${
                i === selectedIndex ? 'border-accent' : 'border-transparent'
              }`}
              aria-label={`View image ${i + 1} of ${images.length}`}
            >
              <ImageWithFallback src={url} alt={`${title} thumbnail ${i + 1}`} fill className="object-cover" sizes="20vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}