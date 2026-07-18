import type { Metadata } from 'next';
import { SettingsClient } from '@/components/admin/SettingsClient';

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-primary mb-6">Settings</h1>
      <SettingsClient />
    </div>
  );
}