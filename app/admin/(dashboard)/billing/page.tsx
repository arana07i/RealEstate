import type { Metadata } from 'next';
import { PRICING_TIERS } from '@/lib/billing';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Billing',
  robots: { index: false, follow: false },
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: agency } = await supabase
    .from('agencies')
    .select('subscription_tier, subscription_status')
    .single();

  const currentTier = agency?.subscription_tier ?? 'starter';
  const status = agency?.subscription_status ?? 'trialing';

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Billing & Subscription</h1>

      <div className="card p-6 mb-6">
        <p className="text-stone-600 mb-2">
          Current Plan: <strong className="text-primary">{PRICING_TIERS[currentTier as keyof typeof PRICING_TIERS].name}</strong>
        </p>
        <p className="text-stone-600">
          Status: <strong className="capitalize">{status}</strong>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(PRICING_TIERS).map(([key, tier]) => (
          <div key={key} className={`card p-6 ${key === currentTier ? 'ring-2 ring-accent' : ''}`}>
            <h2 className="text-xl font-bold text-primary">{tier.name}</h2>
            <p className="mt-2 text-3xl font-bold">
              ${tier.price}
              <span className="text-sm font-normal text-stone-500">/month</span>
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span className="text-stone-600">{feature}</span>
                </li>
              ))}
            </ul>

            {key !== currentTier && (
              <form action={`/api/billing/checkout`} method="POST" className="mt-6">
                <input type="hidden" name="tier" value={key} />
                <button type="submit" className="btn btn-secondary w-full" disabled>
                  Select Plan (Coming Soon)
                </button>
              </form>
            )}

            {key === currentTier && (
              <p className="mt-6 text-center text-sm font-medium text-accent">Current Plan</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6 bg-stone-100">
        <h3 className="font-semibold text-primary mb-2">Agency Portal Available</h3>
        <p className="text-sm text-stone-600 mb-4">
          Your agency portal will be available at: <code className="bg-white px-2 py-1 rounded">{currentTier}.yourdomain.com</code>
        </p>
        <p className="text-xs text-stone-500">
          Custom domains available on Enterprise plan. Contact support to configure.
        </p>
      </div>
    </div>
  );
}