import { createClient } from '@/lib/supabase/server';
import type { Role, Permission, SupabaseRolePermissionRow } from '@/lib/types';
import { logger } from '@/lib/logger';

export interface RoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(role: Omit<Role, 'id' | 'created_at'>): Promise<Role | null>;
  update(id: string, updates: Partial<Role>): Promise<Role | null>;
  delete(id: string): Promise<boolean>;
  getAllPermissions(): Promise<Permission[]>;
  getRolePermissions(roleId: string): Promise<Permission[]>;
  assignPermission(roleId: string, permissionId: string): Promise<boolean>;
  removePermission(roleId: string, permissionId: string): Promise<boolean>;
}

export class SupabaseRoleRepository implements RoleRepository {
  async findAll(): Promise<Role[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      logger.error('Failed to fetch roles', { error: error.message });
      return [];
    }
    return (data ?? []) as Role[];
  }

  async findById(id: string): Promise<Role | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Role;
  }

  async findByName(name: string): Promise<Role | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('name', name)
      .single();

    if (error) return null;
    return data as Role;
  }

  async create(role: Omit<Role, 'id' | 'created_at'>): Promise<Role | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('roles')
      .insert(role)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create role', { error: error.message });
      return null;
    }
    return data as Role;
  }

  async update(id: string, updates: Partial<Role>): Promise<Role | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update role', { error: error.message });
      return null;
    }
    return data as Role;
  }

  async delete(id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete role', { error: error.message });
      return false;
    }
    return true;
  }

  async getAllPermissions(): Promise<Permission[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true });

    if (error) {
      logger.error('Failed to fetch permissions', { error: error.message });
      return [];
    }
    return (data ?? []) as Permission[];
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permissions (*)
      `)
      .eq('role_id', roleId);

    if (error) {
      logger.error('Failed to fetch role permissions', { error: error.message });
      return [];
    }

    return ((data ?? []) as unknown as SupabaseRolePermissionRow[])
      .map((rp) => rp.permissions)
      .filter(Boolean) as Permission[];
  }

  async assignPermission(roleId: string, permissionId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('role_permissions')
      .insert({ role_id: roleId, permission_id: permissionId });

    if (error) {
      logger.error('Failed to assign permission', { error: error.message });
      return false;
    }
    return true;
  }

  async removePermission(roleId: string, permissionId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);

    if (error) {
      logger.error('Failed to remove permission', { error: error.message });
      return false;
    }
    return true;
  }
}
