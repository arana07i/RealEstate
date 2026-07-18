'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Users, Key, Bell, CreditCard, Database, FileText, Mail, MessageSquare, Settings as SettingsIcon, UserCog, LinkIcon, BarChart3, Plus, Trash2 } from 'lucide-react';

interface GeneralSettings {
  agency_name: string;
  agency_email: string;
  agency_phone: string;
  agency_address: string;
  primary_color: string;
  secondary_color: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
}

interface PaymentSettings {
  stripe_enabled: boolean;
  stripe_secret_key?: string;
  stripe_publishable_key?: string;
  tax_rate: number;
  currency: string;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  is_connected: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  is_active: boolean;
}

interface SecuritySettings {
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special: boolean;
  };
  two_factor_required: boolean;
  session_timeout: number;
  max_login_attempts: number;
  lockout_duration: number;
}

interface BackupSettings {
  enabled: boolean;
  frequency: string;
  retention_days: number;
  last_backup_at: string | null;
  next_backup_at: string | null;
}

export function SettingsClient() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    agency_name: '',
    agency_email: '',
    agency_phone: '',
    agency_address: '',
    primary_color: '#0f2822',
    secondary_color: '#2d5a4e',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripe_enabled: false,
    tax_rate: 0,
    currency: 'INR',
  });
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    password_policy: { min_length: 8, require_uppercase: true, require_lowercase: true, require_numbers: true, require_special: false },
    two_factor_required: false,
    session_timeout: 3600,
    max_login_attempts: 5,
    lockout_duration: 15,
  });
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    enabled: false,
    frequency: 'daily',
    retention_days: 30,
    last_backup_at: null,
    next_backup_at: null,
  });
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  const handleGeneralSettingsUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const response = await fetch('/api/admin/settings/general', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agency_name: formData.get('agency_name'),
        agency_email: formData.get('agency_email'),
        agency_phone: formData.get('agency_phone'),
        agency_address: formData.get('agency_address'),
        primary_color: formData.get('primary_color'),
        secondary_color: formData.get('secondary_color'),
      }),
    });

    if (response.ok) {
      toast.success('General settings saved');
    } else {
      toast.error('Failed to save settings');
    }
  };

  const handleSecuritySettingsUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const response = await fetch('/api/admin/settings/security', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        two_factor_required: formData.get('two_factor_required') === 'on',
        session_timeout: parseInt(formData.get('session_timeout') as string),
        max_login_attempts: parseInt(formData.get('max_login_attempts') as string),
        lockout_duration: parseInt(formData.get('lockout_duration') as string),
      }),
    });

    if (response.ok) {
      toast.success('Security settings saved');
    } else {
      toast.error('Failed to save security settings');
    }
  };

  const handlePaymentSettingsUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const response = await fetch('/api/admin/settings/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stripe_enabled: formData.get('stripe_enabled') === 'on',
        tax_rate: parseFloat(formData.get('tax_rate') as string),
        currency: formData.get('currency'),
      }),
    });

    if (response.ok) {
      toast.success('Payment settings saved');
    } else {
      toast.error('Failed to save payment settings');
    }
  };

  const handleBackupSettingsUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const response = await fetch('/api/admin/settings/backup', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled: formData.get('enabled') === 'on',
        frequency: formData.get('frequency'),
        retention_days: parseInt(formData.get('retention_days') as string),
      }),
    });

    if (response.ok) {
      toast.success('Backup settings saved');
    } else {
      toast.error('Failed to save backup settings');
    }
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-6 flex-wrap">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
        <TabsTrigger value="sms-templates">SMS Templates</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        <TabsTrigger value="backup">Backup</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <form onSubmit={handleGeneralSettingsUpdate} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <SettingsIcon size={20} /> General Settings
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="agency_name" className="block text-sm font-medium mb-1">Agency Name</label>
              <input
                type="text"
                id="agency_name"
                name="agency_name"
                defaultValue={generalSettings.agency_name}
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="agency_email" className="block text-sm font-medium mb-1">Agency Email</label>
              <input
                type="email"
                id="agency_email"
                name="agency_email"
                defaultValue={generalSettings.agency_email}
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="agency_phone" className="block text-sm font-medium mb-1">Agency Phone</label>
              <input
                type="tel"
                id="agency_phone"
                name="agency_phone"
                defaultValue={generalSettings.agency_phone}
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="agency_address" className="block text-sm font-medium mb-1">Address</label>
              <textarea
                id="agency_address"
                name="agency_address"
                defaultValue={generalSettings.agency_address}
                rows={3}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="primary_color" className="block text-sm font-medium mb-1">Primary Color</label>
              <input
                type="color"
                id="primary_color"
                name="primary_color"
                defaultValue={generalSettings.primary_color}
                className="w-full h-10"
              />
            </div>

            <div>
              <label htmlFor="secondary_color" className="block text-sm font-medium mb-1">Secondary Color</label>
              <input
                type="color"
                id="secondary_color"
                name="secondary_color"
                defaultValue={generalSettings.secondary_color}
                className="w-full h-10"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">Save Settings</button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="users">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Users size={20} /> Users Management
            </h2>
            <button onClick={() => setShowCreateUser(!showCreateUser)} className="btn btn-primary btn-sm">
              <UserCog size={16} className="mr-1" /> {showCreateUser ? 'Cancel' : 'Add User'}
            </button>
          </div>

          {showCreateUser && (
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="font-medium text-primary mb-3">Create New User</h3>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const response = await fetch('/api/admin/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: formData.get('email'),
                    full_name: formData.get('full_name'),
                    role: formData.get('role'),
                  }),
                });
                if (response.ok) {
                  toast.success('User created');
                  setShowCreateUser(false);
                } else {
                  toast.error('Failed to create user');
                }
              }}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" id="email" name="email" required className="input" />
                </div>
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium mb-1">Full Name</label>
                  <input type="text" id="full_name" name="full_name" className="input" />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
                  <select id="role" name="role" className="input">
                    <option value="agency_admin">Agency Admin</option>
                    <option value="agent">Agent</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
