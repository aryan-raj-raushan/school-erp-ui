"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, CircleDollarSign, CheckCircle2, PlusCircle, AlertTriangle } from "lucide-react";

import { Div } from "@/components/ui/layout";
import { H1, H2, P, SectionLabel } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { SchoolsService } from "@/services/schools.service";
import { SubscriptionsService } from "@/services/subscriptions.service";
import { InvoicesService } from "@/services/invoices.service";
import { ROUTES } from "@/constants";
import { Role } from "@/types";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Wishing you a restful night";
}

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
  onClick?: () => void;
}

function KpiCard({ label, value, sub, icon: Icon, accent, onClick }: KpiCardProps) {
  return (
    <Div
      type="col"
      gap="md"
      className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <P color="muted" className="text-sm">{label}</P>
      <H1 className="text-3xl font-bold tracking-tight">{value}</H1>
      <Div type="row" justify="between" align="end">
        <P color="muted" className="text-xs">{sub}</P>
        <Div type="row" align="center" justify="center" className={`h-10 w-10 rounded-lg shrink-0 ${accent}`}>
          <Icon size={18} />
        </Div>
      </Div>
    </Div>
  );
}

const COPY: Record<string, { label: string; title: string; description: string }> = {
  [Role.SALES]: {
    label: "Sales Executive",
    title: "My Schools",
    description: "Track your assigned schools and their billing status.",
  },
  [Role.OPERATOR]: {
    label: "Operator",
    title: "Payment Verification",
    description: "Review pending payments and school billing status.",
  },
};
const DEFAULT_COPY = {
  label: "Super Admin",
  title: "Platform Overview",
  description: "Manage schools and subscriptions across the platform.",
};

export function SuperAdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isSuperAdmin = user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN;
  const copy = (user?.role && COPY[user.role]) || DEFAULT_COPY;

  const [counts, setCounts] = React.useState<{
    totalSchools: number;
    activeSchools: number;
    activeSubscriptions: number;
    overdueInvoices: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      SchoolsService.list({ limit: 1 }),
      SchoolsService.list({ limit: 1, is_active: true }),
      SubscriptionsService.list({ limit: 1, status: "ACTIVE" }),
      InvoicesService.list({ limit: 1, status: "OVERDUE" }),
    ])
      .then(([schools, activeSchools, activeSubscriptions, overdueInvoices]) => {
        if (cancelled) return;
        setCounts({
          totalSchools: schools.pagination.total,
          activeSchools: activeSchools.pagination.total,
          activeSubscriptions: activeSubscriptions.pagination.total,
          overdueInvoices: overdueInvoices.pagination.total,
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = (n: number) => n.toLocaleString("en-IN");

  return (
    <Div type="col" gap="lg" className="min-h-screen bg-background px-4 py-4 sm:px-6 sm:py-8 max-w-screen-7xl mx-auto">
      <Div type="col" gap="xs">
        <P color="muted">Hi, {mounted ? (user?.first_name || "there") : "there"}</P>
        <H1 className="text-2xl font-bold">{mounted ? getGreeting() : ""}</H1>
      </Div>

      <Div
        type="row"
        align="center"
        justify="between"
        className="flex-col gap-4 sm:flex-row rounded-2xl border border-border bg-gradient-to-r from-violet-50/60 to-indigo-50/40 dark:from-violet-950/30 dark:to-indigo-950/20 px-4 py-4 sm:px-6 sm:py-5"
      >
        <Div type="row" align="center" gap="md">
          <Div type="row" align="center" justify="center" className="h-14 w-14 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 shrink-0">
            <Building2 size={24} />
          </Div>
          <Div type="col" gap="xs">
            <SectionLabel>{copy.label}</SectionLabel>
            <H2 className="text-xl font-bold">{copy.title}</H2>
            <P color="muted" className="hidden sm:block">{copy.description}</P>
          </Div>
        </Div>
      </Div>

      <Div type="grid" cols={4} gap="md">
        <KpiCard
          label="Total Schools"
          value={isLoading ? "…" : fmt(counts?.totalSchools ?? 0)}
          sub={isSuperAdmin ? "All registered schools" : "Schools assigned to you"}
          icon={Building2}
          accent="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
          onClick={() => router.push(ROUTES.schools)}
        />
        <KpiCard
          label="Active Schools"
          value={isLoading ? "…" : fmt(counts?.activeSchools ?? 0)}
          sub="Currently active"
          icon={CheckCircle2}
          accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          onClick={() => router.push(ROUTES.schools)}
        />
        <KpiCard
          label="Active Subscriptions"
          value={isLoading ? "…" : fmt(counts?.activeSubscriptions ?? 0)}
          sub="Currently billing"
          icon={CircleDollarSign}
          accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          onClick={() => router.push(ROUTES.subscriptions)}
        />
        <KpiCard
          label="Overdue Invoices"
          value={isLoading ? "…" : fmt(counts?.overdueInvoices ?? 0)}
          sub="Need follow-up"
          icon={AlertTriangle}
          accent="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          onClick={() => router.push("/billing")}
        />
      </Div>

      <Div type="col" gap="sm">
        <SectionLabel>Quick Actions</SectionLabel>
        <Div type="row" gap="sm" className="flex-col sm:flex-row">
          {isSuperAdmin && (
            <Button onClick={() => router.push(ROUTES.schools)}>
              <PlusCircle size={16} /> Add School
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(ROUTES.subscriptions)}>
            View Subscriptions
          </Button>
          <Button variant="outline" onClick={() => router.push("/billing")}>
            View Billing
          </Button>
        </Div>
      </Div>
    </Div>
  );
}
