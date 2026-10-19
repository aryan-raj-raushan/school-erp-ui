'use client';

import { CalendarCheck, UserCheck, UserX, BookOpen, GraduationCap } from 'lucide-react';
import { useTeacherDashboard } from './useTeacherDashboard';
import { useDashboardIdentity } from './useDashboardShared';
import { TEACHER_ACTIONS } from '@/constants/dashboard.constants';
import { ROUTES } from '@/constants';
import { fmtNumber, fmtShortDate, summariseAttendance } from '@/lib/dashboard.utils';
import type { DashKpi } from '@/types/dashboard.types';

export function useTeacherDashboardPage() {
  const { data, isLoading, error } = useTeacherDashboard();
  const identity = useDashboardIdentity();

  const att = summariseAttendance(data?.attendanceSummary ?? []);

  const kpis: DashKpi[] = [
    {
      key: 'present',
      label: 'Present today',
      value: fmtNumber(att.present),
      sub: `of ${fmtNumber(att.total)} marked`,
      icon: UserCheck,
      accent: 'emerald',
      href: '/attendance/students',
    },
    {
      key: 'absent',
      label: 'Absent today',
      value: fmtNumber(att.absent),
      sub: 'School-wide',
      icon: UserX,
      accent: 'rose',
      href: '/attendance/students',
    },
    {
      key: 'homework',
      label: 'My homework',
      value: fmtNumber(data?.recentHomework.length ?? 0),
      sub: 'Recently assigned',
      icon: BookOpen,
      accent: 'blue',
      href: ROUTES.homework,
    },
    {
      key: 'exams',
      label: 'Upcoming exams',
      value: fmtNumber(data?.upcomingExams.length ?? 0),
      sub: 'Scheduled',
      icon: GraduationCap,
      accent: 'amber',
      href: '/exam/exams',
    },
  ];

  return {
    isLoading,
    error,
    greeting: identity.greeting,
    title: identity.firstName || 'there',
    eyebrow: 'Teacher workspace',
    chips: [{ icon: CalendarCheck, label: identity.today || ' ' }],
    heroStat: {
      label: 'Attendance',
      value: att.rate != null ? `${att.rate}%` : '—',
      sub: `${fmtNumber(att.present)} present today`,
      percent: att.rate,
    },
    kpis,
    actions: TEACHER_ACTIONS,
    homework: (data?.recentHomework ?? []).map((h) => ({
      id: h.id,
      title: h.title,
      meta: h.due_date ? fmtShortDate(h.due_date) : (h.status ?? '—'),
    })),
    exams: (data?.upcomingExams ?? []).map((e) => ({ id: e.id, title: e.name, meta: fmtShortDate(e.start_date) })),
    events: (data?.upcomingEvents ?? []).map((e) => ({
      id: e.id,
      title: e.name,
      meta: e.type === 'HOLIDAY' ? 'Holiday' : fmtShortDate(e.from_date),
    })),
  };
}
