import { createClient } from '@/lib/supabase/server';
import type { Lead, LeadNote, LeadFilters } from '@/lib/types';
import { logger } from '@/lib/logger';

export interface LeadRepository {
  findAll(filters: LeadFilters, agencyId: string): Promise<Lead[]>;
  findById(id: string, agencyId: string): Promise<Lead | null>;
  create(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'tags' | 'notes_count' | 'last_activity' | 'assigned_to_name'> & { tag_ids?: string[] }, agencyId: string): Promise<Lead | null>;
  update(id: string, updates: Partial<Pick<Lead, 'first_name' | 'last_name' | 'email' | 'phone' | 'status' | 'source' | 'value' | 'assigned_to'>>, agencyId: string): Promise<Lead | null>;
  delete(id: string, agencyId: string): Promise<boolean>;
  getNotes(leadId: string, agencyId: string): Promise<LeadNote[]>;
  createNote(leadId: string, authorId: string, authorName: string | null, content: string, agencyId: string): Promise<LeadNote | null>;
  updateNote(leadId: string, noteId: string, content: string, agencyId: string): Promise<LeadNote | null>;
  deleteNote(leadId: string, noteId: string, agencyId: string): Promise<boolean>;
}

export class SupabaseLeadRepository implements LeadRepository {
  async findAll(filters: LeadFilters, agencyId: string): Promise<Lead[]> {
    const supabase = await createClient();

    let query = supabase
      .from('leads')
      .select(`
        id,
        agency_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        source,
        assigned_to,
        value,
        created_at,
        updated_at
      `)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.source && filters.source.length > 0) {
      query = query.in('source', filters.source);
    }

    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters.date_range) {
      const now = new Date();
      let startDate: Date;
      switch (filters.date_range) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      query = query.gte('created_at', startDate.toISOString());
    }

    if (filters.value_min !== undefined) {
      query = query.gte('value', filters.value_min);
    }

    if (filters.value_max !== undefined) {
      query = query.lte('value', filters.value_max);
    }

    const { data: leads, error } = await query;

    if (error) {
      logger.error('Failed to fetch leads', { error: error.message });
      return [];
    }

    let filteredLeads = leads ?? [];

    if (filters.tags && filters.tags.length > 0) {
      const leadsWithMatchingTags = await Promise.all(
        filteredLeads.map(async (lead) => {
          const { data: leadTags } = await supabase
            .from('lead_tags')
            .select('tag_id')
            .eq('lead_id', lead.id);

          const leadTagIds = leadTags?.map((t: { tag_id: string }) => t.tag_id) ?? [];
          const hasAllTags = filters.tags!.every((tag) => leadTagIds.includes(tag));
          return hasAllTags ? lead : null;
        })
      );
      filteredLeads = leadsWithMatchingTags.filter((l): l is typeof leads[0] => l !== null);
    }

    const leadsWithDetails = await Promise.all(
      filteredLeads.map(async (lead) => {
        const { data: leadTags } = await supabase
          .from('lead_tags')
          .select(`tag_id, tags:tags(name, color)`)
          .eq('lead_id', lead.id);

        const { count: notesCount } = await supabase
          .from('lead_notes')
          .select('id', { count: 'exact' })
          .eq('lead_id', lead.id);

        const { data: assignedUser } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', lead.assigned_to ?? '')
          .single();

        const { data: lastActivity } = await supabase
          .from('lead_notes')
          .select('created_at')
          .eq('lead_id', lead.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...lead,
          tags: leadTags?.map((t) => ({
            id: t.tag_id,
            name: t.tags?.[0]?.name ?? '',
            color: t.tags?.[0]?.color ?? '',
          })) ?? [],
          notes_count: notesCount ?? 0,
          assigned_to_name: assignedUser?.full_name ?? undefined,
          last_activity: lastActivity?.created_at ?? lead.created_at,
        };
      })
    );

    return leadsWithDetails;
  }

  async findById(id: string, agencyId: string): Promise<Lead | null> {
    const supabase = await createClient();

    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        id,
        agency_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        source,
        assigned_to,
        value,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('agency_id', agencyId)
      .single();

    if (error || !lead) return null;

    const { data: leadTags } = await supabase
      .from('lead_tags')
      .select(`tag_id, tags:tags(name, color)`)
      .eq('lead_id', lead.id);

    const { count: notesCount } = await supabase
      .from('lead_notes')
      .select('id', { count: 'exact' })
      .eq('lead_id', lead.id);

    const { data: assignedUser } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', lead.assigned_to ?? '')
      .single();

    const { data: lastActivity } = await supabase
      .from('lead_notes')
      .select('created_at')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      ...lead,
      tags: leadTags?.map((t) => ({
        id: t.tag_id,
        name: t.tags?.[0]?.name ?? '',
        color: t.tags?.[0]?.color ?? '',
      })) ?? [],
      notes_count: notesCount ?? 0,
      assigned_to_name: assignedUser?.full_name ?? undefined,
      last_activity: lastActivity?.created_at ?? lead.created_at,
    };
  }

  async create(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'tags' | 'notes_count' | 'last_activity' | 'assigned_to_name' | 'agency_id'> & { tag_ids?: string[] }, agencyId: string): Promise<Lead | null> {
    const supabase = await createClient();

    const { tag_ids, ...leadData } = lead;

    const { data, error } = await supabase
      .from('leads')
      .insert({ ...leadData, agency_id: agencyId })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create lead', { error: error.message });
      return null;
    }

    if (tag_ids && tag_ids.length > 0) {
      const leadTagInserts = tag_ids.map((tagId) => ({
        lead_id: data.id,
        tag_id: tagId,
      }));

      await supabase.from('lead_tags').insert(leadTagInserts);
    }

    return {
      ...data,
      tags: [],
      notes_count: 0,
      last_activity: data.created_at,
    };
  }

  async update(id: string, updates: Partial<Pick<Lead, 'first_name' | 'last_name' | 'email' | 'phone' | 'status' | 'source' | 'value' | 'assigned_to'>>, agencyId: string): Promise<Lead | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .eq('agency_id', agencyId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update lead', { error: error.message });
      return null;
    }

    return this.findById(id, agencyId);
  }

  async delete(id: string, agencyId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('agency_id', agencyId);

    if (error) {
      logger.error('Failed to delete lead', { error: error.message });
      return false;
    }

    return true;
  }

  async getNotes(leadId: string, agencyId: string): Promise<LeadNote[]> {
    const supabase = await createClient();

    const { data: notes, error } = await supabase
      .from('lead_notes')
      .select(`
        id,
        lead_id,
        author_id,
        author_name,
        content,
        created_at,
        updated_at
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch lead notes', { error: error.message });
      return [];
    }

    return notes ?? [];
  }

  async createNote(leadId: string, authorId: string, authorName: string | null, content: string, agencyId: string): Promise<LeadNote | null> {
    const supabase = await createClient();

    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('agency_id', agencyId)
      .single();

    if (!lead) return null;

    const { data, error } = await supabase
      .from('lead_notes')
      .insert({
        lead_id: leadId,
        author_id: authorId,
        author_name: authorName,
        content,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create lead note', { error: error.message });
      return null;
    }

    return data;
  }

  async updateNote(leadId: string, noteId: string, content: string, agencyId: string): Promise<LeadNote | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('lead_notes')
      .update({ content })
      .eq('id', noteId)
      .eq('lead_id', leadId)
      .select(`
        id,
        lead_id,
        author_id,
        author_name,
        content,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      logger.error('Failed to update lead note', { error: error.message });
      return null;
    }

    return data;
  }

  async deleteNote(leadId: string, noteId: string, agencyId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('lead_notes')
      .delete()
      .eq('id', noteId)
      .eq('lead_id', leadId);

    if (error) {
      logger.error('Failed to delete lead note', { error: error.message });
      return false;
    }

    return true;
  }
}