'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { siteConfig } from '@/config/site';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded bg-accent text-sm font-bold text-primary-dark">{siteConfig.name.charAt(0)}</span>
            <span className="text-lg font-bold text-primary">{siteConfig.name}</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Admin Portal — Sign in to manage listings</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          <h1 className="text-xl font-bold text-primary">Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your Supabase Auth credentials</p>

          {error && (
            <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@propertyhub.com"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-secondary mt-6 w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected by Supabase Auth. No hardcoded credentials.
        </p>
      </div>
    </div>
  );
}