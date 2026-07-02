import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { Agency } from '@/lib/types';

export async function getAgencyBySlug(slug: string): Promise<Agency | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    logger.error('getAgencyBySlug error', { slug, message: error.message });
    return null;
  }

  return data as Agency;
}

export async function getAgencyById(id: string): Promise<Agency | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('getAgencyById error', { id, message: error.message });
    return null;
  }

  return data as Agency;
}

export async function createAgency(agency: Omit<Agency, 'id' | 'created_at' | 'updated_at' | 'subscription_tier' | 'subscription_status' | 'trial_ends_at' | 'stripe_customer_id'>): Promise<Agency | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agencies')
    .insert({
      ...agency,
      subscription_tier: 'starter',
      subscription_status: 'trialing',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    logger.error('createAgency error', { message: error.message });
    return null;
  }

  return data as Agency;
}

export async function updateAgency(id: string, updates: Partial<Agency>): Promise<Agency | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agencies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('updateAgency error', { id, message: error.message });
    return null;
  }

  return data as Agency;
}