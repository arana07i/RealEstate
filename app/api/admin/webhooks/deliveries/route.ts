import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_webhooks');
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const webhook_id = searchParams.get('webhook_id');

    if (!webhook_id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    const { data: deliveries, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhook_id)
      .order('delivered_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch webhook deliveries', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
    }

    return NextResponse.json({ deliveries: deliveries || [] });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch webhook deliveries', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}