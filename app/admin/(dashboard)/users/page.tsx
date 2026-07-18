import type { Metadata } from 'next';
import UsersClient from '@/components/admin/UsersClient';

export const metadata: Metadata = {
  title: 'Manage Users',
  robots: { index: false, follow: false },
};

export default async function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Users</h1>
      <p className="mt-1 text-muted-foreground">Manage users and their roles within your agency.</p>
      <UsersClient />
    </div>
  );
}
