'use client';

import { MapPin, Home, Building2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface PropertyMarker {
  id: string;
  title: string;
  price: number;
  location: string;
  lat: number;
  lng: number;
  status: 'active' | 'sold';
}

const SAMPLE_PROPERTIES: PropertyMarker[] = [
  { id: '1', title: 'Luxury Family Villa', price: 2500000, location: 'Downtown', lat: 40.7128, lng: -74.0060, status: 'active' },
  { id: '2', title: 'Modern Downtown Apartment', price: 1200000, location: 'City Center', lat: 40.7282, lng: -73.9942, status: 'active' },
  { id: '3', title: 'Executive Office Space', price: 1800000, location: 'Business District', lat: 40.7505, lng: -73.9934, status: 'sold' },
];

export default function MapPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Map View</h1>
        <p className="mt-4 text-lg text-muted-foreground">Explore properties on the interactive map</p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/3] rounded-xl bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={64} className="mx-auto mb-4 text-accent" />
                <p className="text-muted-foreground">Interactive Map Placeholder</p>
                <p className="text-sm text-muted-foreground">Global Property Locations</p>
              </div>
            </div>

            {SAMPLE_PROPERTIES.map((property) => (
              <div
                key={property.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 60 + 20}%`,
                }}
              >
<div className={`rounded-full p-2 ${property.status === 'active' ? 'bg-accent' : 'bg-muted-foreground'}`}>
                      <Home size={16} className="text-white" />
                    </div>
                <div className="mt-1 text-center">
                  <p className="text-xs font-medium text-primary">{property.title}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(property.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Property List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SAMPLE_PROPERTIES.map((property) => (
                  <div
                      key={property.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${property.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-primary">{property.title}</p>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                        <p className="text-sm font-semibold text-primary">{formatPrice(property.price)}</p>
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}