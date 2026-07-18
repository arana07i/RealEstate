import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UserWithRole, AuthenticatedRequest, UserRole, SupabaseUserRoleData, SupabaseRolePermissionRow } from '@/lib/types';
import { logger } from '@/lib/logger';

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function getAuthenticatedUser(request: NextRequest): Promise<UserWithRole> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new UnauthorizedError('User profile not found');
  }

  const { data: userRoleData, error: roleError } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      agency_id,
      roles (name)
    `)
    .eq('user_id', user.id);

  if (roleError || !userRoleData || userRoleData.length === 0) {
    throw new UnauthorizedError('User role not assigned');
  }

  const roles = userRoleData as SupabaseUserRoleData[];
  const primaryRole = roles.find((ur) => ur.agency_id === profile.agency_id) || roles[0];
  const rolesObj = primaryRole.roles;
  const roleName = Array.isArray(rolesObj) ? (rolesObj[0]?.name ?? 'viewer') : (typeof rolesObj === 'object' && rolesObj?.name ? rolesObj.name : 'viewer');

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
    id: profile.id,
    agency_id: profile.agency_id,
    email: profile.email,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    role: roleName as UserRole,
    permissions,
  };
}

export function getAuthContext(user: UserWithRole): AuthenticatedRequest {
  return {
    user,
    agencyId: user.agency_id,
    isSuperAdmin: user.role === 'super_admin',
  };
}

export async function requireRole(request: NextRequest, allowedRoles: UserRole[]): Promise<UserWithRole> {
  const user = await getAuthenticatedUser(request);

  if (!allowedRoles.includes(user.role)) {
    logger.warn('Role access denied', {
      userId: user.id,
      role: user.role,
      allowedRoles,
      path: request.nextUrl.pathname,
    });
    throw new ForbiddenError('Insufficient permissions');
  }

  return user;
}

export async function requirePermission(request: NextRequest | null, permission: string): Promise<UserWithRole> {
  const user = await getAuthenticatedUser(request as NextRequest);

  if (user.role === 'super_admin') {
    return user;
  }

  if (!user.permissions.includes(permission)) {
    logger.warn('Permission denied', {
      userId: user.id,
      role: user.role,
      permission,
      path: request?.nextUrl?.pathname,
    });
    throw new ForbiddenError('Insufficient permissions');
  }

  return user;
}

export function hasRole(user: UserWithRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(user.role);
}

export function hasPermission(user: UserWithRole, permission: string): boolean {
  if (user.role === 'super_admin') return true;
  return user.permissions.includes(permission);
}

export function canManageListings(user: UserWithRole): boolean {
  if (user.role === 'super_admin' || user.role === 'agency_admin') return true;
  return hasPermission(user, 'manage_listings');
}

export function canEditListing(user: UserWithRole, listingCreatedBy: string | null): boolean {
  if (user.role === 'super_admin' || user.role === 'agency_admin') return true;
  if (user.role === 'agent' && listingCreatedBy === user.id) {
    return hasPermission(user, 'edit_own_listings');
  }
  return false;
}

export function canDeleteListing(user: UserWithRole): boolean {
  if (user.role === 'super_admin' || user.role === 'agency_admin') return true;
  return hasPermission(user, 'delete_listings');
}

export function canManageInquiries(user: UserWithRole): boolean {
  if (user.role === 'super_admin' || user.role === 'agency_admin') return true;
  return hasPermission(user, 'manage_inquiries');
}

export function canUpdateInquiryStatus(user: UserWithRole): boolean {
  if (user.role === 'super_admin' || user.role === 'agency_admin') return true;
  return hasPermission(user, 'update_inquiry_status');
}

export function canManageUsers(user: UserWithRole): boolean {
  return hasPermission(user, 'manage_users');
}

export function canManageBilling(user: UserWithRole): boolean {
  return hasPermission(user, 'manage_billing');
}

export function canViewAnalytics(user: UserWithRole): boolean {
  return hasPermission(user, 'view_analytics');
}

export function canManageSettings(user: UserWithRole): boolean {
  return hasPermission(user, 'manage_settings');
}

export function canViewAuditLogs(user: UserWithRole): boolean {
  return hasPermission(user, 'view_audit_logs');
}

export function canManageLeads(user: UserWithRole): boolean {
  return hasPermission(user, 'manage_leads');
}

export function canViewLeads(user: UserWithRole): boolean {
  return hasPermission(user, 'view_leads');
}

export function canManageReviews(user: UserWithRole): boolean {
  if (user.role === 'super_admin' || user.role === 'agency_admin') return true;
  return hasPermission(user, 'manage_reviews');
}
