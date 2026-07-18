import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const PaymentSettingsSchema = z.object({
  stripe_enabled: z.boolean().optional(),
  stripe_secret_key: z.string().optional().nullable(),
  stripe_publishable_key: z.string().optional().nullable(),
  stripe_webhook_secret: z.string().optional().nullable(),
  paypal_enabled: z.boolean().optional(),
  paypal_client_id: z.string().optional().nullable(),
  paypal_secret: z.string().optional().nullable(),
  tax_rate: z.number().min(0).optional(),
  currency: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from('agency_settings')
      .select('payment_settings')
      .eq('agency_id', user.agency_id)
      .single();

    if (error || !settings) {
      return NextResponse.json({
        settings: {
          stripe_enabled: false,
          stripe_secret_key: null,
          stripe_publishable_key: null,
          stripe_webhook_secret: null,
          paypal_enabled: false,
          paypal_client_id: null,
          paypal_secret: null,
          tax_rate: 0,
          currency: 'INR',
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to get payment settings', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const validationResult = PaymentSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from('agency_settings')
      .upsert({
        agency_id: user.agency_id,
        payment_settings: {
          stripe_enabled: body.stripe_enabled ?? false,
          stripe_secret_key: body.stripe_secret_key,
          stripe_publishable_key: body.stripe_publishable_key,
          stripe_webhook_secret: body.stripe_webhook_secret,
          paypal_enabled: body.paypal_enabled ?? false,
          paypal_client_id: body.paypal_client_id,
          paypal_secret: body.paypal_secret,
          tax_rate: body.tax_rate ?? 0,
          currency: body.currency || 'INR',
        },
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to update payment settings', { error: error.message });
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to update payment settings', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}