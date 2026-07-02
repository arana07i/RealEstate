import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: ['Up to 50 listings', 'Basic support', 'Property photos', 'Inquiry forms'],
    maxListings: 50,
  },
  professional: {
    name: 'Professional',
    price: 79,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL,
    features: ['Up to 500 listings', 'Priority support', 'Virtual tours', 'Custom branding'],
    maxListings: 500,
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    features: ['Unlimited listings', 'Dedicated support', 'API access', 'White-label domain'],
    maxListings: -1,
  },
} as const;

export async function createCheckoutSession(agencyId: string, tier: keyof typeof PRICING_TIERS) {
  const supabase = await createClient();

  const { data: agency } = await supabase
    .from('agencies')
    .select('email, stripe_customer_id')
    .eq('id', agencyId)
    .single();

  let customerId = agency?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: agency?.email,
      metadata: { agency_id: agencyId },
    });
    customerId = customer.id;

    await supabase
      .from('agencies')
      .update({ stripe_customer_id: customerId })
      .eq('id', agencyId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PRICING_TIERS[tier].priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/billing?canceled=1`,
    metadata: { agency_id: agencyId, tier },
  });

  return session.url;
}

export async function handleStripeWebhook(event: Stripe.Event) {
  const supabase = await createClient();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id;

      const tier = Object.entries(PRICING_TIERS).find(
        ([, t]) => t.priceId === priceId
      )?.[0] as keyof typeof PRICING_TIERS | undefined;

      const status = subscription.status === 'active' ? 'active' :
        subscription.status === 'trialing' ? 'trialing' :
        subscription.status === 'past_due' ? 'past_due' : 'canceled';

      await supabase
        .from('agencies')
        .update({
          subscription_tier: tier ?? 'starter',
          subscription_status: status,
          trial_ends_at: (subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null),
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from('agencies')
        .update({
          subscription_tier: 'starter',
          subscription_status: 'canceled',
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    default:
      logger.info('Unhandled Stripe webhook', { type: event.type });
  }
}