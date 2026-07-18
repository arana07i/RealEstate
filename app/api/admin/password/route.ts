import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: body.new }
    );

    if (authError || !authData.user) {
      logger.error('Failed to update password', { error: authError?.message });
      return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }

    await supabase
      .from('profiles')
      .update({ last_password_change: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to update password', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}