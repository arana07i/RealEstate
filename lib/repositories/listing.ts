import type { Listing, ListingFilters } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ListingRepository {
  findAll(filters?: ListingFilters, agencyId?: string): Promise<Listing[]>;
  findAllAdmin(agencyId?: string): Promise<Listing[]>;
  findById(id: string, agencyId?: string): Promise<Listing | null>;
  findByIdAdmin(id: string, agencyId?: string): Promise<Listing | null>;
  findIds(agencyId?: string): Promise<string[]>;
  getStats(agencyId?: string): Promise<{ total: number; active: number; sold: number }>;
}

export class SupabaseListingRepository implements ListingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(filters: ListingFilters = {}, agencyId?: string): Promise<Listing[]> {
    let query = this.supabase
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
    if (error) return [];
    return (data ?? []) as Listing[];
  }

  async findAllAdmin(agencyId?: string): Promise<Listing[]> {
    let query = this.supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as Listing[];
  }

  async findById(id: string, agencyId?: string): Promise<Listing | null> {
    let query = this.supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .eq('draft', false);

    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    const { data, error } = await query.single();
    if (error) return null;
    return data as Listing;
  }

  async findByIdAdmin(id: string, agencyId?: string): Promise<Listing | null> {
    let query = this.supabase
      .from('listings')
      .select('*')
      .eq('id', id);

    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    const { data, error } = await query.single();
    if (error) return null;
    return data as Listing;
  }

  async findIds(agencyId?: string): Promise<string[]> {
    let query = this.supabase
      .from('listings')
      .select('id')
      .eq('status', 'active')
      .eq('draft', false);

    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []).map((row) => row.id);
  }

  async getStats(agencyId?: string): Promise<{ total: number; active: number; sold: number }> {
    let query = this.supabase.from('listings').select('status');

    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    const { data, error } = await query;
    if (error) return { total: 0, active: 0, sold: 0 };

    const listings = data ?? [];
    return {
      total: listings.length,
      active: listings.filter((l) => l.status === 'active').length,
      sold: listings.filter((l) => l.status === 'sold').length,
    };
  }
}