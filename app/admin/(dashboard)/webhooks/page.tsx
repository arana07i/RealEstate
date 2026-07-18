import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorize';
import { Webhook, Plus, Trash2, TestTube, Calendar, RefreshCw, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Webhooks',
  robots: { index: false, follow: false },
};

interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  last_triggered_at: string | null;
  failure_count: number;
}

const AVAILABLE_EVENTS = [
  'lead.created',
  'lead.updated',
  'lead.deleted',
  'inquiry.created',
  'inquiry.updated',
  'property.created',
  'property.updated',
  'property.deleted',
  'visit.scheduled',
  'visit.completed',
  'user.created',
  'user.updated',
];

export default async function WebhooksPage() {
  try {
    const user = await requirePermission(null, 'manage_webhooks');
    const supabase = await createClient();
    const agencyId = user.agency_id;

    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Webhook size={24} />
            Webhooks
          </h1>
          <p className="mt-1 text-muted-foreground">Configure webhooks to receive real-time notifications.</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Configured Endpoints</h2>
            <button className="btn btn-primary btn-sm flex items-center gap-2" id="create-webhook-btn">
              <Plus size={16} />
              Add Webhook
            </button>
          </div>

          <div className="space-y-4">
            {webhooks && webhooks.length > 0 ? (
              webhooks.map((webhook) => (
                <div key={webhook.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm font-medium break-all">{webhook.url}</code>
                      <span className={`text-xs px-2 py-1 rounded ${webhook.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                        {webhook.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-muted-foreground hover:text-primary" title="Test">
                        <TestTube size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-700" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-primary mb-2">{webhook.name}</p>

<div className="flex flex-wrap gap-1 mb-3">
                     {webhook.events.map((event: string) => (
                       <span key={event} className="text-xs px-2 py-1 bg-muted rounded">
                         {event}
                       </span>
                     ))}
                   </div>

                  <div className="flex items-center gap-4 text-xs">
<span className="flex items-center gap-1 text-muted-foreground">
                       <Calendar size={12} />
                       Created: {new Date(webhook.created_at).toLocaleDateString()}
                     </span>
                     {webhook.last_triggered_at && (
                       <span className="text-muted-foreground">
                         Last triggered: {new Date(webhook.last_triggered_at).toLocaleString()}
                       </span>
                     )}
                    {webhook.failure_count > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle size={12} />
                        {webhook.failure_count} failures
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-4">No webhooks configured. Add an endpoint to get started.</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-3">Available Events</h2>
          <p className="text-sm text-muted-foreground mb-3">Select events to trigger your webhook:</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_EVENTS.map((event) => (
              <span key={event} className="text-xs px-2 py-1 bg-muted rounded font-mono">
                {event}
              </span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <button className="btn btn-outline btn-sm flex items-center gap-2">
              <RefreshCw size={14} />
              Retry Failed Deliveries
            </button>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/admin/login');
  }
}