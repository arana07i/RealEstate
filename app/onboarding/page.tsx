'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { sanitizeText } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    agencyName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const slug = formData.agencyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const supabase = createClient();

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;

      const { error: agencyError } = await supabase.from('agencies').insert({
        name: sanitizeText(formData.agencyName),
        slug,
        email: formData.email,
        phone: sanitizeText(formData.phone),
        address: sanitizeText(formData.address),
      });

      if (agencyError) throw agencyError;

      router.push('/admin/login');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold text-primary mb-5">Create Your Agency</h1>
        <p className="text-muted-foreground mb-6">Start your 14-day free trial</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 p-3 text-sm text-red-600 rounded">{error}</div>}

          <div>
            <label htmlFor="agencyName" className="block text-sm font-medium mb-1">
              Agency Name
            </label>
            <input
              id="agencyName"
              name="agencyName"
              value={formData.agencyName}
              onChange={handleChange}
              required
              className="input"
              placeholder="Your Agency Name"
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
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="you@agency.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              required
              className="input"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Address (optional)
            </label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input"
              placeholder="123 Main St, City"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Creating...' : 'Start Free Trial'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/admin/login" className="text-accent hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}