'use client';

import { useState } from 'react';
import { Button } from './ui/Button';

interface AmenitiesGridProps {
  amenities?: string[];
}

const DEFAULT_AMENITIES = [
  'Swimming Pool',
  'Gym',
  'Parking',
  'Garden',
  'Security',
  'Lift',
  'Power Backup',
  'Water Supply',
  'Clubhouse',
  'Children Play Area',
  'Library',
  'Tennis Court',
];

export function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  const displayAmenities = amenities && amenities.length > 0 ? amenities : DEFAULT_AMENITIES;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-primary">Amenities</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {displayAmenities.map((amenity) => (
          <div
            key={amenity}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-accent/60 hover:bg-accent/5 dark:border-border dark:bg-muted dark:text-muted-foreground dark:hover:border-accent/60 dark:hover:bg-accent/10"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            {amenity}
          </div>
        ))}
      </div>
    </div>
  );
}