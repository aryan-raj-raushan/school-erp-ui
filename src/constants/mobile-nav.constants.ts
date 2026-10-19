import { LayoutDashboard, Users, ClipboardCheck, Receipt, BookOpen, GraduationCap } from 'lucide-react';
import { PERMISSIONS, type AppPermission } from '@/constants/permissions.registry';
import type { NavItemConfig } from '@/types/layout/app-sidebar';

export interface MobileTabCandidate {
  title: string;
  url: string;
  icon: NavItemConfig['icon'];
  permissions?: AppPermission[];
}

export const MOBILE_TAB_CANDIDATES: MobileTabCandidate[] = [
  { title: 'Home', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Students', url: '/students', icon: Users, permissions: [PERMISSIONS.students.view] },
  {
    title: 'Attendance',
    url: '/attendance/students',
    icon: ClipboardCheck,
    permissions: [PERMISSIONS.attendance.view, PERMISSIONS.attendance.create],
  },
  { title: 'Fees', url: '/fees/payments', icon: Receipt, permissions: [PERMISSIONS.fees.view] },
  { title: 'Homework', url: '/school/homework', icon: BookOpen, permissions: [PERMISSIONS.homework.view] },
  { title: 'Exams', url: '/exam/exams', icon: GraduationCap, permissions: [PERMISSIONS.exams.view] },
];

export const MOBILE_TAB_LIMIT = 4;

export const MOBILE_TAB_HIDDEN_ROLES: string[] = ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'ADMIN'];
