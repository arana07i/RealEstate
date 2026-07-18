import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';
import { sendSavedSearchAlert } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const supabase = await createClient();

    const { data: savedSearches, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch saved searches', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 });
    }

    return NextResponse.json({ searches: savedSearches || [] });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch saved searches', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const { name, filters, alert_enabled, alert_frequency } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: savedSearch, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: user.id,
        name,
        filters: filters || {},
        alert_enabled: alert_enabled ?? false,
        alert_frequency: alert_frequency || null,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create saved search', { error: error.message });
      return NextResponse.json({ error: 'Failed to create saved search' }, { status: 500 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'create',
      resource_type: 'saved_search',
      resource_id: savedSearch.id,
      user_id: user.id,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ search: savedSearch }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to create saved search', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const { id, name, filters, alert_enabled, alert_frequency } = body;

    if (!id) {
      return NextResponse.json({ error: 'Saved search ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const updateData: Partial<{
      name: string;
      filters: Record<string, unknown>;
      alert_enabled: boolean;
      alert_frequency: 'instant' | 'daily' | 'weekly' | null;
    }> = {};

    if (name !== undefined) updateData.name = name;
    if (filters !== undefined) updateData.filters = filters;
    if (alert_enabled !== undefined) updateData.alert_enabled = alert_enabled;
    if (alert_frequency !== undefined) updateData.alert_frequency = alert_frequency;

    const { data: savedSearch, error } = await supabase
      .from('saved_searches')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update saved search', { error: error.message });
      return NextResponse.json({ error: 'Failed to update saved search' }, { status: 500 });
    }

    if (!savedSearch) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'update',
      resource_type: 'saved_search',
      resource_id: id,
      user_id: user.id,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ search: savedSearch });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update saved search', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Saved search ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Failed to delete saved search', { error: error.message });
      return NextResponse.json({ error: 'Failed to delete saved search' }, { status: 500 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'delete',
      resource_type: 'saved_search',
      resource_id: id,
      user_id: user.id,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to delete saved search', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendSavedSearchAlerts(supabase: SupabaseClient, agencyId: string | null) {
  if (!agencyId) return;

  const { data: savedSearches } = await supabase
    .from('saved_searches')
    .select(`
      *,
      user: profiles (email, full_name, agency_id)
    `)
    .eq('alert_enabled', true)
    .eq('user.agency_id', agencyId);

  for (const search of savedSearches || []) {
    if (!search.user?.email) continue;

    const filters = search.filters as { 
      location?: string; 
      minPrice?: number; 
      maxPrice?: number; 
      status?: string;
      featured?: boolean;
    } | null;

    let propertyQuery = supabase
      .from('listings')
      .select('id, title, location, price, bedrooms, bathrooms, image_urls')
      .eq('status', 'active')
      .eq('draft', false)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (filters?.location) {
      propertyQuery = propertyQuery.ilike('location', `%${filters.location}%`);
    }
    if (filters?.minPrice) {
      propertyQuery = propertyQuery.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      propertyQuery = propertyQuery.lte('price', filters.maxPrice);
    }

    const { data: properties } = await propertyQuery;

    if (!properties || properties.length === 0) continue;

    const agencyResult = await supabase
      .from('agencies')
      .select('name, logo_url, primary_color, secondary_color')
      .eq('id', agencyId)
      .single();

    const agency = agencyResult.data ? {
      name: agencyResult.data.name,
      logoUrl: agencyResult.data.logo_url,
      primaryColor: agencyResult.data.primary_color,
      secondaryColor: agencyResult.data.secondary_color,
    } : undefined;

    await sendSavedSearchAlert(
      search.user.email,
      {
        searchName: search.name,
        properties: properties.map(p => ({
          id: p.id,
          title: p.title,
          location: p.location,
          price: p.price,
          bedrooms: p.bedrooms || undefined,
          bathrooms: p.bathrooms || undefined,
          image_url: p.image_urls?.[0] || undefined,
        })),
      },
      agency
    ).catch((e) => logger.error('Failed to send saved search alert', { error: e.message }));
  }
}