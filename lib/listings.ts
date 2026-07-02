import { type Listing, type ListingFilters } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

async function getPublicClient(): Promise<SupabaseClient> {
  const staticClient = createStaticClient();
  if (staticClient) return staticClient;
  return createClient();
}

export async function getListings(filters: ListingFilters = {}, agencyId?: string): Promise<Listing[]> {
  const supabase = await getPublicClient();

  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', filters.status ?? 'active')
    .eq('draft', false)
    .order('created_at', { ascending: false });

  if (agencyId) {
    query = query.eq('agency_id', agencyId);
  }

  if (filters.location && filters.location !== 'All Locations') {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.minPrice != null && !Number.isNaN(filters.minPrice)) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice != null && !Number.isNaN(filters.maxPrice)) {
    query = query.lte('price', filters.maxPrice);
  }
  if (filters.featured) {
    query = query.eq('featured', true);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('getListings error', { message: error.message });
    return [];
  }

  return (data ?? []) as Listing[];
}

export async function getAllListingsAdmin(agencyId?: string): Promise<Listing[]> {
  const supabase = await createClient();

  let query = supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (agencyId) {
    query = query.eq('agency_id', agencyId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('getAllListingsAdmin error', { message: error.message });
    return [];
  }

  return (data ?? []) as Listing[];
}

export async function getListingById(id: string, agencyId?: string): Promise<Listing | null> {
  const supabase = await getPublicClient();

  let query = supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('draft', false);

  if (agencyId) {
    query = query.eq('agency_id', agencyId);
  }

  const { data, error } = await query.single();

  if (error) {
    logger.error('getListingById error', { id, message: error.message });
    return null;
  }

  return data as Listing;
}

/** Authenticated fetch — includes sold listings for admin edit */
export async function getListingByIdAdmin(id: string, agencyId?: string): Promise<Listing | null> {
  const supabase = await createClient();

  let query = supabase
    .from('listings')
    .select('*')
    .eq('id', id);

  if (agencyId) {
    query = query.eq('agency_id', agencyId);
  }

  const { data, error } = await query.single();

  if (error) {
    logger.error('getListingByIdAdmin error', { id, message: error.message });
    return null;
  }

  return data as Listing;
}

export async function getListingIds(agencyId?: string): Promise<string[]> {
  const supabase = createStaticClient();
  if (!supabase) return [];

  let query = supabase
    .from('listings')
    .select('id')
    .eq('status', 'active')
    .eq('draft', false);

  if (agencyId) {
    query = query.eq('agency_id', agencyId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('getListingIds error', { message: error.message });
    return [];
  }
  return (data ?? []).map((row) => row.id);
}

export async function getAdminStats(agencyId?: string) {
  const supabase = await createClient();

  let query = supabase.from('listings').select('status');

  if (agencyId) {
    query = query.eq('agency_id', agencyId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('getAdminStats error', { message: error.message });
    return { total: 0, active: 0, sold: 0 };
  }

  const listings = data ?? [];
  return {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    sold: listings.filter((l) => l.status === 'sold').length,
  };
}
