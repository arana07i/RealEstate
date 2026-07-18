import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_preferences (
          theme,
          email_notifications,
          sms_notifications,
          timezone,
          language,
          marketing_emails
        )
      `)
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: preferences } = profile.user_preferences;

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        timezone: profile.timezone,
        two_factor_enabled: profile.two_factor_enabled,
      },
      preferences: preferences || {
        theme: 'light',
        email_notifications: true,
        sms_notifications: false,
        timezone: 'Asia/Kolkata',
        language: 'en',
        marketing_emails: false,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to get profile', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: body.full_name,
        phone: body.phone,
        avatar_url: body.avatar_url,
        timezone: body.timezone,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update profile', { error: error.message });
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update profile', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}