import { createClient } from '@/lib/supabase/server';
import type { Profile, UserRole, UserWithRole, SupabaseUserRoleData, SupabaseRolePermissionRow } from '@/lib/types';
import { logger } from '@/lib/logger';

export interface UserRepository {
  findById(id: string): Promise<Profile | null>;
  findByEmail(email: string): Promise<Profile | null>;
  findByAgency(agencyId: string): Promise<Profile[]>;
  create(user: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile | null>;
  update(id: string, updates: Partial<Profile>): Promise<Profile | null>;
  delete(id: string): Promise<boolean>;
  assignRole(userId: string, roleId: string, agencyId: string | null): Promise<boolean>;
  removeRole(userId: string, roleId: string, agencyId: string | null): Promise<boolean>;
  getUserWithRole(userId: string): Promise<UserWithRole | null>;
  getAllUsers(agencyId?: string): Promise<UserWithRole[]>;
}

export class SupabaseUserRepository implements UserRepository {
  async findById(id: string): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Profile;
  }

  async findByEmail(email: string): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data as Profile;
  }

  async findByAgency(agencyId: string): Promise<Profile[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('agency_id', agencyId);

    if (error) return [];
    return (data ?? []) as Profile[];
  }

  async create(user: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .insert(user)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create profile', { error: error.message });
      return null;
    }
    return data as Profile;
  }

  async update(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update profile', { error: error.message });
      return null;
    }
    return data as Profile;
  }

  async delete(id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete profile', { error: error.message });
      return false;
    }
    return true;
  }

  async assignRole(userId: string, roleId: string, agencyId: string | null): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId, agency_id: agencyId });

    if (error) {
      logger.error('Failed to assign role', { error: error.message });
      return false;
    }
    return true;
  }

  async removeRole(userId: string, roleId: string, agencyId: string | null): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .eq('agency_id', agencyId);

    if (error) {
      logger.error('Failed to remove role', { error: error.message });
      return false;
    }
    return true;
  }

  async getUserWithRole(userId: string): Promise<UserWithRole | null> {
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        agency_id,
        roles (name)
      `)
      .eq('user_id', userId);

    if (!userRoleData || userRoleData.length === 0) return null;

    const roles = userRoleData as SupabaseUserRoleData[];
    const primaryRole = roles.find((ur) => ur.agency_id === profile.agency_id) || roles[0];
    const rolesObj = primaryRole?.roles;
    const roleName = Array.isArray(rolesObj) ? rolesObj[0]?.name : typeof rolesObj === 'object' && rolesObj?.name ? rolesObj.name : 'viewer';

    const { data: rolePermissions } = await supabase
      .from('role_permissions')
      .select(`
        permissions (name)
      `)
      .eq('role_id', primaryRole.role_id);

    const permissions = ((rolePermissions as SupabaseRolePermissionRow[]) || [])
      .map((rp) => {
        const n = rp.permissions?.name;
        return typeof n === 'string' ? n : Array.isArray(n) ? n[0] : undefined;
      })
      .filter(Boolean) as string[];

    return {
      ...profile,
      role: roleName as UserRole,
      permissions,
    };
  }

  async getAllUsers(agencyId?: string): Promise<UserWithRole[]> {
    const supabase = await createClient();

    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    const { data: profiles } = await query;
    if (!profiles || profiles.length === 0) return [];

    const users: UserWithRole[] = [];

    for (const profile of profiles) {
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          agency_id,
          roles (name)
        `)
        .eq('user_id', profile.id);

      if (!userRoleData || userRoleData.length === 0) continue;

      const roles = userRoleData as SupabaseUserRoleData[];
      const primaryRole = roles.find((ur) => ur.agency_id === profile.agency_id) || roles[0];
      const rolesObj = primaryRole?.roles;
      const roleName = Array.isArray(rolesObj) ? rolesObj[0]?.name : typeof rolesObj === 'object' && rolesObj?.name ? rolesObj.name : 'viewer';

      const { data: rolePermissions } = await supabase
        .from('role_permissions')
        .select(`
          permissions (name)
        `)
        .eq('role_id', primaryRole.role_id);

      const permissions = ((rolePermissions as SupabaseRolePermissionRow[]) || [])
        .map((rp) => {
          const n = rp.permissions?.name;
          return typeof n === 'string' ? n : Array.isArray(n) ? n[0] : undefined;
        })
        .filter(Boolean) as string[];

      users.push({
        ...profile,
        role: roleName as UserRole,
        permissions,
      });
    }

    return users;
  }
}
