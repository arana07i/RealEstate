import type { Metadata } from 'next';
import { ListingForm } from '@/components/admin/ListingForm';

export const metadata: Metadata = {
  title: 'Create Listing',
  robots: { index: false, follow: false },
};

export default function NewListingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Create Listing</h1>
      <p className="mt-1 text-stone-500">Add a new property to your inventory.</p>
      <div className="mt-8">
        <ListingForm mode="create" />
      </div>
    </div>
  );
}
