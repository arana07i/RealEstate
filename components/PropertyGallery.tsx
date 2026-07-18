'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const displayImages = images.length > 0 ? images : ['/images/placeholder-property.svg'];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="relative">
        <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-muted dark:bg-muted">
          <ImageWithFallback
            src={displayImages[selectedIndex]}
            alt={title}
            fill
            className="object-cover transition-opacity duration-500"
            priority
            sizes="100vw"
          />
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-primary backdrop-blur-sm hover:bg-card transition-colors shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Open fullscreen gallery"
          >
            <Maximize size={20} />
          </button>
        </div>

        {displayImages.length > 1 && (
          <div className="mt-4 grid grid-cols-6 gap-2.5">
            {displayImages.slice(0, 6).map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`relative aspect-video overflow-hidden rounded-lg border-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  i === selectedIndex ? 'border-accent shadow-md' : 'border-transparent hover:opacity-80 hover:border-accent/30'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <ImageWithFallback src={url} alt={`${title} ${i + 1}`} fill className="object-cover" sizes="16vw" />
                {i === 5 && displayImages.length > 6 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/70 text-background">
                    <span className="text-sm font-semibold backdrop-blur-sm bg-card/20 px-2 py-1 rounded">+{displayImages.length - 6}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close gallery"
          >
            <X size={24} />
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>

          <div className="relative h-[80vh] w-[90vw] max-w-5xl">
            <ImageWithFallback
              src={displayImages[selectedIndex]}
              alt={title}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {displayImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === selectedIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}