import { type Listing, type ListingFilters, type PaginatedResult } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { SupabaseListingRepository } from '@/lib/repositories/listing';

async function getPublicClient(): Promise<SupabaseClient> {
  const staticClient = createStaticClient();
  if (staticClient) return staticClient;
  return createClient();
}

const DEFAULT_PAGE_SIZE = 12;

export async function getListings(filters: ListingFilters = {}, agencyId?: string, page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedResult<Listing>> {
  const supabase = await getPublicClient();
  const repository = new SupabaseListingRepository(supabase);
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  return repository.findAllPaginated(filters, agencyId, { page: safePage, pageSize: safePageSize });
}

export async function getAllListingsAdmin(agencyId?: string, page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedResult<Listing>> {
  const supabase = await createClient();
  const repository = new SupabaseListingRepository(supabase);
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  return repository.findAllAdminPaginated(agencyId, { page: safePage, pageSize: safePageSize });
}

export async function getListingById(id: string, agencyId?: string): Promise<Listing | null> {
  const supabase = await getPublicClient();
  const repository = new SupabaseListingRepository(supabase);
  return repository.findById(id, agencyId);
}

export async function getListingByIdAdmin(id: string, agencyId?: string): Promise<Listing | null> {
  const supabase = await createClient();
  const repository = new SupabaseListingRepository(supabase);
  return repository.findByIdAdmin(id, agencyId);
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
  const repository = new SupabaseListingRepository(supabase);
  return repository.getStats(agencyId);
}
