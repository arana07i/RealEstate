'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition, useState, useEffect, useMemo } from 'react';
import { Search, MapPin, DollarSign, Bed, X, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface SavedSearch {
  id: number;
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  timestamp: string;
}

const GENERIC_LOCATIONS = [
  'All Locations',
  'Downtown',
  'City Center',
  'Business District',
  'Waterfront',
  'Suburban Area',
  'Financial District',
  'Residential Community',
  'Historic District',
  'Urban Center',
  'Coastal Area',
  'Premium Neighborhood',
  'Green Community',
] as const;

const POPULAR_SEARCHES = ['Downtown', 'Waterfront', 'City Center', 'Business District', 'Premium Neighborhood', 'Suburban Area'];

export function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState(searchParams?.get('location') ?? '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const location = searchParams?.get('location') ?? '';
  const minPrice = searchParams?.get('minPrice') ?? '';
  const maxPrice = searchParams?.get('maxPrice') ?? '';
  const bedrooms = searchParams?.get('bedrooms') ?? '';

  const locationSuggestions = useMemo(() => {
    if (!locationQuery) return GENERIC_LOCATIONS.filter(l => l !== 'All Locations').slice(0, 5);
    return GENERIC_LOCATIONS.filter(l => 
      l.toLowerCase().includes(locationQuery.toLowerCase()) && l !== 'All Locations'
    ).slice(0, 5);
  }, [locationQuery]);

  const savedSearches = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('savedSearches') || '[]');
    } catch {
      return [];
    }
  }, []);

  const saveSearch = useCallback((searchData: { location: string; minPrice: string; maxPrice: string; bedrooms: string }) => {
    if (typeof window === 'undefined') return;
    const newSearch = { ...searchData, id: Date.now(), timestamp: new Date().toISOString() };
    const updated = [newSearch, ...savedSearches.filter((s: SavedSearch) => s.location !== searchData.location).slice(0, 4)];
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  }, [savedSearches]);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      startTransition(() => {
        router.push(`/?${params.toString()}#listings`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const updates = {
      location: (form.get('location') as string) || '',
      minPrice: (form.get('minPrice') as string) || '',
      maxPrice: (form.get('maxPrice') as string) || '',
      bedrooms: (form.get('bedrooms') as string) || '',
    };
    saveSearch(updates);
    updateFilters(updates);
    setIsMobileOpen(false);
  };

  const clearFilters = () => {
    setLocationQuery('');
    startTransition(() => {
      router.push('/#listings', { scroll: false });
    });
  };

  const applySavedSearch = (search: SavedSearch) => {
    setLocationQuery(search.location);
    updateFilters({
      location: search.location,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      bedrooms: search.bedrooms,
    });
    setIsMobileOpen(false);
  };

  const hasFilters = location || minPrice || maxPrice || bedrooms;

  useEffect(() => {
    setLocationQuery(location);
  }, [location]);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="lg:hidden mb-4">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full"
        >
          <Filter size={16} />
          {isMobileOpen ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      <AnimatePresence>
        {savedSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
               <Clock size={12} />
               Recent Searches
             </p>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((search: SavedSearch) => (
                <button
                  key={search.id}
                  type="button"
                  onClick={() => applySavedSearch(search)}
                  className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  {search.location || 'All Locations'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit}
        className={`${isMobileOpen ? 'grid' : 'hidden lg:grid'} gap-4 sm:grid-cols-2 lg:grid-cols-4`}
        aria-label="Search and filter properties"
      >
        <div className="relative sm:col-span-2 lg:col-span-1">
<label htmlFor="location" className="label text-muted-foreground">
             Location
           </label>
           <div className="relative">
             <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="location"
              name="location"
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search location..."
              className="input pl-10 rounded-xl focus-visible:ring-2 focus-visible:ring-accent/50"
              autoComplete="off"
            />
          </div>

          <AnimatePresence>
            {showSuggestions && locationSuggestions.length > 0 && (
<motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="absolute z-20 mt-2 w-full rounded-xl bg-card dark:bg-muted shadow-xl border border-border/50 dark:border-border/50 max-h-60 overflow-y-auto"
                   >
                {locationSuggestions.map((loc) => (
<button
                     key={loc}
                     type="button"
                     onClick={() => {
                       setLocationQuery(loc);
                       setShowSuggestions(false);
                     }}
                     className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors first:rounded-t-xl last:rounded-b-xl"
                   >
                    {loc}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

<div>
<label htmlFor="minPrice" className="label text-muted-foreground">
              Min Price ($)
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
             <input
               id="minPrice"
               name="minPrice"
               type="number"
               min="0"
               step="10000"
               defaultValue={minPrice}
               placeholder="500,000"
               className="input pl-10 rounded-xl focus-visible:ring-2 focus-visible:ring-accent/50"
             />
           </div>
        </div>

        <div>
<label htmlFor="maxPrice" className="label text-muted-foreground">
              Max Price ($)
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
             <input
               id="maxPrice"
               name="maxPrice"
               type="number"
               min="0"
               step="10000"
               defaultValue={maxPrice}
               placeholder="5,000,000"
               className="input pl-10 rounded-xl focus-visible:ring-2 focus-visible:ring-accent/50"
             />
           </div>
        </div>

        <div>
<label htmlFor="bedrooms" className="label text-muted-foreground">
             Bedrooms
           </label>
           <div className="relative">
             <Bed size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              id="bedrooms"
              name="bedrooms"
              defaultValue={bedrooms}
              className="input pl-10 appearance-none rounded-xl focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              <option value="">Any</option>
              <option value="1">1+ Beds</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
              <option value="5">5+ Beds</option>
            </select>
          </div>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
          <Button type="submit" variant="primary" className="flex-1" loading={isPending}>
            <Search size={16} /> Search
          </Button>
          {hasFilters && (
            <Button type="button" variant="ghost" onClick={clearFilters} className="px-3">
              <X size={16} />
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6">
<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Popular Searches</p>
         <div className="flex flex-wrap gap-2">
           {POPULAR_SEARCHES.map((search) => (
             <button
               key={search}
               type="button"
               onClick={() => {
                 setLocationQuery(search);
                 updateFilters({ location: search, minPrice: '', maxPrice: '', bedrooms: '' });
               }}
               className="text-xs px-3 py-1 rounded-full bg-muted dark:bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
             >
               {search}
             </button>
           ))}
         </div>
      </div>
    </div>
  );
}