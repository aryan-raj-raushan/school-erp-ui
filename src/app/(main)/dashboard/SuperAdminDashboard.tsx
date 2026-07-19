"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, CircleDollarSign, CheckCircle2, PlusCircle } from "lucide-react";

import { Div } from "@/components/ui/layout";
import { H1, H2, P, SectionLabel } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { SchoolsService } from "@/services/schools.service";
import { SubscriptionsService } from "@/services/subscriptions.service";
import { ROUTES } from "@/constants";

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

export function SuperAdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [counts, setCounts] = React.useState<{
    totalSchools: number;
    activeSchools: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      SchoolsService.list({ limit: 1 }),
      SchoolsService.list({ limit: 1, is_active: true }),
      SubscriptionsService.list({ limit: 1 }),
      SubscriptionsService.list({ limit: 1, status: "ACTIVE" }),
    ])
      .then(([schools, activeSchools, subscriptions, activeSubscriptions]) => {
        if (cancelled) return;
        setCounts({
          totalSchools: schools.pagination.total,
          activeSchools: activeSchools.pagination.total,
          totalSubscriptions: subscriptions.pagination.total,
          activeSubscriptions: activeSubscriptions.pagination.total,
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
        <P color="muted">Hi, {user?.first_name || "there"}</P>
        <H1 className="text-2xl font-bold">{getGreeting()}</H1>
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
            <SectionLabel>Super Admin</SectionLabel>
            <H2 className="text-xl font-bold">Platform Overview</H2>
            <P color="muted" className="hidden sm:block">Manage schools and subscriptions across the platform.</P>
          </Div>
        </Div>
      </Div>

      <Div type="grid" cols={4} gap="md">
        <KpiCard
          label="Total Schools"
          value={isLoading ? "…" : fmt(counts?.totalSchools ?? 0)}
          sub="All registered schools"
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
          label="Total Subscriptions"
          value={isLoading ? "…" : fmt(counts?.totalSubscriptions ?? 0)}
          sub="All plans issued"
          icon={CircleDollarSign}
          accent="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          onClick={() => router.push(ROUTES.subscriptions)}
        />
        <KpiCard
          label="Active Subscriptions"
          value={isLoading ? "…" : fmt(counts?.activeSubscriptions ?? 0)}
          sub="Currently billing"
          icon={CircleDollarSign}
          accent="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          onClick={() => router.push(ROUTES.subscriptions)}
        />
      </Div>

      <Div type="col" gap="sm">
        <SectionLabel>Quick Actions</SectionLabel>
        <Div type="row" gap="sm" className="flex-col sm:flex-row">
          <Button onClick={() => router.push(ROUTES.schools)}>
            <PlusCircle size={16} /> Add School
          </Button>
          <Button variant="outline" onClick={() => router.push(ROUTES.subscriptions)}>
            View Subscriptions
          </Button>
        </Div>
      </Div>
    </Div>
  );
}