<thead className="border-b border-border bg-muted/30">
                   <tr>
                     <th className="px-4 py-3 font-semibold text-primary">Name</th>
                     <th className="px-4 py-3 font-semibold text-primary">Email</th>
                     <th className="px-4 py-3 font-semibold text-primary">Role</th>
                     <th className="px-4 py-3 font-semibold text-primary">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                       Users will be loaded from API
                     </td>
                   </tr>
                 </tbody>
               </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="roles">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Shield size={20} /> Roles Management
            </h2>
            <button onClick={() => setShowCreateRole(!showCreateRole)} className="btn btn-primary btn-sm">
              <Plus size={16} className="mr-1" /> {showCreateRole ? 'Cancel' : 'Add Role'}
            </button>
          </div>

          {showCreateRole && (
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="font-medium text-primary mb-3">Create New Role</h3>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                toast.success('Role created');
                setShowCreateRole(false);
              }}>
                <div>
                  <label htmlFor="role_name" className="block text-sm font-medium mb-1">Role Name</label>
                  <input type="text" id="role_name" name="role_name" required className="input" />
                </div>
                <div>
                  <label htmlFor="role_description" className="block text-sm font-medium mb-1">Description</label>
                  <textarea id="role_description" name="role_description" rows={2} className="input" />
                </div>
                <button type="submit" className="btn btn-primary">Create Role</button>
              </form>
            </div>
          )}

<div className="space-y-3">
             {roles.length === 0 ? (
               <p className="text-muted-foreground">No custom roles defined</p>
             ) : (
               roles.map((role) => (
                 <div key={role.id} className="p-4 rounded-lg border">
                   <h3 className="font-medium text-primary">{role.name}</h3>
                   <p className="text-sm text-muted-foreground">{role.description}</p>
                 </div>
               ))
             )}
           </div>
        </div>
      </TabsContent>

      <TabsContent value="permissions">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Key size={20} /> Permissions Management
          </h2>
          <div className="overflow-x-auto">
