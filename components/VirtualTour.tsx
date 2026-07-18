'use client';

import { Maximize2 } from 'lucide-react';
import { useState } from 'react';

interface VirtualTourProps {
  virtualTourUrl?: string | null;
}

export function VirtualTour({ virtualTourUrl }: VirtualTourProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!virtualTourUrl) return null;

  return (
    <>
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-primary">360° Virtual Tour</h2>
        <div className="relative mt-6 aspect-[16/9] rounded-xl overflow-hidden bg-muted dark:bg-muted shadow-sm">
          <iframe
            src={virtualTourUrl}
            title="Virtual Tour"
            className="h-full w-full"
            allow="fullscreen"
            loading="lazy"
          />
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-card/90 px-3.5 py-1.5 text-sm font-medium text-foreground shadow-md backdrop-blur-sm hover:bg-card dark:bg-muted/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-all duration-200"
            aria-label="View fullscreen"
          >
            <Maximize2 size={16} />
            Fullscreen
          </button>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-muted/95 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close virtual tour"
          >
            <Maximize2 size={24} />
          </button>
          <div className="h-[90vh] w-full max-w-6xl">
            <iframe
              src={virtualTourUrl}
              title="Virtual Tour Fullscreen"
              className="h-full w-full rounded-xl"
              allow="fullscreen"
            />
          </div>
        </div>
      )}
    </>
  );
}