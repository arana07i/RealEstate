import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllListingsAdmin } from '@/lib/listings';
import { formatPrice } from '@/lib/utils';
import { DeleteListingButton } from '@/components/admin/DeleteListingButton';
import { AdminPaginationNav } from '@/components/AdminPaginationNav';
import { PermissionGate } from '@/components/PermissionGate';
import { Building2, Plus, Eye, Edit } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: 'Manage Listings',
  robots: { index: false, follow: false },
};

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: listings, totalPages, totalRecords } = await getAllListingsAdmin(undefined, page, 12);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Listings</h1>
          <p className="text-muted-foreground">{totalRecords} properties in inventory</p>
        </div>
        <PermissionGate permissions={['manage_listings', 'create_listings']}>
          <Link href="/admin/listings/new" className="btn btn-secondary">
            <Plus size={16} />
            Add New Listing
          </Link>
        </PermissionGate>
      </div>

      {listings.length === 0 ? (
        <div className="card-premium mt-10 p-12 text-center">
          <Building2 size={48} className="mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-primary">No listings yet</p>
          <p className="mt-2 text-muted-foreground">Create your first property listing to get started.</p>
          <PermissionGate permissions={['manage_listings', 'create_listings']}>
            <Link href="/admin/listings/new" className="btn btn-secondary mt-6">
              Create Listing
            </Link>
          </PermissionGate>
        </div>
      ) : (
        <>
          <div className="card-premium mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 dark:border-border">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold text-primary">Property</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-primary">Location</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-primary">Price</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-primary">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{listing.id.slice(0, 8)}…</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{listing.location}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(Number(listing.price))}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          listing.status === 'active'
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <PermissionGate permissions={['manage_listings', 'edit_all_listings', 'edit_own_listings']}>
                          <Link
                            href={`/admin/listings/${listing.id}/edit`}
                            className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                          >
                            <Edit size={14} />
                            Edit
                          </Link>
                        </PermissionGate>
                        <Link
                          href={`/listings/${listing.id}`}
                          target="_blank"
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                        <PermissionGate permissions={['delete_listings', 'manage_listings']}>
                          <DeleteListingButton listingId={listing.id} listingTitle={listing.title} />
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPaginationNav
            page={page}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={12}
          />
        </>
      )}
    </div>
  );
}