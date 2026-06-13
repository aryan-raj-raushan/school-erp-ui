'use client';

import { type ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { type AppPermission } from '@/constants/permissions.registry';

interface PermissionGateProps {
  /** Required permission slug */
  permission: AppPermission;
  /** Rendered when user lacks permission (default: nothing) */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders children only if the current user has the given permission.
 *
 * Usage:
 *   <PermissionGate permission="students.create">
 *     <Button onClick={navigateToNew}>Add Student</Button>
 *   </PermissionGate>
 */
export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
