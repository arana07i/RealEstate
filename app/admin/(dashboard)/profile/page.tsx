import type { Metadata } from 'next';
import { ProfileClient } from '@/components/admin/ProfileClient';

export const metadata: Metadata = {
  title: 'User Profile',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-primary mb-6">User Profile</h1>
      <ProfileClient />
    </div>
  );
}