import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  Clock,
  GraduationCap,
  Receipt,
  Megaphone,
  CalendarOff,
  DoorOpen,
  Footprints,
  UserCircle,
} from 'lucide-react';
import { ROUTES } from '@/constants';

export interface ParentNavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
}

/**
 * Every entry here maps to a real, working parent-portal page + backend
 * route discovered during the Parent Portal architecture review — not a
 * placeholder list. Same maintained-array convention as SCHOOL_NAV_MAIN /
 * SUPER_ADMIN_NAV_MAIN (this app has no dynamic-from-backend nav for any
 * role), scoped down to what a parent can actually see.
 */
export const PARENT_NAV_MAIN: ParentNavItem[] = [
  { title: 'Dashboard', url: ROUTES.parentPortal, icon: LayoutDashboard },
  { title: 'Attendance', url: `${ROUTES.parentPortal}/attendance`, icon: CalendarCheck },
  { title: 'Homework', url: `${ROUTES.parentPortal}/homework`, icon: BookOpen },
  { title: 'Timetable', url: `${ROUTES.parentPortal}/timetable`, icon: Clock },
  { title: 'Exams & Results', url: `${ROUTES.parentPortal}/exams`, icon: GraduationCap },
  { title: 'Fees', url: `${ROUTES.parentPortal}/fees`, icon: Receipt },
  { title: 'Notices', url: `${ROUTES.parentPortal}/notices`, icon: Megaphone },
  { title: 'Leave', url: `${ROUTES.parentPortal}/leave`, icon: CalendarOff },
  { title: 'Gate Passes', url: `${ROUTES.parentPortal}/gate-passes`, icon: DoorOpen },
  { title: 'Movements', url: `${ROUTES.parentPortal}/movements`, icon: Footprints },
  { title: 'Profile', url: `${ROUTES.parentPortal}/profile`, icon: UserCircle },
];

/** Shown in the bottom tab bar (mobile-first, Capacitor-native reality) — a subset for thumb reach. */
export const PARENT_NAV_TABS: ParentNavItem[] = [
  PARENT_NAV_MAIN[0],
  PARENT_NAV_MAIN[1],
  PARENT_NAV_MAIN[4],
  PARENT_NAV_MAIN[5],
  PARENT_NAV_MAIN[6],
];
