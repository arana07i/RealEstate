import { NextResponse, type NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const WebhookCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  url: z.string().url('Valid URL is required'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
});

const WebhookUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  url: z.string().url('Valid URL is required').optional(),
  events: z.array(z.string()).min(1, 'At least one event is required').optional(),
  is_active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_webhooks');
    const supabase = await createClient();

    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('id, name, url, events, is_active, created_at, updated_at, last_triggered_at, failure_count, last_delivery_at, last_delivery_status, last_delivery_response')
      .eq('agency_id', user.agency_id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch webhooks', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
    }

    return NextResponse.json({ webhooks: webhooks || [] });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch webhooks', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_webhooks');
    const body = await request.json();
    const validationResult = WebhookCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { name, url, events } = validationResult.data;
    const secret = `whsec_${randomBytes(32).toString('hex')}`;

    const supabase = await createClient();

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        agency_id: user.agency_id,
        name,
        url,
        events,
        secret,
        last_delivery_at: null,
        last_delivery_status: null,
        last_delivery_response: null,
      })
      .select('id, name, url, events, is_active, created_at, updated_at, last_triggered_at, failure_count, last_delivery_at, last_delivery_status, last_delivery_response')
      .single();

    if (error) {
      logger.error('Failed to create webhook', { error: error.message });
      return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
    }

    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to create webhook', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_webhooks');
    const body = await request.json();
    const validationResult = WebhookUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .eq('agency_id', user.agency_id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update webhook', { error: error.message });
      return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
    }

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    return NextResponse.json({ webhook });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update webhook', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'manage_webhooks');
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)
      .eq('agency_id', user.agency_id);

    if (error) {
      logger.error('Failed to delete webhook', { error: error.message });
      return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to delete webhook', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}