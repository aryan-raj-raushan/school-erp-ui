"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ChevronRight, Inbox } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import { PullToRefresh } from "./pull-to-refresh";
import { DASH_ACCENT_CLASSES, DASH_CHART_COLORS } from "@/constants/dashboard.constants";
import type {
  DashAction,
  DashAlert,
  DashAlertTone,
  DashBarRow,
  DashHeroChip,
  DashHeroStat,
  DashKpi,
  DashListItem,
  DashSlice,
  DashTrendPoint,
} from "@/types/dashboard.types";


export function DashboardRoot({
  children,
  onRefresh,
}: {
  children: React.ReactNode;
  /** Enables pull-to-refresh on phones. */
  onRefresh?: () => Promise<unknown> | void;
}) {
  const content = (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pt-4 pb-8 md:gap-6 md:pt-6">
      {children}
    </div>
  );
  return onRefresh ? <PullToRefresh onRefresh={onRefresh}>{content}</PullToRefresh> : content;
}

export function DashboardSplit({
  main,
  aside,
}: {
  main: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 md:gap-6">
      <div className="flex min-w-0 flex-col gap-5 md:gap-6 lg:col-span-2">{main}</div>
      <div className="flex min-w-0 flex-col gap-5 md:gap-6">{aside}</div>
    </div>
  );
}

export function DashboardColumns({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">{children}</div>;
}

export function SectionHeading({
  title,
  href,
  actionLabel = "View all",
}: {
  title: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between px-0.5">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {href && (
        <Link href={href} className="flex items-center text-xs font-medium text-primary">
          {actionLabel}
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

export function DashSection({
  title,
  href,
  children,
}: {
  title?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {title && <SectionHeading title={title} href={href} />}
      {children}
    </section>
  );
}


function Ring({ percent, children }: { percent: number | null; children: React.ReactNode }) {
  const size = 84;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percent ?? 0));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
        {children}
      </div>
    </div>
  );
}

interface DashboardHeroProps {
  eyebrow: string;
  greeting: string;
  title: string;
  chips?: DashHeroChip[];
  stat?: DashHeroStat | null;
  compact?: boolean;
}

export function DashboardHero({ eyebrow, greeting, title, chips = [], stat, compact }: DashboardHeroProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        compact ? "px-5 py-4 md:px-6 md:py-4" : "px-5 py-5 md:px-8 md:py-7",
      )}
      style={{
        background:
          "linear-gradient(135deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%)",
        color: "var(--theme-active-text)",
        boxShadow: "0 12px 32px -12px var(--theme-glow)",
      }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-sm" />
      <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">{eyebrow}</p>
          <p className="mt-1.5 text-sm opacity-80">{greeting}</p>
          <h1 className="truncate text-2xl font-bold leading-tight md:text-3xl">{title}</h1>
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-2.5 py-1 text-xs font-medium backdrop-blur"
                >
                  <chip.icon size={12} />
                  {chip.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {stat && (
          <div className="flex shrink-0 flex-col items-center gap-1.5 text-center">
            <Ring percent={stat.percent}>{stat.value}</Ring>
            <p className="text-[11px] font-semibold leading-none">{stat.label}</p>
            <p className="max-w-[110px] truncate text-[10px] leading-none opacity-75">{stat.sub}</p>
          </div>
        )}
      </div>
    </div>
  );
}


export function KpiGrid({ children, dense }: { children: React.ReactNode; dense?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 md:gap-4",
        dense ? "sm:grid-cols-3 lg:grid-cols-6" : "lg:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

export function KpiTile({ kpi, loading, dense }: { kpi: DashKpi; loading?: boolean; dense?: boolean }) {
  const Icon = kpi.icon;
  if (dense) {
    return (
      <Link
        href={kpi.href}
        className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-sm p-3 transition-colors hover:bg-muted/40"
      >
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", DASH_ACCENT_CLASSES[kpi.accent])}>
          <Icon size={17} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-lg font-bold leading-tight">{kpi.value}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{kpi.label}</span>
        </span>
      </Link>
    );
  }
  return (
    <Link
      href={kpi.href}
      className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-sm p-3.5 transition-all active:scale-[0.98] md:p-5 md:hover:-translate-y-0.5 md:hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl md:h-10 md:w-10", DASH_ACCENT_CLASSES[kpi.accent])}>
          <Icon size={18} />
        </span>
        <ChevronRight size={16} className="text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <Skeleton className="h-7 w-16 rounded-lg" />
        ) : (
          <p className="truncate text-2xl font-bold leading-none tracking-tight md:text-3xl">{kpi.value}</p>
        )}
        <p className="mt-1.5 truncate text-[13px] font-medium">{kpi.label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{kpi.sub}</p>
      </div>
    </Link>
  );
}


export function QuickActions({ actions }: { actions: DashAction[] }) {
  return (
    <div
      className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6 md:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {actions.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className="flex w-[76px] shrink-0 snap-start flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-3 sm:rounded-2xl sm:border sm:border-[var(--dash-border)] sm:bg-[var(--dash-card)] sm:shadow-sm sm:p-3 sm:transition-colors sm:hover:bg-muted/50"
        >
          <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl transition-transform active:scale-95 sm:h-10 sm:w-10 sm:rounded-xl", DASH_ACCENT_CLASSES[a.accent])}>
            <a.icon size={22} />
          </span>
          <span className="text-center text-[11px] font-medium leading-tight sm:text-left sm:text-[13px]">
            {a.label}
          </span>
        </Link>
      ))}
    </div>
  );
}


