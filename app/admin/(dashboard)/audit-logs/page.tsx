import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorize';
import { FileText, Search, Calendar, Filter } from 'lucide-react';
import { AuditAction } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Audit Logs',
  robots: { index: false, follow: false },
};

interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string;
  };
}

export default async function AuditLogsPage() {
  try {
    const user = await requirePermission(null, 'view_audit_logs');
    const supabase = await createClient();
    const agencyId = user.agency_id;

    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:profiles(full_name, email)
      `)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(100);

    const getActionColor = (action: AuditAction) => {
      switch (action) {
        case 'create': return 'text-emerald-600';
        case 'update': return 'text-amber-600';
        case 'delete': return 'text-red-600';
        case 'login': return 'text-blue-600';
        case 'logout': return 'text-muted-foreground';
        default: return 'text-muted-foreground';
      }
    };

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <FileText size={24} />
            Audit Logs
          </h1>
          <p className="mt-1 text-muted-foreground">Track all user activity and system events.</p>
        </div>

        <div className="card mb-6">
          <div className="flex items-center gap-4 p-4 border-b border-border">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search logs..."
                className="input pl-10 w-full"
              />
            </div>
            <button className="btn btn-outline btn-sm flex items-center gap-2">
              <Filter size={16} />
              Filter
            </button>
          </div>

          {auditLogs && auditLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-primary">User</th>
                    <th className="px-4 py-3 font-semibold text-primary">Action</th>
                    <th className="px-4 py-3 font-semibold text-primary">Resource</th>
                    <th className="px-4 py-3 font-semibold text-primary">IP Address</th>
                    <th className="px-4 py-3 font-semibold text-primary">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.user?.full_name || log.user?.email || 'System'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium capitalize ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.resource_type}
                        {log.resource_id && <span className="text-xs ml-1 text-muted-foreground">#{log.resource_id.slice(0, 8)}</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {log.ip_address || '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-primary">No audit logs found</h3>
              <p className="text-muted-foreground mt-1">Activity will be logged as users interact with the system.</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch {
    redirect('/admin/login');
  }
}