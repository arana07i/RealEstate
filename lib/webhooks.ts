import type { Stripe } from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function storeWebhookEvent(event: Stripe.Event): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event.data.object as unknown as Record<string, unknown>,
  });

  if (error) {
    logger.error('Failed to store webhook event', { eventId: event.id, error: error.message });
    return false;
  }

  return true;
}

export async function markWebhookProcessed(stripeEventId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from('webhook_events')
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq('stripe_event_id', stripeEventId);
}

export async function getWebhookEvent(stripeEventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('stripe_event_id', stripeEventId)
    .single();

  if (error) return null;
  return data;
}

export async function getUnprocessedWebhooks(limit = 100) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('processed', false)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) return [];
  return data;
}