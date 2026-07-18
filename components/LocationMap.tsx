'use client';

import { MapPin, ShoppingBag, Coffee, School, Train, Hospital, Utensils, Navigation, Route, Car, Bike, PersonStanding, TrainFront } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Coordinates, DirectionsResult } from '@/lib/maps';
import { isGoogleMapsAvailable, getDefaultMapCenter, getStreetViewUrl, calculateDistance } from '@/lib/maps';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface NearbyPlace {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'shopping' | 'restaurant' | 'transport' | 'cafe';
  distance: number;
  rating?: number;
  address?: string;
  coordinates?: Coordinates;
}

interface LocationMapProps {
  location?: string;
  coordinates?: Coordinates;
  height?: string;
  showDirections?: boolean;
}

const NEARBY_PLACES: NearbyPlace[] = [
  { id: '1', name: 'Downtown Market', type: 'shopping', distance: 0.5, rating: 4.3 },
  { id: '2', name: 'Cafe Corner', type: 'cafe', distance: 0.8, rating: 4.0 },
  { id: '3', name: "St. Mary's School", type: 'school', distance: 1.2, rating: 4.5 },
  { id: '4', name: 'Central Station', type: 'transport', distance: 2.5 },
  { id: '5', name: 'General Hospital', type: 'hospital', distance: 3.1, rating: 4.2 },
  { id: '6', name: 'The Bistro', type: 'restaurant', distance: 0.9, rating: 4.6 },
];

const TYPE_COLORS: Record<string, string> = {
  shopping: 'text-blue-500',
  cafe: 'text-amber-500',
  school: 'text-emerald-500',
  transport: 'text-primary',
  hospital: 'text-red-500',
  restaurant: 'text-pink-500',
};

const TYPE_ICONS: Record<string, typeof ShoppingBag> = {
  shopping: ShoppingBag,
  cafe: Coffee,
  school: School,
  transport: Train,
  hospital: Hospital,
  restaurant: Utensils,
};

export function LocationMap({ location, coordinates, height = '300px', showDirections = true }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>(NEARBY_PLACES);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [directionsMode, setDirectionsMode] = useState<'driving' | 'walking' | 'bicycling' | 'transit'>('driving');
  const [loadingDirections, setLoadingDirections] = useState(false);

  const mapCenter = coordinates || getDefaultMapCenter(location);

  useEffect(() => {
    if (isGoogleMapsAvailable()) {
      loadGoogleMap();
    }
  }, [location, coordinates]);

  useEffect(() => {
    if (navigator.geolocation && showDirections) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, [showDirections]);

  const loadGoogleMap = async () => {
    if (typeof window === 'undefined') return;
    if (!window.google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkAndInit = () => {
      if (window.google?.maps && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 14,
          styles: [
            { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          ],
        });

        new window.google.maps.Marker({
          position: mapCenter,
          map,
          title: location,
        });

        setMapLoaded(true);
      }
    };

    if (window.google?.maps) {
      checkAndInit();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps) {
          checkAndInit();
          clearInterval(interval);
        }
      }, 100);
    }
  };

  const handleGetDirections = async () => {
    if (!userLocation || !mapCenter) return;

    setLoadingDirections(true);
    try {
      const response = await fetch(
        `/api/maps/directions?origin=${userLocation.lat},${userLocation.lng}&destination=${mapCenter.lat},${mapCenter.lng}&mode=${directionsMode}`
      );
      const data = await response.json();
      if (data.directions) {
        setDirections(data.directions);
      }
    } catch (error) {
      console.error('Failed to fetch directions:', error);
    } finally {
      setLoadingDirections(false);
    }
  };

  const openInMaps = (coords: Coordinates, label: string) => {
    if (isGoogleMapsAvailable()) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}&query_place_id=${encodeURIComponent(label)}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`;
      window.open(url, '_blank');
    }
  };

  const placesByType = nearbyPlaces.reduce((acc, place) => {
    if (!acc[place.type]) acc[place.type] = [];
    acc[place.type].push(place);
    return acc;
  }, {} as Record<string, NearbyPlace[]>);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-primary">Location & Nearby Places</h2>
      <p className="mt-2 text-sm text-muted-foreground">{location || 'Property Location'}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="relative rounded-xl border border-border bg-muted dark:bg-muted overflow-hidden lg:aspect-[4/3]" style={{ height }}>
          {isGoogleMapsAvailable() ? (
            <>
              <div ref={mapRef} className="absolute inset-0" />
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={48} className="mx-auto mb-2 text-accent animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto mb-2 text-accent" />
                <p className="font-semibold text-primary">{location || 'Property Location'}</p>
                <p className="text-sm text-muted-foreground">OpenStreetMap / Google Maps (API key optional)</p>
                <button
                  onClick={() => openInMaps(mapCenter, location || 'Property Location')}
                  className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  View Location
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {showDirections && userLocation && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Directions mode:</span>
              <div className="flex gap-1">
                {(['driving', 'walking', 'bicycling', 'transit'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDirectionsMode(mode)}
                    className={`px-2 py-1 text-xs rounded ${
                      directionsMode === mode ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted'
                    }`}
                    aria-label={`Set ${mode} mode`}
                  >
                    {mode === 'driving' && <Car size={14} />}
                    {mode === 'walking' && <PersonStanding size={14} />}
                    {mode === 'bicycling' && <Bike size={14} />}
                    {mode === 'transit' && <TrainFront size={14} />}
                  </button>
                ))}
                <button
                  onClick={handleGetDirections}
                  disabled={loadingDirections}
                  className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50"
                  aria-label="Get directions"
                >
                  Get Directions
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(placesByType).map(([type, places]) => {
              const Icon = TYPE_ICONS[type];
              if (!Icon) return null;

              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={TYPE_COLORS[type]} />
                    <h3 className="font-medium text-primary capitalize">{type}s</h3>
                  </div>
                  {places.map((place) => (
                    <div
                      key={place.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 dark:border-border dark:bg-muted"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted dark:bg-muted ${TYPE_COLORS[place.type]}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-primary">{place.name}</p>
                        <p className="text-sm text-muted-foreground">{place.distance} km away</p>
                      </div>
                      {place.rating && (
                        <div className="ml-auto flex items-center gap-1">
                          <span className="text-sm font-medium text-primary">{place.rating}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {directions && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Route size={18} className="text-accent" />
                  Directions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Distance: {directions.distance} • Duration: {directions.duration}
                  </p>
                  <div className="max-h-48 overflow-y-auto">
{directions.steps.map((step, i) => (
                       <p key={i} className="text-sm text-muted-foreground">
                         {i + 1}. {step.instruction} ({step.distance})
                       </p>
                     ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}