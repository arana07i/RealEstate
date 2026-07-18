import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await context.params;

  const { data: tasks, error } = await supabase
    .from('lead_tasks')
    .select(`
      id,
      lead_id,
      assigned_to,
      assigned_to_name,
      title,
      description,
      due_date,
      completed,
      completed_at,
      priority,
      created_at
    `)
    .eq('lead_id', id)
    .order('due_date', { ascending: true });

  if (error) {
    logger.error('Failed to fetch lead tasks', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ tasks: tasks ?? [] });
}