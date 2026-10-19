'use client';

import { CalendarCheck, Receipt, GraduationCap, BookOpen } from 'lucide-react';
import { useParentChildren } from './useParentChildren';
import { useParentDashboard } from './useParentDashboard';
import { useDashboardIdentity } from './useDashboardShared';
import { ROUTES } from '@/constants';
import { fmtNumber, fmtRupees, fmtShortDate } from '@/lib/dashboard.utils';
import type { DashAlert, DashKpi } from '@/types/dashboard.types';

export function useParentPortalPage() {
  const { activeChild } = useParentChildren();
  const { data, isLoading, error } = useParentDashboard();
  const identity = useDashboardIdentity();

  const base = ROUTES.parentPortal;
  const percent = data?.attendance?.attendancePercent ?? null;
  const pendingAmount = data?.pendingFees?.amount ?? 0;
  const pendingCount = data?.pendingFees?.count ?? 0;

  const kpis: DashKpi[] = [
    {
      key: 'attendance',
      label: 'Attendance',
      value: percent != null ? `${percent}%` : '—',
      sub: `${data?.attendance?.totalPresent ?? 0} of ${data?.attendance?.totalDays ?? 0} days`,
      icon: CalendarCheck,
      accent: 'emerald',
      href: `${base}/attendance`,
    },
    {
      key: 'fees',
      label: 'Fees due',
      value: fmtRupees(pendingAmount),
      sub: pendingCount ? `${pendingCount} bill(s) pending` : 'All clear',
      icon: Receipt,
      accent: 'amber',
      href: `${base}/fees`,
    },
    {
      key: 'exams',
      label: 'Upcoming exams',
      value: fmtNumber(data?.upcomingExams?.length ?? 0),
      sub: 'Scheduled',
      icon: GraduationCap,
      accent: 'violet',
      href: `${base}/exams`,
    },
    {
      key: 'homework',
      label: 'Homework',
      value: fmtNumber(data?.recentHomework?.length ?? 0),
      sub: 'Recently assigned',
      icon: BookOpen,
      accent: 'blue',
      href: `${base}/homework`,
    },
  ];

  const alerts: DashAlert[] =
    pendingCount > 0
      ? [{ id: 'fees', label: `Fees pending · ${fmtRupees(pendingAmount)}`, value: String(pendingCount), tone: 'danger', href: `${base}/fees` }]
      : [];

  return {
    isLoading,
    error,
    greeting: identity.greeting,
    title: activeChild?.student_name ?? 'Your child',
    eyebrow: activeChild?.class_label ? `Parent portal · ${activeChild.class_label}` : 'Parent portal',
    greetingName: `${identity.greeting}${identity.firstName ? `, ${identity.firstName}` : ''}`,
    chips: [{ icon: CalendarCheck, label: identity.today || ' ' }],
    heroStat: {
      label: 'Attendance',
      value: percent != null ? `${percent}%` : '—',
      sub: 'This year',
      percent,
    },
    kpis,
    alerts,
    homework: (data?.recentHomework ?? []).map((h) => ({
      id: h.id,
      title: h.title,
      meta: h.due_date ? fmtShortDate(h.due_date) : '—',
    })),
    exams: (data?.upcomingExams ?? []).map((e) => ({ id: e.id, title: e.name, meta: fmtShortDate(e.start_date) })),
    events: (data?.upcomingEvents ?? []).map((e) => ({ id: e.id, title: e.name, meta: fmtShortDate(e.from_date) })),
  };
}
