import type { Metadata } from 'next';
import { AgencySettingsForm } from '@/components/admin/AgencySettingsForm';

export const metadata: Metadata = {
  title: 'Agency Settings',
  robots: { index: false, follow: false },
};

export default function AgencySettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Agency Settings</h1>
      <AgencySettingsForm />
    </div>
  );
}