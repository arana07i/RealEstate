import type { Review, ReviewFilters, PaginatedResult, PaginationParams } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ReviewRepository {
  findAll(filters?: ReviewFilters, agencyId?: string): Promise<Review[]>;
  findAllPaginated(filters: ReviewFilters, agencyId?: string, pagination?: PaginationParams): Promise<PaginatedResult<Review>>;
  findById(id: string, agencyId?: string): Promise<Review | null>;
  create(data: { listing_id: string; user_id: string; rating: number; comment?: string | null }, agencyId?: string): Promise<Review | null>;
  delete(id: string, agencyId?: string): Promise<boolean>;
}

export class SupabaseReviewRepository implements ReviewRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(filters: ReviewFilters = {}, agencyId?: string): Promise<Review[]> {
    let query = this.supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (full_name, avatar_url),
        listings:listing_id (title, location, agency_id)
      `)
      .order('created_at', { ascending: false });

    if (filters.listing_id) {
      query = query.eq('listing_id', filters.listing_id);
    }

    if (agencyId) {
      query = query.eq('listings.agency_id', agencyId);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as Review[];
  }

  async findAllPaginated(filters: ReviewFilters = {}, agencyId?: string, pagination: PaginationParams = { page: 1, pageSize: 12 }): Promise<PaginatedResult<Review>> {
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;

    let query = this.supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (full_name, avatar_url),
        listings:listing_id (title, location, agency_id)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters.listing_id) {
      query = query.eq('listing_id', filters.listing_id);
    }

    if (agencyId) {
      query = query.eq('listings.agency_id', agencyId);
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
      data: (data ?? []) as Review[],
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalRecords,
      totalPages,
    };
  }

  async findById(id: string, agencyId?: string): Promise<Review | null> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (full_name, avatar_url),
        listings:listing_id (title, location)
      `)
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Review;
  }

  async create(data: { listing_id: string; user_id: string; rating: number; comment?: string | null }, agencyId?: string): Promise<Review | null> {
    const { data: review, error } = await this.supabase
      .from('reviews')
      .insert({
        listing_id: data.listing_id,
        user_id: data.user_id,
        rating: data.rating,
        comment: data.comment,
      })
      .select(`
        *,
        profiles:user_id (full_name, avatar_url),
        listings:listing_id (title, location)
      `)
      .single();

    if (error) return null;
    return review as Review;
  }

  async delete(id: string, agencyId?: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    return !error;
  }
}