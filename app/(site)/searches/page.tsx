'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/EmptyState';
import { formatPrice } from '@/lib/utils';
import { Search, Plus, Bell, Trash2, Edit2 } from 'lucide-react';

interface SavedSearch {
  id: string;
  name: string;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  alert_enabled: boolean;
  alert_frequency: 'daily' | 'weekly' | 'instant';
  created_at: string;
}

const SAMPLE_SEARCHES: SavedSearch[] = [
  { id: '1', name: 'Downtown Apartments', location: 'Downtown', minPrice: 500000, maxPrice: 2000000, alert_enabled: true, alert_frequency: 'daily', created_at: '2024-01-15' },
  { id: '2', name: 'Investment Properties', location: 'Business District', minPrice: 800000, maxPrice: 3000000, alert_enabled: true, alert_frequency: 'weekly', created_at: '2024-02-20' },
  { id: '3', name: 'Luxury Homes', location: 'All Locations', alert_enabled: false, alert_frequency: 'daily', created_at: '2024-03-10' },
];

export default function SavedSearchesPage() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(SAMPLE_SEARCHES);
  const [isCreating, setIsCreating] = useState(false);

  const deleteSearch = (id: string) => {
    setSavedSearches(savedSearches.filter(s => s.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Saved Searches</h1>
        <p className="mt-4 text-lg text-muted-foreground">Get notified when matching properties are listed</p>
      </div>

      <div className="mt-8">
        <div className="mb-6">
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Create New Search
          </button>
        </div>

        <div className="space-y-4">
          {savedSearches.map((search) => (
            <Card key={search.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Search size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{search.name}</h3>
                      <p className="text-sm text-muted-foreground">{search.location}</p>
                      {search.minPrice && search.maxPrice && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(search.minPrice)} - {formatPrice(search.maxPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {search.alert_enabled && (
                      <div className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                        <Bell size={12} />
                        {search.alert_frequency}
                      </div>
                    )}
                    <button className="p-1 text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteSearch(search.id)}
                      className="p-1 text-muted-foreground hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {savedSearches.length === 0 && (
            <EmptyState
              icon="search"
              title="No saved searches"
              description="Create a search to get alerts when matching properties are listed."
              action={{
                label: "Create New Search",
                onClick: () => setIsCreating(true),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}