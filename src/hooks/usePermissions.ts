'use client';

import { useAuthStore } from '@/store/auth.store';
import { type AppPermission } from '@/constants/permissions.registry';

export function usePermissions() {
  const permissions = useAuthStore((s) => s.permissions);

  return {
    /** True if user has this exact permission */
    hasPermission: (perm: AppPermission): boolean => permissions.includes(perm),
    /** True if user has AT LEAST ONE of the given permissions */
    hasAnyPermission: (...perms: AppPermission[]): boolean => perms.some((p) => permissions.includes(p)),
    /** True if user has ALL of the given permissions */
    hasAllPermissions: (...perms: AppPermission[]): boolean => perms.every((p) => permissions.includes(p)),
    /** Raw permission list */
    permissions,
  };
}
