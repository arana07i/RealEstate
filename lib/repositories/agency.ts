import type { Agency } from '@/lib/types';

export interface AgencyRepository {
  findById(id: string): Promise<Agency | null>;
  findBySlug(slug: string): Promise<Agency | null>;
  create(agency: Omit<Agency, 'id' | 'created_at' | 'updated_at' | 'subscription_tier' | 'subscription_status' | 'trial_ends_at' | 'stripe_customer_id'>): Promise<Agency | null>;
  update(id: string, updates: Partial<Agency>): Promise<Agency | null>;
}

export class SupabaseAgencyRepository implements AgencyRepository {
  constructor(private supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>) {}

  async findById(id: string): Promise<Agency | null> {
    const { data, error } = await this.supabase
      .from('agencies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }
    return data as Agency;
  }

  async findBySlug(slug: string): Promise<Agency | null> {
    const { data, error } = await this.supabase
      .from('agencies')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return null;
    }
    return data as Agency;
  }

  async create(agency: Omit<Agency, 'id' | 'created_at' | 'updated_at' | 'subscription_tier' | 'subscription_status' | 'trial_ends_at' | 'stripe_customer_id'>): Promise<Agency | null> {
    const { data, error } = await this.supabase
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
      return null;
    }
    return data as Agency;
  }

  async update(id: string, updates: Partial<Agency>): Promise<Agency | null> {
    const { data, error } = await this.supabase
      .from('agencies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return null;
    }
    return data as Agency;
  }
}