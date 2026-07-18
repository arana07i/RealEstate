'use client';

import { School, Hospital, ShoppingBag, Coffee, Train, Utensils } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useEffect, useState } from 'react';
import type { NearbyPlace } from '@/lib/types';

const SAMPLE_PLACES: NearbyPlace[] = [
  { id: '1', name: 'St. Mary\'s School', type: 'school', distance: 1.2, rating: 4.5 },
  { id: '2', name: 'General Hospital', type: 'hospital', distance: 3.1, rating: 4.2 },
  { id: '3', name: 'Downtown Market', type: 'shopping', distance: 0.5, rating: 4.3 },
  { id: '4', name: 'Cafe Corner', type: 'cafe', distance: 0.8, rating: 4.0 },
  { id: '5', name: 'Central Station', type: 'transport', distance: 2.5 },
  { id: '6', name: 'The Bistro', type: 'restaurant', distance: 0.9, rating: 4.6 },
];

const ICONS: Record<NearbyPlace['type'], typeof School> = {
  school: School,
  hospital: Hospital,
  shopping: ShoppingBag,
  cafe: Coffee,
  transport: Train,
  restaurant: Utensils,
};

const TYPE_LABELS: Record<NearbyPlace['type'], string> = {
  school: 'Schools',
  hospital: 'Hospitals',
  shopping: 'Shopping',
  cafe: 'Cafes',
  transport: 'Transport',
  restaurant: 'Restaurants',
};

interface NearbyPlacesProps {
  listingId?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export function NearbyPlaces({ listingId, location, lat, lng, radius = 5 }: NearbyPlacesProps) {
  const [places, setPlaces] = useState<NearbyPlace[]>(SAMPLE_PLACES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!listingId) return;

    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (lat && lng) {
          params.set('lat', lat.toString());
          params.set('lng', lng.toString());
        } else if (location) {
          params.set('location', location);
        }
        params.set('radius', radius.toString());

        const response = await fetch(`/api/listings/${listingId}/nearby?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.places?.length) {
            setPlaces(data.places);
          }
        }
      } catch (error) {
        console.error('Failed to fetch nearby places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [listingId, location, lat, lng, radius]);

  const placesByType = places.reduce((acc, place) => {
    if (!acc[place.type]) acc[place.type] = [];
    acc[place.type].push(place);
    return acc;
  }, {} as Record<string, NearbyPlace[]>);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-primary">Nearby Places</h2>
<p className="mt-2 text-sm text-muted-foreground">Loading nearby places...</p>
       </div>
     );
   }

   return (
     <div className="mt-12">
       <h2 className="text-xl font-semibold text-primary">Nearby Places</h2>
       <p className="mt-2 text-sm text-muted-foreground">{location || 'Property Location'}</p>
      
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(['school', 'hospital', 'shopping', 'cafe', 'transport', 'restaurant'] as const).map((type) => {
          const typePlaces = placesByType[type];
          if (!typePlaces?.length) return null;

          const Icon = ICONS[type];
          return (
            <Card key={type}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon size={18} className="text-accent" />
                  {TYPE_LABELS[type]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typePlaces.map((place) => (
                    <div key={place.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary text-sm">{place.name}</p>
                        <p className="text-xs text-muted-foreground">{place.distance} km away</p>
                      </div>
                      {place.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-primary">{place.rating}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}