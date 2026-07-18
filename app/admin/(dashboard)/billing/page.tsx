import type { Metadata } from 'next';
import { PRICING_TIERS } from '@/lib/billing';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorize';
import { CreditCard, Calendar, Download, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

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

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  download_url: string | null;
}

interface Subscription {
  id: string;
  tier: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method?: {
    brand: string;
    last4: string;
    expiry: string;
  } | null;
}

export default async function BillingPage() {
  try {
    const user = await requirePermission(null, 'manage_billing');
    const supabase = await createClient();
    const agencyId = user.agency_id;

    const { data: agency } = await supabase
      .from('agencies')
      .select('subscription_tier, subscription_status, trial_ends_at, stripe_customer_id')
      .eq('id', agencyId)
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('agency_id', agencyId)
      .single();

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(5);

    const currentTier = agency?.subscription_tier ?? 'starter';
    const status = agency?.subscription_status ?? 'trialing';

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'bg-success/10 text-success';
        case 'trialing': return 'bg-info/10 text-info';
        case 'past_due': return 'bg-warning/10 text-warning';
        case 'canceled': return 'bg-muted text-muted-foreground';
        default: return 'bg-muted text-muted-foreground';
      }
    };

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Billing & Subscription</h1>
          <p className="mt-1 text-muted-foreground">Manage your subscription and billing preferences.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <CreditCard size={20} /> Current Subscription
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-primary">{PRICING_TIERS[currentTier as keyof typeof PRICING_TIERS].name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(status)}`}>
                  {status === 'trialing' && agency?.trial_ends_at && 'Trial'}
                  {status !== 'trialing' && status}
                </span>
              </div>
              {subscription && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Period Start</span>
                    <span className="text-muted-foreground">{new Date(subscription.current_period_start).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Period End</span>
                    <span className="text-muted-foreground">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                  {subscription.payment_method && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="text-muted-foreground">
                        {subscription.payment_method.brand} •••• {subscription.payment_method.last4}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="pt-4 flex gap-2">
                <Link href="/admin/billing/cancel" className="btn btn-outline btn-sm">
                  Cancel Subscription
                </Link>
                <Link href="/admin/invoices" className="btn btn-ghost btn-sm">
                  View All Invoices
                </Link>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Calendar size={20} /> Recent Invoices
            </h2>
            <div className="space-y-2">
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{invoice.invoice_number}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        ${(invoice.amount / 100).toFixed(2)}
                      </span>
                      {invoice.download_url && (
                        <a href={invoice.download_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No invoices found</p>
              )}
            </div>
          </div>
        </div>

        {status === 'trialing' && agency?.trial_ends_at && (
          <div className="card p-4 mb-6 bg-info/10 border-info/20">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-info" />
              <div>
                <p className="text-sm font-medium text-info-foreground">Trial Active</p>
                <p className="text-xs text-info">
                  Your trial ends on {new Date(agency.trial_ends_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

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
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>

              <ul className="mt-4 space-y-2 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-accent" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {key === currentTier ? (
                <p className="mt-6 text-center text-sm font-medium text-accent flex items-center justify-center gap-1">
                  <CheckCircle2 size={16} />
                  Current Plan
                </p>
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
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-semibold text-primary">Feature</th>
                  <th className="px-4 py-3 font-semibold text-primary">Starter</th>
                  <th className="px-4 py-3 font-semibold text-primary">Professional</th>
                  <th className="px-4 py-3 font-semibold text-primary">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {FEATURE_COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-primary">{row.feature}</td>
                    <td className="px-4 py-3">{row.starter === true ? <CheckCircle2 size={16} className="text-accent" /> : row.starter === false ? <XCircle size={16} className="text-muted-foreground/50" /> : row.starter}</td>
                    <td className="px-4 py-3">{row.professional === true ? <CheckCircle2 size={16} className="text-accent" /> : row.professional === false ? <XCircle size={16} className="text-muted-foreground/50" /> : row.professional}</td>
                    <td className="px-4 py-3">{row.enterprise === true ? <CheckCircle2 size={16} className="text-accent" /> : row.enterprise === false ? <XCircle size={16} className="text-muted-foreground/50" /> : row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/admin/billing?error=forbidden');
  }
}