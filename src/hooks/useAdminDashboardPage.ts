'use client';

import {
  Users,
  UserCog,
  UserCheck,
  IndianRupee,
  GraduationCap,
  CalendarOff,
  Wallet,
  Contact,
  CalendarCheck,
  BookOpen,
  ReceiptText,
  BanknoteArrowDown,
} from 'lucide-react';
import { useDashboard } from './useDashboard';
import { useDashboardIdentity } from './useDashboardShared';
import { ROUTES } from '@/constants';
import { SCHOOL_ADMIN_ACTIONS } from '@/constants/dashboard.constants';
import {
  fmtNumber,
  fmtRupees,
  fmtShortDate,
  fmtTrendLabel,
} from '@/lib/dashboard.utils';
import type { DashAlert, DashKpi } from '@/types/dashboard.types';

export function useAdminDashboardPage() {
  const { data, isLoading, error, refresh } = useDashboard();
  const identity = useDashboardIdentity();

  const rate = data?.attendance.rate ?? null;
  const pendingLeave = (data?.leave.pending.teacher ?? 0) + (data?.leave.pending.student ?? 0);

  const kpis: DashKpi[] = [
    {
      key: 'students',
      label: 'Students',
      value: fmtNumber(data?.counts.students ?? 0),
      sub: 'Active enrolled',
      icon: Users,
      accent: 'violet',
      href: ROUTES.students,
    },
    {
      key: 'staff',
      label: 'Staff',
      value: fmtNumber(data?.counts.staff ?? 0),
      sub: 'Teaching & non-teaching',
      icon: UserCog,
      accent: 'blue',
      href: ROUTES.staffs,
    },
    {
      key: 'attendance',
      label: 'Attendance today',
      value: rate != null ? `${rate}%` : '—',
      sub: `${fmtNumber(data?.attendance.present ?? 0)} present · ${fmtNumber(data?.attendance.absent ?? 0)} absent`,
      icon: UserCheck,
      accent: 'emerald',
      href: '/attendance/students',
    },
    {
      key: 'fees',
      label: 'Fees collected',
      value: fmtRupees(data?.fees.totalCollected ?? 0),
      sub: `${fmtRupees(data?.fees.totalPending ?? 0)} pending`,
      icon: IndianRupee,
      accent: 'amber',
      href: '/fees/payments',
    },
    {
      key: 'parents',
      label: 'Parents',
      value: fmtNumber(data?.counts.parents ?? 0),
      sub: 'Registered',
      icon: Contact,
      accent: 'pink',
      href: '/parents',
    },
    {
      key: 'classes',
      label: 'Classes',
      value: fmtNumber(data?.counts.classes ?? 0),
      sub: `${fmtNumber(data?.counts.subjects ?? 0)} subjects`,
      icon: GraduationCap,
      accent: 'indigo',
      href: ROUTES.classes,
    },
    {
      key: 'leave',
      label: 'Pending leave',
      value: fmtNumber(pendingLeave),
      sub: `${data?.leave.pending.teacher ?? 0} staff · ${data?.leave.pending.student ?? 0} student`,
      icon: CalendarOff,
      accent: 'rose',
      href: '/leave/applications',
    },
    {
      key: 'finance',
      label: 'Income',
      value: fmtRupees(data?.finance.totalIncome ?? 0),
      sub: `Expenses ${fmtRupees(data?.finance.totalExpenses ?? 0)}`,
      icon: Wallet,
      accent: 'teal',
      href: '/finance/ledger',
    },
  ];

  kpis.push(
    {
      key: 'fee-bills',
      label: 'Fee bills pending',
      value: fmtNumber(data?.fees.pendingCount ?? 0),
      sub: fmtRupees(data?.fees.totalPending ?? 0),
      icon: ReceiptText,
      accent: 'rose',
      href: '/fees/payments',
    },
    {
      key: 'salaries',
      label: 'Salaries due',
      value: fmtNumber(data?.finance.pendingSalaryCount ?? 0),
      sub: 'Staff awaiting payment',
      icon: BanknoteArrowDown,
      accent: 'amber',
      href: '/hr/salary',
    },
  );

  const PRIMARY_KPIS = ['attendance', 'fees', 'leave', 'students'];
  const byKey = new Map(kpis.map((k) => [k.key, k]));
  const primaryKpis = PRIMARY_KPIS.map((key) => byKey.get(key)!);
  const secondaryKpis = kpis.filter((k) => !PRIMARY_KPIS.includes(k.key));

  const alerts: DashAlert[] = [];
  if (data) {
    if (pendingLeave > 0)
      alerts.push({ id: 'leave', label: 'Leave requests awaiting approval', value: String(pendingLeave), tone: 'warn', href: '/leave/applications' });
    if (data.fees.pendingCount > 0)
      alerts.push({ id: 'fees', label: `Fee bills pending · ${fmtRupees(data.fees.totalPending)}`, value: String(data.fees.pendingCount), tone: 'danger', href: '/fees/payments' });
    if (data.finance.pendingSalaryCount > 0)
      alerts.push({ id: 'salary', label: 'Staff salaries pending', value: String(data.finance.pendingSalaryCount), tone: 'info', href: '/hr/salary' });
  }

  const billed = data?.fees.totalBilled ?? 0;
  const collected = data?.fees.totalCollected ?? 0;
  const pending = data?.fees.totalPending ?? 0;
  const collectedPct = billed > 0 ? Math.round((collected / billed) * 100) : 0;

  return {
    isLoading,
    refresh,
    error,
    hasData: !!data,
    greeting: identity.greeting,
    title: identity.firstName || 'there',
    eyebrow: 'School overview',
    chips: [
      { icon: CalendarCheck, label: identity.today || ' ' },
      { icon: BookOpen, label: data?.currentAcademicYear?.name ?? 'No academic year' },
    ],
    heroStat: {
      label: 'Attendance',
      value: rate != null ? `${rate}%` : '—',
      sub: `${fmtNumber(data?.attendance.present ?? 0)} present today`,
      percent: rate,
    },
    primaryKpis,
    secondaryKpis,
    alerts,
    actions: SCHOOL_ADMIN_ACTIONS,
    trend: (data?.attendance.trend ?? []).map((r) => ({
      label: fmtTrendLabel(r.date),
      present: r.present,
      absent: r.absent,
    })),
    classRows: (data?.students.byClass ?? []).map((r) => ({ label: r.class_name, value: Number(r.count) })),
    gender: (data?.students.byGender ?? []).map((r) => ({ name: r.gender ?? 'Unknown', value: Number(r.count) })),
    admissions: (data?.admissions.byStatus ?? []).map((r) => ({ name: r.status, value: Number(r.count) })),
    feeRows: [
      { label: 'Billed', value: fmtRupees(billed), tone: 'indigo' as const },
      { label: 'Collected', value: fmtRupees(collected), tone: 'emerald' as const },
      { label: 'Pending', value: fmtRupees(pending), tone: 'amber' as const },
    ],
    feeProgress: { percent: collectedPct, label: `of ${fmtRupees(billed)} billed` },
    financeRows: [
      { label: 'Income', value: fmtRupees(data?.finance.totalIncome ?? 0), tone: 'emerald' as const },
      { label: 'Expenses', value: fmtRupees(data?.finance.totalExpenses ?? 0), tone: 'rose' as const },
      { label: 'Salaries due', value: `${fmtNumber(data?.finance.pendingSalaryCount ?? 0)} staff`, tone: 'amber' as const },
    ],
    exams: (data?.exams.upcoming ?? []).map((e) => ({ id: e.id, title: e.name, meta: fmtShortDate(e.start_date) })),
    events: (data?.events.upcoming ?? []).map((e) => ({
      id: e.id,
      title: e.name,
      meta: e.type === 'HOLIDAY' ? 'Holiday' : fmtShortDate(e.from_date),
    })),
    homework: (data?.homework.recent ?? []).map((h) => ({
      id: h.id,
      title: h.title,
      meta: h.due_date ? fmtShortDate(h.due_date) : (h.status ?? '—'),
    })),
  };
}
