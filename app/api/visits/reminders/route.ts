import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendVisitConfirmation } from '@/lib/email';
import type { ReminderType } from '@/lib/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { visitId, type, sendReminder } = await request.json();

  const { data: visit, error: fetchError } = await supabase
    .from('visits')
    .select(`
      *,
      property: listings (title, location),
      lead: leads (first_name, last_name, email, phone),
      agent: profiles (full_name, phone)
    `)
    .eq('id', visitId)
    .single();

  if (fetchError || !visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
  }

  if (sendReminder) {
    const lead = visit.lead;
    const meetingLink = visit.meeting_link;

    if (type === 'email' && lead?.email) {
      const agencyResult = await supabase
        .from('agencies')
        .select('name, logo_url, primary_color, secondary_color')
        .eq('id', visit.agency_id)
        .single();

      const agency = agencyResult.data ? {
        name: agencyResult.data.name,
        logoUrl: agencyResult.data.logo_url,
        primaryColor: agencyResult.data.primary_color,
        secondaryColor: agencyResult.data.secondary_color,
      } : undefined;

      sendVisitConfirmation(
        lead.email,
        {
          visitorName: `${lead.first_name} ${lead.last_name}`.trim(),
          visitorEmail: lead.email,
          visitorPhone: lead.phone || undefined,
          propertyTitle: visit.property?.title || visit.title,
          propertyLocation: visit.property?.location || visit.location || '',
          scheduledAt: visit.scheduled_at,
          duration: visit.duration || undefined,
          agentName: visit.agent?.full_name || undefined,
          agentPhone: visit.agent?.phone || undefined,
          meetingLink: meetingLink || undefined,
        },
        agency
      ).catch((e) => {});
    }

    if (type === 'sms' && lead?.phone) {
      // SMS reminder logic would go here
    }

    await supabase
      .from('visits')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', visitId);

    return NextResponse.json({ success: true, message: 'Reminder sent' });
  }

  const { error: updateError } = await supabase
    .from('visits')
    .update({ reminder_type: type })
    .eq('id', visitId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createClient();
  
  const { data: upcomingVisits, error } = await supabase
    .from('visits')
    .select(`
      *,
      lead: leads (first_name, last_name, email, phone)
    `)
    .gte('scheduled_at', new Date().toISOString())
    .lte('scheduled_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    .eq('reminder_sent_at', null)
    .eq('status', 'scheduled');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(upcomingVisits);
}