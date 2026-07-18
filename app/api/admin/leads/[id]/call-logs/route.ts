import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await context.params;

  const { data: callLogs, error } = await supabase
    .from('call_logs')
    .select(`
      id,
      lead_id,
      agent_id,
      agent_name,
      direction,
      duration,
      notes,
      scheduled_at,
      completed_at,
      status
    `)
    .eq('lead_id', id)
    .order('scheduled_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch call logs', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ callLogs: callLogs ?? [] });
}