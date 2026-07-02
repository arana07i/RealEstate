import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getListingByIdAdmin } from '@/lib/listings';
import { ListingForm } from '@/components/admin/ListingForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingByIdAdmin(id);
  return {
    title: listing ? `Edit: ${listing.title}` : 'Edit Listing',
    robots: { index: false, follow: false },
  };
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingByIdAdmin(id);

  if (!listing) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Edit Listing</h1>
      <p className="mt-1 text-stone-500">{listing.title}</p>
      <div className="mt-8">
        <ListingForm
          mode="edit"
          initialData={{
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: String(listing.price),
            location: listing.location,
            image_urls: listing.image_urls,
            status: listing.status,
            bedrooms: listing.bedrooms != null ? String(listing.bedrooms) : undefined,
            bathrooms: listing.bathrooms != null ? String(listing.bathrooms) : undefined,
            area_sqft: listing.area_sqft != null ? String(listing.area_sqft) : undefined,
            featured: listing.featured,
            draft: listing.draft,
          }}
        />
      </div>
    </div>
  );
}
