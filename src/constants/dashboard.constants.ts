import {
  UserPlus,
  UserCog,
  ClipboardCheck,
  Receipt,
  CalendarOff,
  Megaphone,
  BookOpen,
  GraduationCap,
  Wallet,
  Users,
  Building2,
  CreditCard,
  FileText,
} from 'lucide-react';
import type { DashAccent, DashAction } from '@/types/dashboard.types';
import { ROUTES } from './app.constants';

export const DASH_ACCENT_CLASSES: Record<DashAccent, string> = {
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300',
  indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
};

export const DASH_CHART_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

export const SCHOOL_ADMIN_ACTIONS: DashAction[] = [
  { label: 'Add student', icon: UserPlus, href: '/students/create-new', accent: 'violet' },
  { label: 'Attendance', icon: ClipboardCheck, href: '/attendance/students', accent: 'emerald' },
  { label: 'Collect fee', icon: Receipt, href: '/fees/payments', accent: 'amber' },
  { label: 'Leave', icon: CalendarOff, href: '/leave/applications', accent: 'rose' },
  { label: 'Add staff', icon: UserCog, href: ROUTES.staffNew, accent: 'blue' },
  { label: 'Holidays', icon: Megaphone, href: '/school/holidays-events', accent: 'pink' },
];

export const TEACHER_ACTIONS: DashAction[] = [
  { label: 'Attendance', icon: ClipboardCheck, href: '/attendance/students', accent: 'emerald' },
  { label: 'Homework', icon: BookOpen, href: ROUTES.homework, accent: 'blue' },
  { label: 'New homework', icon: FileText, href: ROUTES.homeworkNew, accent: 'violet' },
  { label: 'Students', icon: Users, href: ROUTES.students, accent: 'indigo' },
  { label: 'Exams', icon: GraduationCap, href: '/exam/exams', accent: 'amber' },
  { label: 'Leave', icon: CalendarOff, href: '/leave/apply', accent: 'rose' },
];

export const PLATFORM_ACTIONS: DashAction[] = [
  { label: 'Schools', icon: Building2, href: ROUTES.schools, accent: 'violet' },
  { label: 'Subscriptions', icon: Wallet, href: ROUTES.subscriptions, accent: 'blue' },
  { label: 'Billing', icon: CreditCard, href: '/billing', accent: 'amber' },
  { label: 'Invoices', icon: Receipt, href: '/invoices', accent: 'rose' },
];

export const DASH_COPY = {
  admin: { eyebrow: 'School overview' },
  teacher: { eyebrow: 'Teacher workspace' },
};
