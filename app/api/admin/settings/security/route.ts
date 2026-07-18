import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from('agency_settings')
      .select('security_settings')
      .eq('agency_id', user.agency_id)
      .single();

    if (error || !settings) {
      return NextResponse.json({
        settings: {
          password_policy: {
            min_length: 8,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_special: false,
          },
          two_factor_required: false,
          session_timeout: 3600,
          max_login_attempts: 5,
          lockout_duration: 15,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to get security settings', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from('agency_settings')
      .upsert({
        agency_id: user.agency_id,
        security_settings: {
          password_policy: body.password_policy || {
            min_length: 8,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_special: false,
          },
          two_factor_required: body.two_factor_required ?? false,
          session_timeout: body.session_timeout ?? 3600,
          max_login_attempts: body.max_login_attempts ?? 5,
          lockout_duration: body.lockout_duration ?? 15,
        },
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to update security settings', { error: error.message });
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update security settings', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}