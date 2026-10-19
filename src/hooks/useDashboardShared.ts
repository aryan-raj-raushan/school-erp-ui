'use client';

import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getGreeting, fmtToday } from '@/lib/dashboard.utils';
import { AuthContext, Role } from '@/types';

const subscribe = () => () => {};

export function useDashboardIdentity() {
  const user = useAuthStore((s) => s.user);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return {
    firstName: mounted ? (user?.first_name ?? '') : '',
    greeting: mounted ? getGreeting() : '',
    today: mounted ? fmtToday() : '',
  };
}

export type DashboardVariant = 'platform' | 'teacher' | 'school';

export function useDashboardVariant(): DashboardVariant {
  const context = useAuthStore((s) => s.context);
  const role = useAuthStore((s) => s.user?.role);
  if (context === AuthContext.COMPANY) return 'platform';
  if (role === Role.TEACHER) return 'teacher';
  return 'school';
}
