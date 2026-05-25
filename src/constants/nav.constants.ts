import { Role } from '@/types';
import { ROUTES } from './app.constants';

export type NavIconKey = 'dashboard' | 'schools';

export interface NavItemConfig {
  href: string;
  label: string;
  iconKey: NavIconKey;
  roles?: Role[];
}

export const NAV_LABELS = {
  dashboard: 'Dashboard',
  schools: 'Schools',
  signOut: 'Sign out',
} as const;

export const NAV_ITEMS: NavItemConfig[] = [
  {
    href: ROUTES.dashboard,
    label: NAV_LABELS.dashboard,
    iconKey: 'dashboard',
  },
  {
    href: ROUTES.schools,
    label: NAV_LABELS.schools,
    iconKey: 'schools',
    roles: [Role.SUPER_ADMIN, Role.ADMIN],
  },
];
