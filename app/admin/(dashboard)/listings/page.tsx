import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllListingsAdmin } from '@/lib/listings';
import { formatPrice } from '@/lib/utils';
import { DeleteListingButton } from '@/components/admin/DeleteListingButton';

export const metadata: Metadata = {
  title: 'Manage Listings',
  robots: { index: false, follow: false },
};

export default async function AdminListingsPage() {
  const listings = await getAllListingsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Listings</h1>
          <p className="mt-1 text-stone-500">{listings.length} properties in inventory</p>
        </div>
        <Link href="/admin/listings/new" className="btn btn-secondary">
          + Add New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="mt-10 card p-12 text-center">
          <p className="text-lg font-medium text-primary">No listings yet</p>
          <p className="mt-2 text-stone-500">Create your first property listing to get started.</p>
          <Link href="/admin/listings/new" className="btn btn-secondary mt-6">
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-primary">Property</th>
                <th scope="col" className="px-6 py-4 font-semibold text-primary">Location</th>
                <th scope="col" className="px-6 py-4 font-semibold text-primary">Price</th>
                <th scope="col" className="px-6 py-4 font-semibold text-primary">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-stone-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-primary">{listing.title}</p>
                    <p className="text-xs text-stone-400">{listing.id.slice(0, 8)}…</p>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{listing.location}</td>
                  <td className="px-6 py-4 font-medium">{formatPrice(Number(listing.price))}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        listing.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/listings/${listing.id}/edit`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/listings/${listing.id}`}
                        target="_blank"
                        className="text-sm text-stone-500 hover:text-primary"
                      >
                        View
                      </Link>
                      <DeleteListingButton listingId={listing.id} listingTitle={listing.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}