const ALERT_TONE: Record<DashAlertTone, string> = {
  warn: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/50",
  danger: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/50",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/50",
};

export function AlertList({ alerts, inline }: { alerts: DashAlert[]; inline?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <div className={cn("flex flex-col gap-2", inline && "md:grid md:grid-cols-3")}>
      {alerts.map((a) => (
        <Link
          key={a.id}
          href={a.href}
          className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 transition-opacity active:opacity-70", ALERT_TONE[a.tone])}
        >
          <AlertCircle size={18} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.label}</span>
          <span className="shrink-0 text-sm font-bold">{a.value}</span>
          <ChevronRight size={16} className="shrink-0 opacity-60" />
        </Link>
      ))}
    </div>
  );
}


export function DashCard({
  title,
  description,
  right,
  children,
  className,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-sm p-4 md:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function ListCard({
  title,
  icon: Icon,
  accent = "violet",
  items,
  emptyText,
}: {
  title: string;
  icon: LucideIcon;
  accent?: keyof typeof DASH_ACCENT_CLASSES;
  items: DashListItem[];
  emptyText: string;
}) {
  return (
    <DashCard title={title}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
          <Inbox size={22} className="opacity-60" />
          <p className="text-xs">{emptyText}</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", DASH_ACCENT_CLASSES[accent])}>
                <Icon size={16} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {item.meta}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  );
}


function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function AttendanceTrendCard({ data, compact }: { data: DashTrendPoint[]; compact?: boolean }) {
  const rows = data.map((d) => ({ label: d.label, Present: d.present, Absent: d.absent }));
  return (
    <DashCard
      title="Attendance trend"
      description="Last 7 days"
      right={
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-500" />Present</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-rose-500" />Absent</span>
        </div>
      }
    >
      <div className={cn("-ml-3", compact ? "h-[170px] md:h-[190px]" : "h-[190px] md:h-[240px]")}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dashPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis width={36} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<TrendTooltip />} />
            <Area type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={2.5} fill="url(#dashPresent)" />
            <Area type="monotone" dataKey="Absent" stroke="#f43f5e" strokeWidth={2} fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashCard>
  );
}

export function DonutCard({
  title,
  description,
  data,
  format = (n: number) => n.toLocaleString("en-IN"),
}: {
  title: string;
  description?: string;
  data: DashSlice[];
  format?: (n: number) => string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <DashCard title={title} description={description}>
      <div className="flex items-center gap-4">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={38} outerRadius={56} paddingAngle={3} stroke="none">
                {data.map((_, i) => (
                  <Cell key={i} fill={DASH_CHART_COLORS[i % DASH_CHART_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold leading-none">{format(total)}</span>
            <span className="text-[10px] text-muted-foreground">Total</span>
          </div>
        </div>
        <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center gap-2 text-xs">
              <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: DASH_CHART_COLORS[i % DASH_CHART_COLORS.length] }} />
              <span className="min-w-0 flex-1 truncate capitalize">{d.name.toLowerCase()}</span>
              <span className="font-semibold">{format(d.value)}</span>
              <span className="w-9 text-right text-muted-foreground">
                {total ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DashCard>
  );
}

export function BarListCard({
  title,
  description,
  rows,
  unit,
}: {
  title: string;
  description?: string;
  rows: DashBarRow[];
  unit: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <DashCard title={title} description={description}>
      <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate font-medium">{r.label}</span>
              <span className="text-muted-foreground">
                {r.value.toLocaleString("en-IN")} {unit}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}

export function MoneyCard({
  title,
  description,
  rows,
  progress,
}: {
  title: string;
  description?: string;
  rows: { label: string; value: string; tone: "emerald" | "amber" | "rose" | "indigo" }[];
  progress?: { percent: number; label: string };
}) {
  const TONE = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
  } as const;
  return (
    <DashCard title={title} description={description}>
      {progress && (
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold leading-none">{progress.percent}%</span>
            <span className="text-xs text-muted-foreground">{progress.label}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-700"
              style={{ width: `${Math.max(0, Math.min(100, progress.percent))}%` }}
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl bg-muted/50 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground">{r.label}</p>
            <p className={cn("mt-0.5 text-sm font-bold", TONE[r.tone])}>{r.value}</p>
          </div>
        ))}
      </div>
    </DashCard>
  );
}


export function DashboardError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
      <AlertCircle size={18} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-[148px] w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[112px]" />
        ))}
      </div>
      <Skeleton className="h-[260px] w-full" />
    </>
  );
}
