import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await context.params;

    const supabase = await createClient();

    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Failed to delete session', { error: error.message });
      return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to delete session', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}