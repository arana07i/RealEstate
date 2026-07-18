import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const NotificationFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.array(z.enum(['inquiry', 'lead', 'listing', 'visit', 'message', 'system', 'billing', 'user'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high'])).optional(),
  read: z.boolean().optional(),
  date_range: z.enum(['today', 'week', 'month', 'all']).optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

const NotificationUpdateSchema = z.object({
  ids: z.array(z.string().uuid()),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_settings');
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    
    const filters = NotificationFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type')?.split(',').filter(Boolean) || undefined,
      priority: searchParams.get('priority')?.split(',').filter(Boolean) || undefined,
      read: searchParams.get('read') === 'true' ? true : searchParams.get('read') === 'false' ? false : undefined,
      date_range: searchParams.get('date_range') || undefined,
      limit: Number(searchParams.get('limit')) || 50,
    });

    const { search, type: types, priority, read, date_range, limit } = filters;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (types && types.length > 0) {
      query = query.in('type', types);
    }

    if (priority && priority.length > 0) {
      query = query.in('priority', priority);
    }

    if (read !== undefined) {
      query = query.eq('read', read);
    }

    if (date_range && date_range !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      switch (date_range) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      query = query.gte('created_at', cutoff.toISOString());
    }

    const { data: notifications, error } = await query;

    if (error) {
      logger.error('Failed to fetch notifications', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    let filteredNotifications = notifications || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotifications = filteredNotifications.filter(
        (n) => n.title.toLowerCase().includes(searchLower) || n.message.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ notifications: filteredNotifications });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch notifications', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_settings');
    const body = await request.json();
    const supabase = await createClient();

    if (body.ids) {
      const validationResult = NotificationUpdateSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
      }

      const { ids } = validationResult.data;

      const { error } = await supabase
        .from('notifications')
        .eq('user_id', user.id)
        .in('id', ids)
        .update({ read: true, updated_at: new Date().toISOString() });

      if (error) {
        logger.error('Failed to mark notifications read', { error: error.message });
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
      }

      return NextResponse.json({ success: true, updated: ids.length });
    }

    return NextResponse.json({ error: 'Invalid request - ids required' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update notifications', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_settings');
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || null;

    let query = supabase.from('notifications').eq('user_id', user.id).delete();

    if (ids && ids.length > 0) {
      const { error } = await query.in('id', ids);
      if (error) {
        logger.error('Failed to delete notifications', { error: error.message });
        return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
      }
      return NextResponse.json({ success: true, deleted: ids.length });
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
    logger.error('Failed to delete notifications', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}