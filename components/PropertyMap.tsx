'use client';

import { MapPin, Navigation, Route, Store, GraduationCap, Hospital, Coffee, UtensilsCrossed, Car, Bike, PersonStanding, Train } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Coordinates, Place, DirectionsResult } from '@/lib/maps';
import { isGoogleMapsAvailable, getDefaultMapCenter, getStreetViewUrl } from '@/lib/maps';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  coordinates?: Coordinates;
}

interface PropertyMapProps {
  properties: Property[];
  center?: Coordinates;
  height?: string;
  showNearby?: boolean;
  onDirectionsClick?: (property: Property) => void;
}

const TYPE_ICONS: Record<string, typeof Store> = {
  shopping: Store,
  cafe: Coffee,
  school: GraduationCap,
  transport: Train,
  hospital: Hospital,
  restaurant: UtensilsCrossed,
};

export function PropertyMap({ properties, center, height = '400px', showNearby = false, onDirectionsClick }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [directionsMode, setDirectionsMode] = useState<'driving' | 'walking' | 'bicycling' | 'transit'>('driving');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);

  const mapCenter = center || getDefaultMapCenter(properties[0]?.location);

  useEffect(() => {
    if (navigator.geolocation && showNearby) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err)
      );
    }
  }, [showNearby]);

  useEffect(() => {
    if (selectedProperty?.coordinates && isGoogleMapsAvailable()) {
      loadGoogleMap();
    }
  }, [selectedProperty]);

  const loadGoogleMap = async () => {
    if (!window.google?.maps || !mapRef.current) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      await new Promise((resolve) => script.onload = resolve);
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: selectedProperty?.coordinates || mapCenter,
      zoom: 14,
    });

    properties.forEach((property) => {
      if (property.coordinates) {
        new window.google.maps.Marker({
          position: property.coordinates,
          map,
          title: property.title,
        });
      }
    });
  };

  const handleGetDirections = async (property: Property) => {
    if (!property.coordinates || !userLocation) return;

    const response = await fetch(
      `/api/maps/directions?origin=${userLocation.lat},${userLocation.lng}&destination=${property.coordinates.lat},${property.coordinates.lng}&mode=${directionsMode}`
    );
    const data = await response.json();
    if (data.directions) {
      setDirections(data.directions);
      setSelectedProperty(property);
      if (onDirectionsClick) onDirectionsClick(property);
    }
  };

  const handleStreetView = (property: Property) => {
    if (property.coordinates) {
      setShowStreetView(true);
      setSelectedProperty(property);
    }
  };

  const openInMaps = (coordinates: Coordinates, label: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}&query_place_id=${encodeURIComponent(label)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">Property Locations</h2>
        {isGoogleMapsAvailable() && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mode:</span>
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
                  {mode === 'transit' && <Train size={14} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
<div
             ref={mapRef}
             className="rounded-xl border border-border bg-muted dark:bg-muted overflow-hidden"
             style={{ height }}
           >
            {!isGoogleMapsAvailable() && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center p-4">
                  <MapPin size={48} className="mx-auto mb-4 text-accent" />
                  <p className="font-semibold text-primary">{selectedProperty?.location || 'Property Location'}</p>
<p className="text-sm text-muted-foreground mt-2">
                     Interactive map (requires Google Maps API key)
                   </p>
                  {selectedProperty?.coordinates && (
                    <button
                      onClick={() => openInMaps(selectedProperty.coordinates!, selectedProperty.title)}
                      className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      Open in Google Maps
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {properties.map((property) => (
              <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProperty(property)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-accent mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary truncate">{property.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{property.location}</p>
                      <p className="text-sm font-semibold text-accent mt-1">
                        ₹{property.price.toLocaleString('en-IN')}
                      </p>
                      {property.coordinates && (
                        <div className="flex gap-2 mt-2">
<button
                             onClick={(e) => { e.stopPropagation(); handleStreetView(property); }}
                             className="text-xs text-muted-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                             aria-label="View street view"
                           >
                             Street View
                           </button>
                          {userLocation && (
<button
                               onClick={(e) => { e.stopPropagation(); handleGetDirections(property); }}
                               className="text-xs text-muted-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                               aria-label="Get directions"
                             >
                               Directions
                             </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {showStreetView && selectedProperty?.coordinates && (
        <div className="fixed inset-0 z-50 bg-muted/95 flex items-center justify-center p-4">
          <button
            onClick={() => setShowStreetView(false)}
            className="absolute top-4 right-4 text-foreground text-xl rounded-full h-10 w-10 flex items-center justify-center bg-card/20 hover:bg-card/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            aria-label="Close street view"
          >
            ×
          </button>
          {isGoogleMapsAvailable() ? (
            <img
              src={getStreetViewUrl(selectedProperty.coordinates)}
              alt={`Street view of ${selectedProperty.location}`}
              className="max-w-full max-h-[80vh] rounded-lg"
            />
          ) : (
<div className="text-center text-foreground">
               <p className="mb-4">Street View - {selectedProperty.location}</p>
               <button
                 onClick={() => openInMaps(selectedProperty.coordinates!, selectedProperty.title)}
                 className="px-4 py-2 bg-accent text-primary-dark rounded-lg"
               >
                 View on OpenStreetMap
               </button>
             </div>
          )}
        </div>
      )}

      {directions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Route size={18} className="text-accent" />
              Directions to {selectedProperty?.title}
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
  );
}