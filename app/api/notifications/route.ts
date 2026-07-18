import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const NotificationCreateSchema = z.object({
  user_id: z.string().uuid().optional(),
  agency_id: z.string().uuid().optional(),
  type: z.enum(['inquiry', 'lead', 'listing', 'visit', 'message', 'system', 'billing', 'user']),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  data: z.record(z.unknown()).optional(),
});

const NotificationMarkReadSchema = z.object({
  ids: z.array(z.string().uuid()),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_settings');
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = Number(searchParams.get('limit')) || 20;

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (user.role === 'super_admin') {
      query = query;
    } else {
      query = query.eq('agency_id', user.agency_id);
    }

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      logger.error('Failed to fetch notifications', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch notifications', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_settings');
    const body = await request.json();
    const validationResult = NotificationCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { user_id, agency_id, type, title, message, priority, data } = validationResult.data;
    const supabase = await createClient();

    const targetUserId = user_id || user.id;
    const targetAgencyId = agency_id || user.agency_id;

    if (!targetAgencyId) {
      return NextResponse.json({ error: 'Agency context required' }, { status: 400 });
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        agency_id: targetAgencyId,
        type,
        title,
        message,
        priority,
        data,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create notification', { error: error.message });
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to create notification', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_settings');
    const body = await request.json();
    const validationResult = NotificationMarkReadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { ids } = validationResult.data;
    const supabase = await createClient();

    let query = supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() });

    if (user.role !== 'super_admin') {
      query = query.eq('agency_id', user.agency_id);
    }

    const { error } = await query.in('id', ids);

    if (error) {
      logger.error('Failed to mark notifications read', { error: error.message });
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to mark notifications read', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_settings');
    const supabase = await createClient();

    let query = supabase.from('notifications').delete();

    if (user.role !== 'super_admin') {
      query = query.eq('agency_id', user.agency_id);
    }

    const { error } = await query;

    if (error) {
      logger.error('Failed to clear notifications', { error: error.message });
      return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to clear notifications', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}