<table className="w-full text-left text-sm">
               <thead className="border-b border-border bg-muted/30">
                 <tr>
                   <th className="px-4 py-3 font-semibold text-primary">Resource</th>
                   <th className="px-4 py-3 font-semibold text-primary">Action</th>
                   <th className="px-4 py-3 font-semibold text-primary">Description</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {permissions.length === 0 ? (
                   <tr>
                     <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                       Loading permissions...
                     </td>
                   </tr>
                 ) : (
                   permissions.map((perm) => (
                     <tr key={perm.id}>
                       <td className="px-4 py-3">{perm.resource}</td>
                       <td className="px-4 py-3">{perm.action}</td>
                       <td className="px-4 py-3 text-muted-foreground">{perm.description}</td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="email-templates">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Mail size={20} /> Email Templates
            </h2>
            <button onClick={() => setShowCreateTemplate(!showCreateTemplate)} className="btn btn-primary btn-sm">
              <Plus size={16} className="mr-1" /> {showCreateTemplate ? 'Cancel' : 'Add Template'}
            </button>
          </div>

          {showCreateTemplate && (
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="font-medium text-primary mb-3">Create Email Template</h3>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                toast.success('Template created');
                setShowCreateTemplate(false);
              }}>
                <div>
                  <label htmlFor="template_name" className="block text-sm font-medium mb-1">Template Name</label>
                  <input type="text" id="template_name" name="template_name" required className="input" />
                </div>
                <div>
                  <label htmlFor="template_subject" className="block text-sm font-medium mb-1">Subject</label>
                  <input type="text" id="template_subject" name="template_subject" required className="input" />
                </div>
                <div>
                  <label htmlFor="template_body" className="block text-sm font-medium mb-1">Body (HTML)</label>
                  <textarea id="template_body" name="template_body" rows={6} required className="input" />
                </div>
                <button type="submit" className="btn btn-primary">Create Template</button>
              </form>
            </div>
          )}

<div className="space-y-3">
             {emailTemplates.length === 0 ? (
               <p className="text-muted-foreground">No email templates configured</p>
             ) : (
               emailTemplates.map((template) => (
                 <div key={template.id} className="p-4 rounded-lg border">
                   <div className="flex items-center justify-between">
                     <h3 className="font-medium text-primary">{template.name}</h3>
                     <span className={`text-xs px-2 py-1 rounded ${template.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                       {template.is_active ? 'Active' : 'Inactive'}
                     </span>
                   </div>
                   <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                 </div>
               ))
             )}
           </div>
        </div>
      </TabsContent>

      <TabsContent value="sms-templates">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <MessageSquare size={20} /> SMS Templates
          </h2>
<div className="space-y-3">
             <p className="text-muted-foreground">SMS templates configuration</p>
           </div>
        </div>
      </TabsContent>

      <TabsContent value="payments">
        <form onSubmit={handlePaymentSettingsUpdate} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <CreditCard size={20} /> Payment Settings
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="stripe_enabled" defaultChecked={paymentSettings.stripe_enabled} className="rounded" />
              <span>Enable Stripe Payments</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tax_rate" className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  id="tax_rate"
                  name="tax_rate"
                  step="0.01"
                  defaultValue={paymentSettings.tax_rate}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium mb-1">Currency</label>
                <select id="currency" name="currency" defaultValue={paymentSettings.currency} className="input">
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">Save Payment Settings</button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="integrations">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <LinkIcon size={20} /> Integrations
          </h2>
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
             {integrations.length === 0 ? (
               <p className="text-muted-foreground sm:col-span-2 lg:col-span-3">No integrations configured</p>
             ) : (
               integrations.map((integration) => (
                 <div key={integration.id} className="p-4 rounded-lg border">
                   <div className="flex items-center justify-between">
                     <h3 className="font-medium text-primary">{integration.name}</h3>
                     <span className={`text-xs px-2 py-1 rounded ${integration.is_connected ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                       {integration.is_connected ? 'Connected' : 'Disconnected'}
                     </span>
                   </div>
                   <p className="text-sm text-muted-foreground mt-1">{integration.type}</p>
                   <button className="btn btn-outline btn-sm mt-3">
                     {integration.is_connected ? 'Disconnect' : 'Connect'}
                   </button>
                 </div>
               ))
             )}

             <div className="p-4 rounded-lg border">
               <h3 className="font-medium text-primary">CRM Integration</h3>
               <p className="text-sm text-muted-foreground mt-1">Connect your CRM system</p>
               <button className="btn btn-outline btn-sm mt-3">Connect</button>
             </div>

             <div className="p-4 rounded-lg border">
               <h3 className="font-medium text-primary">Google Calendar</h3>
               <p className="text-sm text-muted-foreground mt-1">Sync visits and appointments</p>
               <button className="btn btn-outline btn-sm mt-3">Connect</button>
             </div>

             <div className="p-4 rounded-lg border">
               <h3 className="font-medium text-primary">Mailchimp</h3>
               <p className="text-sm text-muted-foreground mt-1">Email marketing automation</p>
               <button className="btn btn-outline btn-sm mt-3">Connect</button>
             </div>
           </div>
        </div>
      </TabsContent>

      <TabsContent value="api">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Key size={20} /> API Settings & Keys
            </h2>
            <button className="btn btn-primary btn-sm">
              <Plus size={16} className="mr-1" /> Generate Key
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-primary mb-2">Rate Limits</h3>
              <p className="text-muted-foreground">Default: 1000 requests per hour</p>
            </div>

            <div>
              <h3 className="font-medium text-primary mb-2">API Keys</h3>
              <div className="space-y-2">
                {apiKeys.length === 0 ? (
                  <p className="text-muted-foreground">No API keys generated</p>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <code className="font-mono text-sm">{key.key_prefix}...</code>
                        <p className="text-xs text-muted-foreground mt-1">{key.name}</p>
                      </div>
                      <button className="text-destructive hover:text-destructive/80">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="security">
        <form onSubmit={handleSecuritySettingsUpdate} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Shield size={20} /> Security Settings
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="two_factor_required" defaultChecked={securitySettings.two_factor_required} className="rounded" />
              <span>Require 2FA for all users</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="session_timeout" className="block text-sm font-medium mb-1">Session Timeout (seconds)</label>
                <input
                  type="number"
                  id="session_timeout"
                  name="session_timeout"
                  defaultValue={securitySettings.session_timeout}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="max_login_attempts" className="block text-sm font-medium mb-1">Max Login Attempts</label>
                <input
                  type="number"
                  id="max_login_attempts"
                  name="max_login_attempts"
                  defaultValue={securitySettings.max_login_attempts}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="lockout_duration" className="block text-sm font-medium mb-1">Lockout Duration (minutes)</label>
                <input
                  type="number"
                  id="lockout_duration"
                  name="lockout_duration"
                  defaultValue={securitySettings.lockout_duration}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">Save Security Settings</button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="audit">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> Audit Logs
          </h2>
          <div className="overflow-x-auto">
<table className="w-full text-left text-sm">
               <thead className="border-b border-border bg-muted/30">
                 <tr>
                   <th className="px-4 py-3 font-semibold text-primary">User</th>
                   <th className="px-4 py-3 font-semibold text-primary">Action</th>
                   <th className="px-4 py-3 font-semibold text-primary">Resource</th>
                   <th className="px-4 py-3 font-semibold text-primary">IP Address</th>
                   <th className="px-4 py-3 font-semibold text-primary">Date</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                     Audit logs will appear here
                   </td>
                 </tr>
               </tbody>
             </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="backup">
        <form onSubmit={handleBackupSettingsUpdate} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Database size={20} /> Backup Settings
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="enabled" defaultChecked={backupSettings.enabled} className="rounded" />
              <span>Enable Automatic Backups</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium mb-1">Backup Frequency</label>
                <select id="frequency" name="frequency" defaultValue={backupSettings.frequency} className="input">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label htmlFor="retention_days" className="block text-sm font-medium mb-1">Retention Days</label>
                <input
                  type="number"
                  id="retention_days"
                  name="retention_days"
                  defaultValue={backupSettings.retention_days}
                  className="input"
                />
              </div>
            </div>

            {backupSettings.last_backup_at && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Last Backup: {new Date(backupSettings.last_backup_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">Save Backup Settings</button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}