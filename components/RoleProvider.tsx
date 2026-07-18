'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/lib/types';

interface RoleContextValue {
  role: UserRole;
  permissions: string[];
  isLoading: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  canManageListings: boolean;
  canDeleteListing: boolean;
  canManageInquiries: boolean;
  canManageUsers: boolean;
  canManageBilling: boolean;
  canManageSettings: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({
  children,
  initialRole = 'viewer',
  initialPermissions = [],
}: {
  children: React.ReactNode;
  initialRole?: UserRole;
  initialPermissions?: string[];
}) {
  const [role] = useState<UserRole>(initialRole);
  const [permissions] = useState<string[]>(initialPermissions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const hasRole = useCallback(
    (roles: UserRole[]) => roles.includes(role),
    [role]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      if (role === 'super_admin') return true;
      return permissions.includes(permission);
    },
    [role, permissions]
  );

  const canManageListings = hasPermission('manage_listings');
  const canDeleteListing = hasPermission('delete_listings');
  const canManageInquiries = hasPermission('manage_inquiries');
  const canManageUsers = hasPermission('manage_users');
  const canManageBilling = hasPermission('manage_billing');
  const canManageSettings = hasPermission('manage_settings');

  return (
    <RoleContext.Provider
      value={{
        role,
        permissions,
        isLoading,
        hasRole,
        hasPermission,
        canManageListings,
        canDeleteListing,
        canManageInquiries,
        canManageUsers,
        canManageBilling,
        canManageSettings,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    return {
      role: 'viewer' as UserRole,
      permissions: [],
      isLoading: true,
      hasRole: () => false,
      hasPermission: () => false,
      canManageListings: false,
      canDeleteListing: false,
      canManageInquiries: false,
      canManageUsers: false,
      canManageBilling: false,
      canManageSettings: false,
    };
  }
  return context;
}
