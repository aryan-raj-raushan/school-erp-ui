import { Role } from '@/types';
import { ROUTES } from './app.constants';

export type NavIconKey = 'dashboard' | 'schools' | 'subscriptions' | 'academic-years' | 'classes' | 'students';

export interface NavItemConfig {
  href: string;
  label: string;
  iconKey: NavIconKey;
  roles?: Role[];
}

export const NAV_LABELS = {
  dashboard: 'Dashboard',
  schools: 'Schools',
  subscriptions: 'Subscriptions',
  academicYears: 'Academic Years',
  classes: 'Classes',
  students: 'Students',
  signOut: 'Sign out',
} as const;

export const NAV_ITEMS: NavItemConfig[] = [
  // Super admin items
  {
    href: ROUTES.dashboard,
    label: NAV_LABELS.dashboard,
    iconKey: 'dashboard',
    roles: [Role.SUPER_ADMIN, Role.ADMIN],
  },
  {
    href: ROUTES.schools,
    label: NAV_LABELS.schools,
    iconKey: 'schools',
    roles: [Role.SUPER_ADMIN, Role.ADMIN],
  },
  {
    href: ROUTES.subscriptions,
    label: NAV_LABELS.subscriptions,
    iconKey: 'subscriptions',
    roles: [Role.SUPER_ADMIN, Role.ADMIN],
  },
  // School admin items
  {
    href: ROUTES.schoolDashboard,
    label: NAV_LABELS.dashboard,
    iconKey: 'dashboard',
    roles: [Role.SCHOOL_ADMIN],
  },
  {
    href: ROUTES.academicYears,
    label: NAV_LABELS.academicYears,
    iconKey: 'academic-years',
    roles: [Role.SCHOOL_ADMIN],
  },
  {
    href: ROUTES.classes,
    label: NAV_LABELS.classes,
    iconKey: 'classes',
    roles: [Role.SCHOOL_ADMIN],
  },
  {
    href: ROUTES.students,
    label: NAV_LABELS.students,
    iconKey: 'students',
    roles: [Role.SCHOOL_ADMIN],
  },
];
