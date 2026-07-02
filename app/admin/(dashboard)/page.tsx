import type { Metadata } from 'next';
import Link from 'next/link';
import { getAdminStats } from '@/lib/listings';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="mt-1 text-stone-500">Manage your property inventory in real-time.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {[
          { label: 'Total Listings', value: stats.total, color: 'bg-primary' },
          { label: 'Active', value: stats.active, color: 'bg-emerald-600' },
          { label: 'Sold', value: stats.sold, color: 'bg-stone-500' },
        ].map((stat) => (
          <div key={stat.label} className="card p-6">
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{stat.value}</p>
            <div className={`mt-4 h-1 w-12 rounded ${stat.color}`} />
          </div>
        ))}
      </div>

      <div className="mt-10 card p-8">
        <h2 className="text-lg font-semibold text-primary">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/admin/listings/new" className="btn btn-secondary">
            + Add New Listing
          </Link>
          <Link href="/admin/listings" className="btn btn-ghost ring-1 ring-stone-200">
            Manage Listings
          </Link>
          <Link href="/" target="_blank" className="btn btn-ghost ring-1 ring-stone-200">
            View Public Site ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
