import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await context.params;

  const { data: emails, error } = await supabase
    .from('email_history')
    .select(`
      id,
      lead_id,
      subject,
      body,
      sent_at,
      status,
      opened_at,
      clicked_at
    `)
    .eq('lead_id', id)
    .order('sent_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch email history', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ emails: emails ?? [] });
}