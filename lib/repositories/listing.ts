import type { Listing, ListingFilters, PaginationParams, PaginatedResult } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ListingRepository {
  findAll(filters?: ListingFilters, agencyId?: string): Promise<Listing[]>;
  findAllAdmin(agencyId?: string): Promise<Listing[]>;
  findById(id: string, agencyId?: string): Promise<Listing | null>;
  findByIdAdmin(id: string, agencyId?: string): Promise<Listing | null>;
  findIds(agencyId?: string): Promise<string[]>;
  getStats(agencyId?: string): Promise<{ total: number; active: number; sold: number }>;
  findAllPaginated(filters: ListingFilters, agencyId?: string, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  findAllAdminPaginated(agencyId?: string, pagination?: PaginationParams): Promise<PaginatedResult<Listing>>;
  countAll(filters?: ListingFilters, agencyId?: string): Promise<number>;
  countAllAdmin(agencyId?: string): Promise<number>;
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
    const [total, active, sold] = await Promise.all([
      this.countAllAdmin(agencyId),
      this.countAll({ status: 'active' }, agencyId),
      this.countAll({ status: 'sold' }, agencyId),
    ]);

    return { total, active, sold };
  }

  async findAllPaginated(filters: ListingFilters = {}, agencyId?: string, pagination: PaginationParams = { page: 1, pageSize: 12 }): Promise<PaginatedResult<Listing>> {
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;

    let query = this.supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', filters.status ?? 'active')
      .eq('draft', false)
      .order('created_at', { ascending: false })
      .range(from, to);

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

    const { data, error, count } = await query;

    if (error) {
      return {
        data: [],
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalRecords: 0,
        totalPages: 0,
      };
    }

    const totalRecords = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pagination.pageSize));

    return {
      data: (data ?? []) as Listing[],
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalRecords,
      totalPages,
    };
  }

  async findAllAdminPaginated(agencyId?: string, pagination: PaginationParams = { page: 1, pageSize: 12 }): Promise<PaginatedResult<Listing>> {
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;

    let query = this.supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    const { data, error, count } = await query;

    if (error) {
      return {
        data: [],
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalRecords: 0,
        totalPages: 0,
      };
    }

    const totalRecords = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pagination.pageSize));

    return {
      data: (data ?? []) as Listing[],
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalRecords,
      totalPages,
    };
  }

  async countAll(filters: ListingFilters = {}, agencyId?: string): Promise<number> {
    let query = this.supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', filters.status ?? 'active')
      .eq('draft', false);

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

    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  }

  async countAllAdmin(agencyId?: string): Promise<number> {
    let query = this.supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });

    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  }
}
