import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendVisitConfirmation } from '@/lib/email';
import { logger } from '@/lib/logger';
import { getMeetingLinkBase } from '@/lib/env';

type CalendarEventResponse = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  location: string | null;
  status: string;
};

interface VisitWithRelations {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration: number;
  status: string;
  location: string | null;
  property?: { title: string; location: string } | { title: string; location: string }[] | null;
  lead?: { first_name: string; last_name: string; email: string } | { first_name: string; last_name: string; email: string }[] | null;
}

function getPropertyTitle(property: { title: string; location: string } | { title: string; location: string }[] | null | undefined): string {
  if (!property) return 'Property';
  if (Array.isArray(property)) return property[0]?.title || 'Property';
  return property.title || 'Property';
}

function getPropertyName(name: string, prop: { first_name: string; last_name: string; email: string } | { first_name: string; last_name: string; email: string }[] | null | undefined): string {
  if (!prop) return '';
  if (Array.isArray(prop)) return name in prop[0] ? String(prop[0][name as keyof typeof prop[0]]) : '';
  return name in prop ? String(prop[name as keyof typeof prop]) : '';
}

export async function GET() {
  const supabase = await createClient();
  
  const { data: visits, error } = await supabase
    .from('visits')
    .select(`
      *,
      property: listings (title, location),
      lead: leads (first_name, last_name, email)
    `)
    .order('scheduled_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const calendarEvents: CalendarEventResponse[] = (visits as VisitWithRelations[]).map((visit) => ({
    id: visit.id,
    title: `Property Visit: ${getPropertyTitle(visit.property)}`,
    description: `Client: ${getPropertyName('first_name', visit.lead)} ${getPropertyName('last_name', visit.lead)}\n${visit.description || ''}`,
    start: visit.scheduled_at,
    end: new Date(new Date(visit.scheduled_at).getTime() + visit.duration * 60000).toISOString(),
    location: visit.location || getPropertyTitle(visit.property),
    status: visit.status,
  }));

  return NextResponse.json(calendarEvents);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { title, description, start, end, location, status, property_id, lead_id, agent_id, duration, reminder_type } = await request.json();

  const meetingLinkBase = getMeetingLinkBase();
  const meetingLink = `${meetingLinkBase}/${Math.random().toString(36).substring(2, 11)}`;

  let agencyId: string | null = null;

  if (property_id) {
    const { data: property } = await supabase
      .from('listings')
      .select('agency_id')
      .eq('id', property_id)
      .single();
    agencyId = property?.agency_id || null;
  } else if (lead_id) {
    const { data: lead } = await supabase
      .from('leads')
      .select('agency_id')
      .eq('id', lead_id)
      .single();
    agencyId = lead?.agency_id || null;
  }

  const { data: visit, error } = await supabase
    .from('visits')
    .insert({
      agency_id: agencyId,
      property_id,
      lead_id,
      agent_id,
      title,
      description,
      scheduled_at: start,
      duration,
      location,
      status: status || 'scheduled',
      reminder_type: reminder_type || 'email',
      meeting_link: meetingLink,
    })
    .select(`
      *,
      property: listings (title, location),
      lead: leads (first_name, last_name, email, phone),
      agent: profiles (full_name, phone)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (visit && visit.lead?.email && visit.agency_id) {
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

    const propertyTitle = visit.property?.title || title || 'Property Visit';
    const propertyLocation = visit.property?.location || location || '';

    sendVisitConfirmation(
      visit.lead.email,
      {
        visitorName: `${visit.lead.first_name} ${visit.lead.last_name}`.trim(),
        visitorEmail: visit.lead.email,
        visitorPhone: visit.lead.phone || undefined,
        propertyTitle,
        propertyLocation,
        scheduledAt: visit.scheduled_at,
        duration: visit.duration || undefined,
        agentName: visit.agent?.full_name || undefined,
        agentPhone: visit.agent?.phone || undefined,
        meetingLink,
      },
      agency
    ).catch((e) => logger.error('Failed to send visit confirmation email', { error: e.message }));
  }

  return NextResponse.json(visit);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { id, ...updates } = await request.json();

  const { data: visit, error } = await supabase
    .from('visits')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(visit);
}