import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { SupabaseLeadRepository } from '@/lib/auth/repositories/lead-repository';
import { LeadNoteCreateSchema, LeadNoteUpdateSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';

const leadRepository = new SupabaseLeadRepository();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(request, 'view_leads');
    const { id } = await context.params;

    const notes = await leadRepository.getNotes(id, user.agency_id!);

    return NextResponse.json({ notes });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch lead notes', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(request, 'manage_leads');
    const { id } = await context.params;

    const body = await request.json();
    const validationResult = LeadNoteCreateSchema.safeParse({ ...body, lead_id: id });

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { content } = validationResult.data;

    const note = await leadRepository.createNote(id, user.id, user.full_name, content, user.agency_id!);

    if (!note) {
      return NextResponse.json({ error: 'Failed to create note' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'create',
      resource_type: 'lead_note',
      resource_id: note.id,
      user_id: user.id,
      agency_id: user.agency_id ?? undefined,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to create lead note', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(request, 'manage_leads');
    const { id } = await context.params;

    const body = await request.json();
    const validationResult = LeadNoteUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { noteId, content } = body;

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    const note = await leadRepository.updateNote(id, noteId, content, user.agency_id!);

    if (!note) {
      return NextResponse.json({ error: 'Note not found or failed to update' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'update',
      resource_type: 'lead_note',
      resource_id: noteId,
      user_id: user.id,
      agency_id: user.agency_id ?? undefined,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ note });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update lead note', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(request, 'manage_leads');
    const { id } = await context.params;

    const body = await request.json();
    const { noteId } = body;

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    const deleted = await leadRepository.deleteNote(id, noteId, user.agency_id!);

    if (!deleted) {
      return NextResponse.json({ error: 'Note not found or failed to delete' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await logAudit({
      action: 'delete',
      resource_type: 'lead_note',
      resource_id: noteId,
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
    logger.error('Failed to delete lead note', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}