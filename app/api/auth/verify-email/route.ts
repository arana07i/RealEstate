import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type');

    if (!token || type !== 'signup') {
      return NextResponse.redirect(new URL('/auth/login?error=Invalid verification link', request.url));
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash: token,
    });

    if (error || !data.user) {
      logger.error('Email verification failed', { error: error?.message });
      return NextResponse.redirect(new URL('/auth/login?error=Invalid verification link', request.url));
    }

    const adminClient = createAdminClient();
    if (adminClient) {
      await adminClient
        .from('profiles')
        .update({ email_verified: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return NextResponse.redirect(new URL('/auth/login?verified=true', request.url));
  } catch (error) {
    logger.error('Verify email error', { error: (error as Error).message });
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url));
  }
}