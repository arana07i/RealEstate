'use client';

import { MapPin, Maximize2, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Coordinates } from '@/lib/maps';
import { isGoogleMapsAvailable, getDefaultMapCenter, getStreetViewUrl } from '@/lib/maps';
import Image from 'next/image';

interface StreetViewProps {
  location?: string;
}

export function StreetViewWidget({ location }: StreetViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [streetViewUrl, setStreetViewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    const fetchCoordinates = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/maps/geocode?address=${encodeURIComponent(location)}`);
        const data = await response.json();
        if (data.coordinates) {
          setCoordinates(data.coordinates);
          setStreetViewUrl(getStreetViewUrl(data.coordinates));
        }
      } catch (error) {
        console.error('Failed to geocode location:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [location]);

  if (!location) return null;

  const mapCenter = coordinates || getDefaultMapCenter(location);
  const finalStreetViewUrl = streetViewUrl || getStreetViewUrl(mapCenter);

  const openInMaps = () => {
    if (isGoogleMapsAvailable()) {
      window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${mapCenter.lat},${mapCenter.lng}`, '_blank');
    } else {
      window.open(`https://www.openstreetmap.org/?mlat=${mapCenter.lat}&mlon=${mapCenter.lng}#map=19/${mapCenter.lat}/${mapCenter.lng}`, '_blank');
    }
  };

  return (
    <>
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-primary">Street View</h2>
        <p className="mt-2 text-sm text-muted-foreground">{location}</p>

        <div className="relative mt-6 aspect-[16/9] rounded-xl overflow-hidden bg-muted dark:bg-muted">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={64} className="mx-auto mb-4 text-accent animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading street view...</p>
              </div>
            </div>
          ) : isGoogleMapsAvailable() && finalStreetViewUrl ? (
            <Image
              src={finalStreetViewUrl}
              alt={`Street view of ${location}`}
              fill
              className="object-cover"
              onError={() => setStreetViewUrl(null)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={64} className="mx-auto mb-4 text-accent" />
                <p className="text-muted-foreground">OpenStreetMap View</p>
                <p className="text-sm text-muted-foreground mt-2">Click button to view in map</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-card/90 px-3.5 py-1.5 text-sm font-medium text-foreground shadow-md backdrop-blur-sm hover:bg-card dark:bg-muted/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-all duration-200"
            aria-label="View fullscreen"
          >
            <Maximize2 size={16} />
            Fullscreen
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={openInMaps}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-primary-dark rounded-xl hover:bg-accent/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Open in maps"
          >
            <Navigation size={16} />
            Open in Maps
          </button>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-muted/95 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-card/20 text-foreground hover:bg-card/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            aria-label="Close street view"
          >
            <Maximize2 size={24} />
          </button>
          <div className="h-[90vh] w-full max-w-6xl">
            {isGoogleMapsAvailable() && finalStreetViewUrl ? (
              <div className="relative h-full w-full rounded-xl overflow-hidden">
                <Image
                  src={finalStreetViewUrl}
                  alt={`Street view of ${location}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
<div className="h-full w-full rounded-xl bg-muted flex items-center justify-center">
                 <div className="text-center text-foreground">
                  <MapPin size={64} className="mx-auto mb-4" />
                  <p className="text-xl mb-2">Street View - {location}</p>
                  <p className="text-muted-foreground">Google Maps API key required for street view</p>
                  <button
                    onClick={openInMaps}
                    className="mt-4 px-4 py-2 bg-accent text-primary-dark rounded-xl"
                  >
                    View on OpenStreetMap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}