import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await context.params;

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select(`
      id,
      lead_id,
      agent_id,
      agent_name,
      title,
      description,
      location,
      scheduled_at,
      duration,
      status,
      reminder_sent
    `)
    .eq('lead_id', id)
    .order('scheduled_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch meetings', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ meetings: meetings ?? [] });
}