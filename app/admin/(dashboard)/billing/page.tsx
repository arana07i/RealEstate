import type { Metadata } from 'next';
import { PRICING_TIERS } from '@/lib/billing';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Billing',
  robots: { index: false, follow: false },
};

const FEATURE_COMPARISON = [
  { feature: 'Properties', starter: '50', professional: '500', enterprise: 'Unlimited' },
  { feature: 'Photo Uploads', starter: true, professional: true, enterprise: true },
  { feature: 'Virtual Tours', starter: false, professional: true, enterprise: true },
  { feature: 'Custom Branding', starter: false, professional: true, enterprise: true },
  { feature: 'API Access', starter: false, professional: false, enterprise: true },
  { feature: 'White-label Domain', starter: false, professional: false, enterprise: true },
];

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
    .select('subscription_tier, subscription_status, trial_ends_at')
    .single();

  const currentTier = agency?.subscription_tier ?? 'starter';
  const status = agency?.subscription_status ?? 'trialing';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Billing & Subscription</h1>
        <p className="mt-1 text-stone-500">Manage your subscription and billing preferences.</p>
      </div>

      <div className="card p-6 mb-8">
        <p className="text-stone-600 mb-2">
          Current Plan: <strong className="text-primary">{PRICING_TIERS[currentTier as keyof typeof PRICING_TIERS].name}</strong>
        </p>
        <p className="text-stone-600">
          Status: <strong className="capitalize">{status}</strong>
        </p>
        {status === 'trialing' && agency?.trial_ends_at && (
          <p className="mt-2 text-sm text-accent">
            Trial ends: {new Date(agency.trial_ends_at).toLocaleDateString('en-IN')}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(PRICING_TIERS).map(([key, tier]) => (
          <div key={key} className={`card relative p-6 ${key === 'professional' ? 'ring-2 ring-accent' : ''}`}>
            {key === 'professional' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-accent px-3 py-1 text-xs font-bold uppercase text-primary-dark">
                Most Popular
              </span>
            )}
            <h3 className="text-xl font-bold text-primary">{tier.name}</h3>
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

            {key === currentTier ? (
              <p className="mt-6 text-center text-sm font-medium text-accent">Current Plan</p>
            ) : (
              <form action={`/api/billing/checkout`} method="POST" className="mt-6">
                <input type="hidden" name="tier" value={key} />
                <button type="submit" className="btn btn-secondary w-full">
                  Upgrade to {tier.name}
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-primary">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-primary">Feature</th>
                <th className="px-4 py-3 font-semibold text-primary">Starter</th>
                <th className="px-4 py-3 font-semibold text-primary">Professional</th>
                <th className="px-4 py-3 font-semibold text-primary">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {FEATURE_COMPARISON.map((row) => (
                <tr key={row.feature} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3 font-medium text-primary">{row.feature}</td>
                  <td className="px-4 py-3">{row.starter === true ? '✓' : row.starter === false ? '—' : row.starter}</td>
                  <td className="px-4 py-3">{row.professional === true ? '✓' : row.professional === false ? '—' : row.professional}</td>
                  <td className="px-4 py-3">{row.enterprise === true ? '✓' : row.enterprise === false ? '—' : row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}