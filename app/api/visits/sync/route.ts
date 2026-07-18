import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { VisitStatus } from '@/lib/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { visitId, action } = await request.json();

  const { data: visit, error: fetchError } = await supabase
    .from('visits')
    .select(`
      *,
      property: listings (title, location),
      lead: leads (first_name, last_name, email)
    `)
    .eq('id', visitId)
    .single();

  if (fetchError || !visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }

  const googleEventId = `hc-${Math.random().toString(36).substring(2, 11)}`;

  const { error: updateError } = await supabase
    .from('visits')
    .update({ google_calendar_event_id: googleEventId })
    .eq('id', visitId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    eventId: googleEventId,
    event: {
      summary: `Property Visit: ${visit.property?.title || 'Property'}`,
      description: `Client: ${visit.lead?.first_name} ${visit.lead?.last_name}\n${visit.description || ''}`,
      start: { dateTime: visit.scheduled_at },
      end: { dateTime: new Date(new Date(visit.scheduled_at).getTime() + (visit.duration || 60) * 60000).toISOString() },
      location: visit.location || visit.property?.location,
    },
  });
}

export async function GET() {
  const supabase = await createClient();
  
  const { data: syncedVisits, error } = await supabase
    .from('visits')
    .select('id, google_calendar_event_id')
    .eq('google_calendar_event_id', { gt: null })
    .neq('google_calendar_event_id', '');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(syncedVisits);
}