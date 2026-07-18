import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const BackupSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  retention_days: z.number().min(1).optional(),
  storage_location: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from('agency_settings')
      .select('backup_settings')
      .eq('agency_id', user.agency_id)
      .single();

    if (error || !settings) {
      return NextResponse.json({
        settings: {
          enabled: false,
          frequency: 'daily',
          retention_days: 30,
          last_backup_at: null,
          next_backup_at: null,
          storage_location: 'supabase',
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to get backup settings', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const validationResult = BackupSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const supabase = await createClient();

    const nextBackup = body.enabled
      ? body.frequency === 'daily'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : body.frequency === 'weekly'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: settings, error } = await supabase
      .from('agency_settings')
      .upsert({
        agency_id: user.agency_id,
        backup_settings: {
          enabled: body.enabled ?? false,
          frequency: body.frequency || 'daily',
          retention_days: body.retention_days || 30,
          last_backup_at: null,
          next_backup_at: nextBackup,
          storage_location: body.storage_location || 'supabase',
        },
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to update backup settings', { error: error.message });
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update backup settings', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}