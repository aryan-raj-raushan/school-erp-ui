'use client';

import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, CircleDollarSign, AlertTriangle, CalendarCheck, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { SchoolsService } from '@/services/schools.service';
import { SubscriptionsService } from '@/services/subscriptions.service';
import { InvoicesService } from '@/services/invoices.service';
import { ROUTES } from '@/constants';
import { PLATFORM_ACTIONS } from '@/constants/dashboard.constants';
import { fmtNumber } from '@/lib/dashboard.utils';
import { useDashboardIdentity } from './useDashboardShared';
import { Role } from '@/types';
import type { DashAlert, DashKpi } from '@/types/dashboard.types';

const COPY: Record<string, { label: string; subtitle: string }> = {
  [Role.SALES]: { label: 'Sales executive', subtitle: 'Your assigned schools' },
  [Role.OPERATOR]: { label: 'Operator', subtitle: 'Payment verification' },
};
const DEFAULT_COPY = { label: 'Platform admin', subtitle: 'All schools & subscriptions' };

interface Counts {
  totalSchools: number;
  activeSchools: number;
  activeSubscriptions: number;
  overdueInvoices: number;
}

export function usePlatformDashboardPage() {
  const role = useAuthStore((s) => s.user?.role);
  const identity = useDashboardIdentity();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      SchoolsService.list({ limit: 1 }),
      SchoolsService.list({ limit: 1, is_active: true }),
      SubscriptionsService.list({ limit: 1, status: 'ACTIVE' }),
      InvoicesService.list({ limit: 1, status: 'OVERDUE' }),
    ])
      .then(([schools, active, subs, overdue]) => {
        if (cancelled) return;
        setCounts({
          totalSchools: schools.pagination.total,
          activeSchools: active.pagination.total,
          activeSubscriptions: subs.pagination.total,
          overdueInvoices: overdue.pagination.total,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isSuperAdmin = role === Role.SUPER_ADMIN || role === Role.ADMIN;
  const copy = (role && COPY[role]) || DEFAULT_COPY;

  const kpis: DashKpi[] = [
    { key: 'schools', label: 'Total schools', value: fmtNumber(counts?.totalSchools ?? 0), sub: isSuperAdmin ? 'All registered' : 'Assigned to you', icon: Building2, accent: 'violet', href: ROUTES.schools },
    { key: 'active', label: 'Active schools', value: fmtNumber(counts?.activeSchools ?? 0), sub: 'Currently active', icon: CheckCircle2, accent: 'emerald', href: ROUTES.schools },
    { key: 'subs', label: 'Subscriptions', value: fmtNumber(counts?.activeSubscriptions ?? 0), sub: 'Currently billing', icon: CircleDollarSign, accent: 'blue', href: ROUTES.subscriptions },
    { key: 'overdue', label: 'Overdue invoices', value: fmtNumber(counts?.overdueInvoices ?? 0), sub: 'Need follow-up', icon: AlertTriangle, accent: 'rose', href: '/billing' },
  ];

  const alerts: DashAlert[] =
    counts && counts.overdueInvoices > 0
      ? [{ id: 'overdue', label: 'Invoices overdue — follow up', value: String(counts.overdueInvoices), tone: 'danger', href: '/billing' }]
      : [];

  return {
    isLoading,
    greeting: identity.greeting,
    title: identity.firstName || 'there',
    eyebrow: copy.label,
    chips: [
      { icon: CalendarCheck, label: identity.today || ' ' },
      { icon: ShieldCheck, label: copy.subtitle },
    ],
    kpis,
    alerts,
    actions: PLATFORM_ACTIONS,
  };
}
