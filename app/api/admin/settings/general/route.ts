import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const GeneralSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  primary_color: z.string().optional().nullable(),
  secondary_color: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const supabase = await createClient();

    const { data: agency, error } = await supabase
      .from('agencies')
      .select('name, email, phone, address, logo_url, primary_color, secondary_color, timezone')
      .eq('id', user.agency_id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    return NextResponse.json({ settings: agency });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to get general settings', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const validationResult = GeneralSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: agency, error } = await supabase
      .from('agencies')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        logo_url: body.logo_url,
        primary_color: body.primary_color,
        secondary_color: body.secondary_color,
        timezone: body.timezone,
      })
      .eq('id', user.agency_id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update general settings', { error: error.message });
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings: agency });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update general settings', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}