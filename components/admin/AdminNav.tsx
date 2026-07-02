'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/listings', label: 'Listings', exact: false },
  { href: '/admin/billing', label: 'Billing', exact: false },
  { href: '/admin/settings', label: 'Settings', exact: false },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-accent text-xs font-bold text-primary-dark">HC</span>
            <span className="text-sm font-bold text-primary">Admin Portal</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex" aria-label="Admin">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : (pathname?.startsWith(item.href) ?? false);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${active ? 'text-accent' : 'text-stone-600 hover:text-primary'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" target="_blank" className="text-sm text-stone-500 hover:text-primary">
            View Site ↗
          </Link>
          <button type="button" onClick={handleSignOut} className="btn btn-ghost px-4 py-2 text-sm">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
