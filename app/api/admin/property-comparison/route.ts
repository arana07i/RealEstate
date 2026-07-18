import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const supabase = await createClient();

    const { data: comparedProperties, error } = await supabase
      .from('property_comparison')
      .select(`
        *,
        listing: listings (
          id,
          title,
          location,
          price,
          image_urls,
          status,
          bedrooms,
          bathrooms,
          area_sqft
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch property comparison', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch property comparison' }, { status: 500 });
    }

    return NextResponse.json({ properties: comparedProperties || [] });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch property comparison', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const { listing_id } = body;

    if (!listing_id || typeof listing_id !== 'string') {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: comparison, error } = await supabase
      .from('property_comparison')
      .insert({
        user_id: user.id,
        listing_id,
      })
      .select(`
        *,
        listing: listings (
          id,
          title,
          location,
          price,
          image_urls,
          status,
          bedrooms,
          bathrooms,
          area_sqft
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Property already in comparison list' }, { status: 409 });
      }
      logger.error('Failed to add property to comparison', { error: error.message });
      return NextResponse.json({ error: 'Failed to add property to comparison' }, { status: 500 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'create',
      resource_type: 'property_comparison',
      resource_id: comparison.id,
      user_id: user.id,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ property: comparison }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to add property to comparison', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const { listing_id } = body;

    if (!listing_id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('property_comparison')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listing_id);

    if (error) {
      logger.error('Failed to remove property from comparison', { error: error.message });
      return NextResponse.json({ error: 'Failed to remove property from comparison' }, { status: 500 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'delete',
      resource_type: 'property_comparison',
      resource_id: listing_id,
      user_id: user.id,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to remove property from comparison', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}