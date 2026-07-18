import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const supabase = await createClient();

    const secret = body.secret || generateTwoFactorSecret();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to enable 2FA', { error: error.message });
      return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
    }

    return NextResponse.json({ success: true, secret });
  } catch (error) {
    logger.error('Failed to enable 2FA', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
      })
      .eq('id', user.id);

    if (error) {
      logger.error('Failed to disable 2FA', { error: error.message });
      return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to disable 2FA', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateTwoFactorSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}