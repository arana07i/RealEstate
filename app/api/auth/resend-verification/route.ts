import { NextResponse, type NextRequest } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/verify-email`;

    const adminClient = createAdminClient();

    if (adminClient) {
      const { data: users } = await adminClient
        .from('profiles')
        .select('id, email_verified')
        .eq('email', email)
        .single();

      if (users && !users.email_verified) {
        const { error } = await adminClient.auth.admin.generateLink({
          type: 'signup',
          email: email,
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (error) {
          logger.error('Resend verification failed', { error: error.message });
        }
      }
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a verification link has been sent.',
    });
  } catch (error) {
    logger.error('Resend verification error', { error: (error as Error).message });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}