import { AdminNav } from '@/components/admin/AdminNav';
import { RoleProvider } from '@/components/RoleProvider';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { UserRole, SupabaseUserRoleData, SupabaseRolePermissionRow } from '@/lib/types';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  try {
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

    let role: UserRole = 'viewer';
    let permissions: string[] = [];

    if (userRoleData && userRoleData.length > 0) {
      const roles = userRoleData as SupabaseUserRoleData[];
      const primaryRole = roles.find((ur) => ur.agency_id === profile?.agency_id) || roles[0];
      const rolesObj = primaryRole?.roles;
      const roleName = typeof rolesObj === 'object' && !Array.isArray(rolesObj) && rolesObj?.name
        ? (typeof rolesObj.name === 'string' ? rolesObj.name : rolesObj.name[0])
        : 'viewer';
      role = (roleName || 'viewer') as UserRole;

      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select(`
          permissions (name)
        `)
        .eq('role_id', primaryRole.role_id);

      permissions = ((rolePermissions as SupabaseRolePermissionRow[]) || [])
        .map((rp) => {
          const n = rp.permissions?.name;
          return typeof n === 'string' ? n : Array.isArray(n) ? n[0] : undefined;
        })
        .filter(Boolean) as string[];
    }

    return (
      <div className="min-h-screen bg-background dark:bg-muted">
        <div className="lg:flex">
          <AdminNav />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <RoleProvider initialRole={role} initialPermissions={permissions}>
              {children}
            </RoleProvider>
          </main>
        </div>
      </div>
    );
  } catch {
    redirect('/admin/login');
  }
}
