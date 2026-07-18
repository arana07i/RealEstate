import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorize';
import { BarChart3, TrendingUp, Users, Building2, MessageSquare, Calendar, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Usage Tracking',
  robots: { index: false, follow: false },
};

interface UsageMetrics {
  property_count: number;
  inquiry_count: number;
  lead_count: number;
  user_count: number;
  api_requests: number;
  storage_used_mb: number;
}

export default async function UsagePage() {
  try {
    const user = await requirePermission(null, 'view_analytics');
    const supabase = await createClient();
    const agencyId = user.agency_id;

    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: metrics } = await supabase
      .from('agency_usage_metrics')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('month', currentMonth)
      .single();

    const usageData: UsageMetrics = metrics || {
      property_count: 0,
      inquiry_count: 0,
      lead_count: 0,
      user_count: 0,
      api_requests: 0,
      storage_used_mb: 0,
    };

    const planLimits = {
      starter: { properties: 50, api: 1000, storage: 500 },
      professional: { properties: 500, api: 5000, storage: 2000 },
      enterprise: { properties: -1, api: -1, storage: -1 },
    };

    const getUsagePercentage = (current: number, limit: number) => {
      if (limit === -1) return 0;
      return Math.min(100, (current / limit) * 100);
    };

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BarChart3 size={24} />
            Usage Tracking
          </h1>
          <p className="mt-1 text-muted-foreground">Monitor your resource consumption and limits.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Building2 size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Properties</p>
                <p className="text-2xl font-bold text-primary">{usageData.property_count}</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all"
                style={{ width: `${getUsagePercentage(usageData.property_count, 500)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">500 limit</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <MessageSquare size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <p className="text-2xl font-bold text-primary">{usageData.inquiry_count}</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full transition-all" style={{ width: '32%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Unlimited</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-primary">{usageData.user_count}</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full transition-all" style={{ width: '45%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">10 users limit</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Zap size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">API Requests</p>
                <p className="text-2xl font-bold text-primary">{usageData.api_requests.toLocaleString()}</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all"
                style={{ width: `${getUsagePercentage(usageData.api_requests, 5000)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">5,000 monthly limit</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads</p>
                <p className="text-2xl font-bold text-primary">{usageData.lead_count}</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full transition-all" style={{ width: '68%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Unlimited</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <BarChart3 size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold text-primary">{(usageData.storage_used_mb / 1024).toFixed(1)} GB</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all"
                style={{ width: `${getUsagePercentage(usageData.storage_used_mb, 2000)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">2 GB limit</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Usage History
          </h2>
          <div className="overflow-x-auto">
<table className="w-full text-left text-sm">
               <thead className="border-b border-border bg-muted/30">
                 <tr>
                   <th className="px-4 py-3 font-semibold text-primary">Month</th>
                   <th className="px-4 py-3 font-semibold text-primary">Properties</th>
                   <th className="px-4 py-3 font-semibold text-primary">Inquiries</th>
                   <th className="px-4 py-3 font-semibold text-primary">API Requests</th>
                   <th className="px-4 py-3 font-semibold text-primary">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                     Usage history will appear here after activity
                   </td>
                 </tr>
               </tbody>
             </table>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/admin/login');
  }
}