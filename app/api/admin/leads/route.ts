import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { SupabaseLeadRepository } from '@/lib/auth/repositories/lead-repository';
import { LeadCreateSchema, LeadUpdateSchema, LeadFiltersSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';

const leadRepository = new SupabaseLeadRepository();

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'view_leads');
    const searchParams = request.nextUrl.searchParams;

    const filters = LeadFiltersSchema.parse({
      status: searchParams.getAll('status') as ('new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost')[] | undefined,
      source: searchParams.getAll('source') as ('website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'event' | 'other')[] | undefined,
      tags: searchParams.getAll('tags') || undefined,
      assigned_to: searchParams.getAll('assigned_to') || undefined,
      search: searchParams.get('search') || undefined,
      date_range: (searchParams.get('date_range') || undefined) as 'today' | 'week' | 'month' | 'quarter' | 'year' | undefined,
      value_min: searchParams.get('value_min') ? Number(searchParams.get('value_min')) : undefined,
      value_max: searchParams.get('value_max') ? Number(searchParams.get('value_max')) : undefined,
    });

    const leads = await leadRepository.findAll(filters, user.agency_id!);

    return NextResponse.json({ leads });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch leads', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_leads');

    const body = await request.json();
    const validationResult = LeadCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { tag_ids, ...leadData } = validationResult.data;

    const lead = await leadRepository.create({ ...leadData, tag_ids }, user.agency_id!);

    if (!lead) {
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'create',
      resource_type: 'lead',
      resource_id: lead.id,
      user_id: user.id,
      agency_id: user.agency_id ?? undefined,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to create lead', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_leads');

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const validationResult = LeadUpdateSchema.safeParse(updates);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const lead = await leadRepository.update(id, validationResult.data, user.agency_id!);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found or failed to update' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'update',
      resource_type: 'lead',
      resource_id: id,
      user_id: user.id,
      agency_id: user.agency_id ?? undefined,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
      metadata: updates,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update lead', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_leads');

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const deleted = await leadRepository.delete(id, user.agency_id!);

    if (!deleted) {
      return NextResponse.json({ error: 'Lead not found or failed to delete' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'delete',
      resource_type: 'lead',
      resource_id: id,
      user_id: user.id,
      agency_id: user.agency_id ?? undefined,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to delete lead', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}