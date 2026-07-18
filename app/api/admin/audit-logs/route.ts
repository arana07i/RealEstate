import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const AuditLogFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  action: z.string().optional(),
  resource_type: z.string().optional(),
  user_id: z.string().optional(),
  date_range: z.enum(['today', 'week', 'month', 'all']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'view_audit_logs');
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const filters = AuditLogFiltersSchema.parse({
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 20,
      action: searchParams.get('action') || undefined,
      resource_type: searchParams.get('resource_type') || undefined,
      user_id: searchParams.get('user_id') || undefined,
      date_range: searchParams.get('date_range') || undefined,
    });

    const { page, pageSize, action, resource_type, user_id, date_range } = filters;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent,
        created_at,
        user:profiles!inner(email, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (action) {
      query = query.eq('action', action);
    }

    if (resource_type) {
      query = query.eq('resource_type', resource_type);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
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

    const { data: auditLogs, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch audit logs', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    return NextResponse.json({
      auditLogs: auditLogs || [],
      page,
      pageSize,
      totalRecords: count || 0,
      totalPages,
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch audit logs', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}