import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorize';
import { Key, Plus, Copy, Trash2, Calendar, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Keys',
  robots: { index: false, follow: false },
};

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export default async function ApiKeysPage() {
  try {
    const user = await requirePermission(null, 'manage_api_keys');
    const supabase = await createClient();
    const agencyId = user.agency_id;

    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Key size={24} />
            API Keys
          </h1>
          <p className="mt-1 text-muted-foreground">Manage API keys for programmatic access to your data.</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Your API Keys</h2>
            <button className="btn btn-primary btn-sm flex items-center gap-2" id="create-api-key-btn">
              <Plus size={16} />
              Generate New Key
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys && apiKeys.length > 0 ? (
              apiKeys.map((key) => (
                <div key={key.id} className="p-4 rounded-lg border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm font-medium">{key.key_prefix}...</code>
                      <span className={`text-xs px-2 py-1 rounded ${key.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{key.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      {key.last_used_at && (
                        <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                      )}
                      {key.expires_at && (
                        <span className="flex items-center gap-1 text-warning">
                          <AlertTriangle size={12} />
                          Expires: {new Date(key.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-muted-foreground hover:text-accent" title="Copy">
                      <Copy size={16} />
                    </button>
                    <button className="text-destructive hover:text-destructive/80" title="Revoke">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-4">No API keys generated. Create one to get started.</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-3">API Rate Limits</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Default Limit:</strong> 1000 requests per hour</p>
            <p><strong>Burst Limit:</strong> 100 requests per minute</p>
            <p className="text-muted-foreground">Contact support for higher limits on Enterprise plans.</p>
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/admin/login');
  }
}