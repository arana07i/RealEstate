'use client';

import { useRole } from '@/components/RoleProvider';
import type { UserRole } from '@/lib/types';

interface PermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  roles?: UserRole[];
  permissions?: string[];
}

export function PermissionGate({
  children,
  fallback = null,
  roles,
  permissions,
}: PermissionGateProps) {
  const { hasRole, hasPermission } = useRole();

  const hasAccess = roles
    ? hasRole(roles)
    : permissions
      ? permissions.some(hasPermission)
      : true;

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
