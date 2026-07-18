'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, Copy, Key, Trash2, Download, Plus, Shield, Bell, Globe, CreditCard, FileText, Activity, Bookmark, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  timezone: string | null;
  two_factor_enabled: boolean;
}

interface UserSession {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  location: string | null;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

interface SavedProperty {
  id: string;
  listing: {
    id: string;
    title: string;
    location: string;
    price: number;
    image_urls: string[];
    status: string;
  };
  created_at: string;
  notes: string | null;
}

interface RecentlyViewedProperty {
  id: string;
  listing: {
    id: string;
    title: string;
    location: string;
    price: number;
    image_urls: string[];
  };
  viewed_at: string;
}

interface UserDocument {
  id: string;
  name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  created_at: string;
}

interface Preferences {
  theme: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  timezone: string;
  language: string;
  marketing_emails: boolean;
}

export function ProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProperty[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'light',
    email_notifications: true,
    sms_notifications: false,
    timezone: 'Asia/Kolkata',
    language: 'en',
    marketing_emails: false,
  });
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, sessionsRes, savedRes, viewedRes, docsRes, prefsRes] = await Promise.all([
        fetch('/api/admin/profile'),
        fetch('/api/admin/sessions'),
        fetch('/api/admin/saved-properties'),
        fetch('/api/admin/recently-viewed'),
        fetch('/api/admin/documents'),
        fetch('/api/admin/preferences'),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);
      }
      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.sessions);
      }
      if (savedRes.ok) {
        const data = await savedRes.json();
        setSavedProperties(data.properties);
      }
      if (viewedRes.ok) {
        const data = await viewedRes.json();
        setRecentlyViewed(data.properties);
      }
      if (docsRes.ok) {
        const data = await docsRes.json();
        setDocuments(data.documents);
      }
      if (prefsRes.ok) {
        const data = await prefsRes.json();
        setPreferences(data.preferences);
      }
    } catch {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const response = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
      }),
    });

    if (response.ok) {
      toast.success('Profile updated successfully');
      fetchProfile();
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    const response = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordData),
    });

    if (response.ok) {
      toast.success('Password changed successfully');
      setPasswordData({ current: '', new: '', confirm: '' });
      setShowPasswordFields(false);
    } else {
      const { error } = await response.json();
      toast.error(error || 'Failed to change password');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to sign out this session?')) return;

    const response = await fetch(`/api/admin/sessions/${sessionId}`, { method: 'DELETE' });
    if (response.ok) {
      toast.success('Session revoked');
      setSessions(sessions.filter(s => s.id !== sessionId));
    } else {
      toast.error('Failed to revoke session');
    }
  };

  const handleTwoFactorToggle = async () => {
    const response = await fetch('/api/admin/two-factor', {
      method: twoFactorEnabled ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: twoFactorCode }),
    });

    if (response.ok) {
      toast.success(twoFactorEnabled ? '2FA disabled' : '2FA enabled');
      setTwoFactorEnabled(!twoFactorEnabled);
      setTwoFactorCode('');
    } else {
      const { error } = await response.json();
      toast.error(error || 'Failed to update 2FA');
    }
  };

  const handlePreferencesUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newPrefs = {
      theme: formData.get('theme') as string,
      email_notifications: formData.get('email_notifications') === 'on',
      sms_notifications: formData.get('sms_notifications') === 'on',
      timezone: formData.get('timezone') as string,
      language: formData.get('language') as string,
      marketing_emails: formData.get('marketing_emails') === 'on',
    };

    const response = await fetch('/api/admin/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPrefs),
    });

    if (response.ok) {
      toast.success('Preferences saved');
      setPreferences(newPrefs);
    } else {
      toast.error('Failed to save preferences');
    }
  };

  const handleCreateApiKey = async () => {
    const response = await fetch('/api/admin/api-keys', { method: 'POST' });
    if (response.ok) {
      const data = await response.json();
      setApiKey(data.apiKey);
      setShowApiKey(true);
    } else {
      toast.error('Failed to create API key');
    }
  };

  if (loading) {
    return <div className="card animate-pulse p-8 h-96" />;
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="saved-properties">Saved Properties</TabsTrigger>
        <TabsTrigger value="recently-viewed">Recently Viewed</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Personal Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img
                  src={avatarPreview || profile?.avatar_url || '/images/placeholder-avatar.svg'}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-accent p-2 text-primary-dark hover:bg-accent/80"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="font-medium text-primary">{profile?.full_name || 'Add your name'}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  defaultValue={profile?.full_name || ''}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile?.email || ''}
                  disabled
                  className="input opacity-60"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={profile?.phone || ''}
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </TabsContent>

      <TabsContent value="security">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Password</h2>
            {!showPasswordFields ? (
              <button onClick={() => setShowPasswordFields(true)} className="btn btn-secondary">
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    id="current_password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    id="new_password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm_password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">Update Password</button>
                  <button type="button" onClick={() => setShowPasswordFields(false)} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Shield size={20} /> Two-Factor Authentication
            </h2>
            <div className="space-y-4">
<div className="flex items-center justify-between">
                        <span className="text-muted-foreground">2FA Status</span>
                        <span className={`text-sm font-medium ${profile?.two_factor_enabled ? 'text-success' : 'text-muted-foreground'}`}>
                          {profile?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
              <input
                type="text"
                placeholder="Enter 6-digit code from authenticator"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="input"
                maxLength={6}
              />
              <button
                onClick={handleTwoFactorToggle}
                disabled={!twoFactorCode}
                className="btn btn-secondary"
              >
                {profile?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Active Sessions</h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-primary">{session.is_current ? 'Current Session' : 'Active Session'}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.location || session.ip_address} • {formatDate(session.created_at)}
                    </p>
                  </div>
                  {!session.is_current && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {sessions.length === 0 && <p className="text-muted-foreground">No active sessions</p>}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="saved-properties">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Bookmark size={20} /> Saved Properties
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <img
                  src={item.listing.image_urls?.[0] || '/images/placeholder-property.svg'}
                  alt={item.listing.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-primary">{item.listing.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.listing.location}</p>
                  <p className="font-bold text-primary mt-2">${item.listing.price.toLocaleString('en-US')}</p>
                </div>
              </div>
            ))}
          </div>
          {savedProperties.length === 0 && <p className="text-muted-foreground">No saved properties</p>}
        </div>
      </TabsContent>

      <TabsContent value="recently-viewed">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Clock size={20} /> Recently Viewed
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyViewed.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <img
                  src={item.listing.image_urls?.[0] || '/images/placeholder-property.svg'}
                  alt={item.listing.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-primary">{item.listing.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.listing.location}</p>
                  <p className="font-bold text-primary mt-2">${item.listing.price.toLocaleString('en-US')}</p>
                  <p className="text-xs text-muted-foreground mt-1">Viewed {formatDate(item.viewed_at)}</p>
                </div>
              </div>
            ))}
          </div>
          {recentlyViewed.length === 0 && <p className="text-muted-foreground">No recently viewed properties</p>}
        </div>
      </TabsContent>

      <TabsContent value="documents">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <FileText size={20} /> Documents
            </h2>
            <button className="btn btn-primary btn-sm">
              <Plus size={16} className="mr-1" /> Upload Document
            </button>
          </div>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
<FileText size={20} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium text-primary">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.document_type} • {(doc.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <a href={doc.file_url} download className="text-accent hover:text-primary">
                      <Download size={18} />
                    </a>
                  </div>
                ))}
              </div>
              {documents.length === 0 && <p className="text-muted-foreground">No documents uploaded</p>}
            </div>
          </TabsContent>

      <TabsContent value="preferences">
        <form onSubmit={handlePreferencesUpdate} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Globe size={20} /> Preferences
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="theme" className="block text-sm font-medium mb-1">Theme</label>
              <select
                id="theme"
                name="theme"
                defaultValue={preferences.theme}
                className="input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-1">Language</label>
              <select
                id="language"
                name="language"
                defaultValue={preferences.language}
                className="input"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium mb-1">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={preferences.timezone}
                className="input"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="email_notifications"
                defaultChecked={preferences.email_notifications}
                className="rounded"
              />
              <Bell size={16} />
              <span>Email Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="sms_notifications"
                defaultChecked={preferences.sms_notifications}
                className="rounded"
              />
              <span>SMS Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="marketing_emails"
                defaultChecked={preferences.marketing_emails}
                className="rounded"
              />
              <span>Marketing Emails</span>
            </label>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">Save Preferences</button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="subscription">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <CreditCard size={20} /> Subscription & Invoices
          </h2>
<div className="space-y-4">
             <div>
               <p className="text-muted-foreground">Current Plan: <strong className="text-primary">Professional</strong></p>
               <p className="text-muted-foreground">Status: <strong className="text-success">Active</strong></p>
             </div>
            <button className="btn btn-secondary">View Plans</button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="api-keys">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Key size={20} /> API Keys
            </h2>
            <button onClick={handleCreateApiKey} className="btn btn-primary btn-sm">
              <Plus size={16} className="mr-1" /> Generate Key
            </button>
          </div>

          {showApiKey && apiKey && (
            <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-primary mb-2">Your API Key:</p>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-2 rounded flex-1 font-mono text-sm">
                  {apiKey}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('Copied to clipboard'); }}
                  className="btn btn-outline btn-sm"
                >
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Save this key now - it won't be shown again!</p>
            </div>
          )}

<div className="space-y-3">
             <p className="text-muted-foreground">No API keys generated yet</p>
           </div>
        </div>
      </TabsContent>

      <TabsContent value="activity">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Activity size={20} /> Activity Log
          </h2>
<div className="space-y-3">
             <p className="text-muted-foreground">Activity log will appear here</p>
           </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}