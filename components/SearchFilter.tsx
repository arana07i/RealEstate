'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { SHIMLA_LOCATIONS } from '@/lib/utils';

export function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const location = searchParams?.get('location') ?? '';
  const minPrice = searchParams?.get('minPrice') ?? '';
  const maxPrice = searchParams?.get('maxPrice') ?? '';

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
    updateFilters({
      location: (form.get('location') as string) || '',
      minPrice: (form.get('minPrice') as string) || '',
      maxPrice: (form.get('maxPrice') as string) || '',
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push('/#listings', { scroll: false });
    });
  };

  const hasFilters = location || minPrice || maxPrice;

  return (
    <form
      onSubmit={handleSubmit}
      className="card mx-auto max-w-4xl p-6"
      aria-label="Search and filter properties"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <label htmlFor="location" className="label">Location</label>
          <select
            id="location"
            name="location"
            defaultValue={location}
            className="input"
          >
            {SHIMLA_LOCATIONS.map((loc) => (
              <option key={loc} value={loc === 'All Locations' ? '' : loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="minPrice" className="label">Min Price (₹)</label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min="0"
            step="100000"
            defaultValue={minPrice}
            placeholder="50,00,000"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="maxPrice" className="label">Max Price (₹)</label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min="0"
            step="100000"
            defaultValue={maxPrice}
            placeholder="5,00,00,000"
            className="input"
          />
        </div>

        <div className="flex items-end gap-2">
          <button type="submit" className="btn btn-secondary flex-1" disabled={isPending}>
            {isPending ? 'Searching…' : 'Search'}
          </button>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="btn btn-ghost px-4">
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
