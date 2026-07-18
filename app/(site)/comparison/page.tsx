'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { X } from 'lucide-react';

interface ComparisonProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  image: string;
}

const SAMPLE_PROPERTIES: ComparisonProperty[] = [
  { id: '1', title: 'Luxury Family Villa', location: 'Downtown', price: 2500000, bedrooms: 4, bathrooms: 3, area_sqft: 2500, image: '/images/placeholder-property.svg' },
  { id: '2', title: 'Modern Downtown Apartment', location: 'City Center', price: 1200000, bedrooms: 3, bathrooms: 2, area_sqft: 1800, image: '/images/placeholder-property.svg' },
  { id: '3', title: 'Beachfront Villa', location: 'Waterfront', price: 1800000, bedrooms: 3, bathrooms: 2, area_sqft: 1500, image: '/images/placeholder-property.svg' },
];

export default function ComparisonPage() {
  const [selectedProperties, setSelectedProperties] = useState<ComparisonProperty[]>(SAMPLE_PROPERTIES.slice(0, 2));

  const removeProperty = (id: string) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== id));
  };

  const addProperty = (id: string) => {
    const property = SAMPLE_PROPERTIES.find(p => p.id === id);
    if (property && selectedProperties.length < 4) {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const availableProperties = SAMPLE_PROPERTIES.filter(p => !selectedProperties.find(sp => sp.id === p.id));

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Property Comparison</h1>
        <p className="mt-4 text-lg text-muted-foreground">Compare properties side by side to find your perfect match</p>
      </div>

      <div className="mt-12">
        <div className="overflow-x-auto">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedProperties.length + 1}, 1fr)` }}>
            <div className="space-y-4">
              <p className="font-semibold text-primary">Property</p>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-sm text-muted-foreground">Bedrooms</p>
              <p className="text-sm text-muted-foreground">Bathrooms</p>
              <p className="text-sm text-muted-foreground">Area (sq ft)</p>
            </div>

            {selectedProperties.map((property) => (
              <div key={property.id} className="relative rounded-xl border border-border bg-card p-4">
                <button
                  onClick={() => removeProperty(property.id)}
                  className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  <X size={16} />
                </button>
                <div className="aspect-video w-full rounded-lg bg-muted" aria-label={`${property.title} - Property image placeholder`} />
                <p className="mt-3 font-semibold text-primary">{property.title}</p>
                <p className="text-sm text-muted-foreground">{property.location}</p>
                <p className="mt-2 text-lg font-bold text-primary">{formatPrice(property.price)}</p>
                <p className="text-sm text-muted-foreground">{property.bedrooms} Bedrooms</p>
                <p className="text-sm text-muted-foreground">{property.bathrooms} Bathrooms</p>
                <p className="text-sm text-muted-foreground">{property.area_sqft} sq ft</p>
              </div>
            ))}

            {selectedProperties.length < 4 && (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted p-4">
                <p className="mb-4 text-sm font-medium text-muted-foreground">Add Property</p>
                <select
                  onChange={(e) => addProperty(e.target.value)}
                  className="input w-full"
                  defaultValue=""
                  aria-label="Select property to add"
                >
                  <option value="" disabled>Select property</option>
                  {availableProperties.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}