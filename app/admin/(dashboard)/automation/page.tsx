import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorize';
import { Zap, Plus, Trash2, Play, Pause, Calendar, RefreshCw, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Automation Rules',
  robots: { index: false, follow: false },
};

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  is_active: boolean;
  created_at: string;
  last_run_at: string | null;
  run_count: number;
}

const AUTOMATION_TEMPLATES = [
  { name: 'Send Welcome Email', trigger: 'lead_created', action: 'send_email', icon: '📧' },
  { name: 'Assign to Agent', trigger: 'lead_created', action: 'create_task', icon: '👤' },
  { name: 'Follow-up Reminder', trigger: 'visit_completed', action: 'send_sms', icon: '📱' },
  { name: 'Status Change Notification', trigger: 'lead_status_changed', action: 'notify_user', icon: '🔔' },
];

export default async function AutomationPage() {
  try {
    const user = await requirePermission(null, 'manage_automation');
    const supabase = await createClient();
    const agencyId = user.agency_id;

    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Zap size={24} />
            Automation Rules
          </h1>
          <p className="mt-1 text-muted-foreground">Automate repetitive tasks with custom rules.</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Active Rules</h2>
            <button className="btn btn-primary btn-sm flex items-center gap-2" id="create-automation-btn">
              <Plus size={16} />
              Create Rule
            </button>
          </div>

          <div className="space-y-4">
            {rules && rules.length > 0 ? (
              rules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
<h3 className="font-medium text-primary">{rule.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${rule.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                        {rule.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="text-muted-foreground hover:text-primary" title={rule.is_active ? 'Pause' : 'Activate'}>
                         {rule.is_active ? <Pause size={16} /> : <Play size={16} />}
                       </button>
                       <button className="text-muted-foreground hover:text-primary" title="Edit">
                         <Settings size={16} />
                       </button>
                       <button className="text-red-600 hover:text-red-700" title="Delete">
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </div>

                   <div className="flex items-center gap-4 text-sm mb-3">
                     <span className="text-muted-foreground">
                       <strong>Trigger:</strong> {rule.trigger.replace(/_/g, ' ')}
                     </span>
                     <span className="text-muted-foreground">
                       <strong>Action:</strong> {rule.action.replace(/_/g, ' ')}
                     </span>
                   </div>

                   <div className="flex items-center gap-4 text-xs">
                     <span className="flex items-center gap-1 text-muted-foreground">
                       <Calendar size={12} />
                       Created: {new Date(rule.created_at).toLocaleDateString()}
                     </span>
                     <span className="text-muted-foreground">
                       Runs: {rule.run_count}
                     </span>
                     {rule.last_run_at && (
                       <span className="text-muted-foreground">
                         Last run: {new Date(rule.last_run_at).toLocaleString()}
                       </span>
                     )}
                   </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-4">No automation rules configured. Create one below.</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-3">Quick Templates</h2>
<p className="text-sm text-muted-foreground mb-4">Start with a pre-built automation template:</p>
           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
             {AUTOMATION_TEMPLATES.map((template) => (
               <button
                 key={template.name}
                 className="p-4 rounded-lg border text-left hover:bg-muted transition-colors"
               >
                 <div className="text-2xl mb-2">{template.icon}</div>
                 <h3 className="font-medium text-primary">{template.name}</h3>
                 <p className="text-xs text-muted-foreground mt-1 capitalize">
                   {template.trigger.replace(/_/g, ' ')} → {template.action.replace(/_/g, ' ')}
                 </p>
               </button>
             ))}
          </div>
        </div>
      </div>
    );
  } catch {
    redirect('/admin/login');
  }
}