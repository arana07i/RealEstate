import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </div>
  );
}