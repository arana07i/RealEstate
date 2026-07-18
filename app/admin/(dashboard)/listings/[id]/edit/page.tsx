import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getListingByIdAdmin } from '@/lib/listings';
import { ListingForm } from '@/components/admin/ListingForm';
import { createClient } from '@/lib/supabase/server';
import type { UserRole, SupabaseUserRoleData } from '@/lib/types';

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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single();

  const { data: userRoleData } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      agency_id,
      roles (name)
    `)
    .eq('user_id', user.id);

  const roles = userRoleData as SupabaseUserRoleData[] | undefined;
  const primaryRole = roles?.find((ur) => ur.agency_id === profile?.agency_id) || roles?.[0];
  const rolesObj = primaryRole?.roles;
  const roleName = Array.isArray(rolesObj) 
    ? (typeof rolesObj[0]?.name === 'string' ? rolesObj[0]?.name : undefined)
    : (typeof rolesObj?.name === 'string' ? rolesObj?.name : undefined);
  const role = (roleName || 'viewer') as UserRole;

  const canEdit = role === 'super_admin' || role === 'agency_admin' ||
    (role === 'agent' && listing.created_by === user.id);

  if (!canEdit) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Edit Listing</h1>
      <p className="mt-1 text-muted-foreground">{listing.title}</p>
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