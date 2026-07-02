'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { sanitizeText } from '@/lib/utils';

interface AgencySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  primary_color: string;
  secondary_color: string;
}

export function AgencySettingsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<AgencySettings>({
    name: '',
    email: '',
    phone: '',
    address: '',
    primary_color: '#0f2822',
    secondary_color: '#2d5a4e',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('agencies').select('name,email,phone,address,primary_color,secondary_color').single();
      
      if (data) {
        setSettings({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          primary_color: data.primary_color || '#0f2822',
          secondary_color: data.secondary_color || '#2d5a4e',
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    const { error } = await supabase.from('agencies').update({
      name: sanitizeText(settings.name),
      email: settings.email,
      phone: sanitizeText(settings.phone),
      address: sanitizeText(settings.address),
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      router.refresh();
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-2xl">
      {loading && (
        <div className="mb-4 text-center text-stone-500">Loading agency settings...</div>
      )}
      {error && <div className="bg-red-50 p-3 text-sm text-red-600 rounded mb-4">{error}</div>}
      {success && <div className="bg-emerald-50 p-3 text-sm text-emerald-600 rounded mb-4">Settings saved!</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Agency Name
          </label>
          <input
            id="name"
            name="name"
            value={settings.name}
            onChange={handleChange}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={settings.email}
            onChange={handleChange}
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            value={settings.phone}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Address
          </label>
          <input
            id="address"
            name="address"
            value={settings.address}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="primary_color" className="block text-sm font-medium mb-1">
            Primary Color
          </label>
          <input
            id="primary_color"
            name="primary_color"
            type="color"
            value={settings.primary_color}
            onChange={handleChange}
            className="w-full h-10"
          />
        </div>

        <div>
          <label htmlFor="secondary_color" className="block text-sm font-medium mb-1">
            Secondary Color
          </label>
          <input
            id="secondary_color"
            name="secondary_color"
            type="color"
            value={settings.secondary_color}
            onChange={handleChange}
            className="w-full h-10"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}