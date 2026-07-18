import type { Metadata } from 'next';
import { ListingForm } from '@/components/admin/ListingForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { SupabaseUserRoleData } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Create Listing',
  robots: { index: false, follow: false },
};

export default async function NewListingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
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
  const role = Array.isArray(rolesObj) 
    ? (typeof rolesObj[0]?.name === 'string' ? rolesObj[0]?.name : 'viewer')
    : (typeof rolesObj?.name === 'string' ? rolesObj?.name : 'viewer');

  if (role !== 'super_admin' && role !== 'agency_admin' && role !== 'agent') {
    redirect('/admin/listings?error=forbidden');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Create Listing</h1>
      <p className="mt-1 text-muted-foreground">Add a new property to your inventory.</p>
      <div className="mt-8">
        <ListingForm mode="create" />
      </div>
    </div>
  );
}