"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  IndianRupee,
  CalendarCheck,
  UserPlus,
  UserCog,
  ClipboardCheck,
  Receipt,
  CalendarOff,
  Megaphone,
  LogIn,
  LogOut,
  BookOpen,
  Clock,
  GraduationCap,
  BookMarked,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Div } from "@/components/ui/layout";
import { H1, H2, H3, P, SectionLabel } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Wishing you a restful night";
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function fmtRupees(n: number) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
}

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#3b82f6", "#8b5cf6", "#ec4899"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GreetingHeader({ name }: { name: string }) {
  return (
    <Div type="col" gap="xs">
      <P color="muted">Hi, {name || "there"}</P>
      <H1 className="text-2xl font-bold">{getGreeting()}</H1>
    </Div>
  );
}

function SchoolBanner({ academicYear }: { academicYear: string }) {
  return (
    <Div
      type="row"
      align="center"
      justify="between"
      className="flex-col gap-4 sm:flex-row rounded-2xl border border-border bg-gradient-to-r from-violet-50/60 to-indigo-50/40 dark:from-violet-950/30 dark:to-indigo-950/20 px-4 py-4 sm:px-6 sm:py-5"
    >
      <Div type="row" align="center" gap="md">
        <Div
          type="row"
          align="center"
          justify="center"
          className="h-14 w-14 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 shrink-0"
        >
          <BookOpen size={24} />
        </Div>
        <Div type="col" gap="xs">
          <SectionLabel>School Dashboard</SectionLabel>
          <H2 className="text-xl font-bold">School Management</H2>
          <P color="muted" className="hidden sm:block">Manage academics, attendance, fees, and school operations efficiently.</P>
        </Div>
      </Div>

      <Div
        type="row"
        align="center"
        gap="sm"
        className="rounded-xl border border-border bg-background px-4 py-2.5 shrink-0 self-start sm:self-auto"
      >
        <Div
          type="row"
          align="center"
          justify="center"
          className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600"
        >
          <BookOpen size={14} />
        </Div>
        <Div type="col">
          <SectionLabel>Academic Year</SectionLabel>
          <Div type="row" align="center" gap="xs">
            <H3 color="default" className="font-semibold text-base">
              {academicYear}
            </H3>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </Div>
        </Div>
      </Div>
    </Div>
  );
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
      <P color="muted" className="text-sm">
        {label}
      </P>
      <H1 className="text-3xl font-bold tracking-tight">{value}</H1>
      <Div type="row" justify="between" align="end">
        <P color="muted" className="text-xs">
          {sub}
        </P>
        <Div
          type="row"
          align="center"
          justify="center"
          className={`h-10 w-10 rounded-lg shrink-0 ${accent}`}
        >
          <Icon size={18} />
        </Div>
      </Div>
    </Div>
  );
}

function PunchCard() {
  const [punched, setPunched] = React.useState(false);
  const [time, setTime] = React.useState<string | null>(null);

  const handlePunch = () => {
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setPunched(!punched);
    setTime(now);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Div
      type="row"
      align="center"
      justify="between"
      className="flex-col gap-4 sm:flex-row rounded-xl border border-border bg-card px-4 py-4 sm:px-6"
    >
      <Div type="row" align="center" gap="md">
        <Badge variant={punched ? "success" : "default"} className="gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${punched ? "bg-emerald-500" : "bg-zinc-400"}`} />
          {punched ? "On Duty" : "Off Duty"}
        </Badge>
        <Div type="row" align="center" gap="lg">
          <Div
            type="row"
            align="center"
            justify="center"
            className="h-10 w-10 rounded-full border border-border bg-muted text-muted-foreground shrink-0"
          >
            <Clock size={18} />
          </Div>
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs">Attendance</P>
            <H3 color="default" className="text-base font-semibold">
              {punched ? "Punched In" : "Not started"}
            </H3>
            <P color="muted" className="text-xs">
              {punched && time ? `Punched in at ${time}` : "Mark your attendance for today"}
            </P>
          </Div>
        </Div>
      </Div>

      <Div type="row" align="center" gap="md" className="self-stretch sm:self-auto justify-between sm:justify-end">
        <Div type="row" align="center" gap="xs" className="text-muted-foreground">
          <Clock size={13} />
          <P color="muted" className="text-xs">{today}</P>
        </Div>
        <Button
          onClick={handlePunch}
          className={
            punched
              ? "bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 px-5"
              : "bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-5"
          }
          variant="default"
        >
          {punched ? <><LogOut size={15} /> Punch Out</> : <><LogIn size={15} /> Punch In</>}
        </Button>
      </Div>
    </Div>
  );
}

const QUICK_ACTIONS = [
  { label: "New Student", icon: UserPlus, route: "/students/new" },
  { label: "New Staff", icon: UserCog, route: ROUTES.staffNew },
  { label: "Attendance", icon: ClipboardCheck, route: "/attendance" },
  { label: "Fee Receipt", icon: Receipt, route: "/fees" },
  { label: "Leave Approval", icon: CalendarOff, route: "/leave" },
  { label: "Notice Board", icon: Megaphone, route: "/schools" },
];

function QuickActions() {
  const router = useRouter();
  return (
    <Div type="col" gap="sm">
      <SectionLabel>Quick Actions</SectionLabel>
      <Div type="grid" cols={6} gap="sm">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => router.push(action.route)}
              className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 hover:shadow-sm transition-all text-center"
            >
              <Div type="row" align="center" justify="center">
                <Icon size={18} />
              </Div>
              <P color="default" className="text-xs font-medium leading-tight">
                {action.label}
              </P>
            </button>
          );
        })}
      </Div>
    </Div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function AttendanceTrendChart({ trend }: { trend: { date: string; present: number; absent: number }[] }) {
  const data = trend.map((r) => ({
    date: new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
    Present: r.present,
    Absent: r.absent,
  }));

  return (
    <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H3 color="default" className="font-semibold">Attendance Trend</H3>
          <P color="muted" className="text-xs">Last 7 days present vs absent</P>
        </Div>
        <Badge variant="info">7 Days</Badge>
      </Div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={16} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Div>
  );
}

function ClasswiseStudentsChart({ data }: { data: { class_name: string; count: number }[] }) {
  const chartData = data.map((r) => ({ class: r.class_name, Students: Number(r.count) }));

  return (
    <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5 flex-1">
      <Div type="col" gap="xs">
        <H3 color="default" className="font-semibold">Class-wise Students</H3>
        <P color="muted" className="text-xs">Enrollment per class</P>
      </Div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="class" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Students" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Div>
  );
}

function GenderPieChart({ data }: { data: { gender: string | null; count: number }[] }) {
  const chartData = data.map((r) => ({ name: r.gender ?? "Unknown", value: Number(r.count) }));

  return (
    <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5 flex-1 min-w-0 sm:min-w-[240px]">
      <Div type="col" gap="xs">
        <H3 color="default" className="font-semibold">Gender Distribution</H3>
        <P color="muted" className="text-xs">Student gender breakdown</P>
      </Div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }: any) => `${name} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: any) => fmt(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
    </Div>
  );
}

function AdmissionPieChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.map((r) => ({ name: r.status, value: Number(r.count) }));

  return (
    <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5 flex-1 min-w-0 sm:min-w-[240px]">
      <Div type="col" gap="xs">
        <H3 color="default" className="font-semibold">Admission Enquiries</H3>
        <P color="muted" className="text-xs">Status breakdown</P>
      </Div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }: any) => `${String(name).slice(0, 4)} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: any) => fmt(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
    </Div>
  );
}

function FeesPieChart({ byStatus }: { byStatus: { status: string; total: string; paid: string; count: number }[] }) {
  const collected = byStatus.reduce((s, r) => s + Number(r.paid ?? 0), 0);
  const billed = byStatus.reduce((s, r) => s + Number(r.total ?? 0), 0);
  const pending = billed - collected;

  const chartData = [
    { name: "Collected", value: collected },
    { name: "Pending", value: pending },
  ];

  return (
    <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5 flex-1">
      <Div type="col" gap="xs">
        <H3 color="default" className="font-semibold">Fees Overview</H3>
        <P color="muted" className="text-xs">Collected vs pending</P>
      </Div>
      <Div type="row" gap="md" className="mt-1">
        {[
          { label: "Billed", val: billed, color: "#6366f1" },
          { label: "Collected", val: collected, color: "#10b981" },
          { label: "Pending", val: pending, color: "#f59e0b" },
        ].map((d) => (
          <Div key={d.label} type="col" gap="xs" className="flex-1 rounded-lg bg-muted/40 p-3">
            <P color="muted" className="text-xs">{d.label}</P>
            <H3 color="default" className="font-bold text-sm" style={{ color: d.color }}>
              {fmtRupees(d.val)}
            </H3>
          </Div>
        ))}
      </Div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={3}
            label={({ name, percent }: any) => `${name} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            <Cell fill="#10b981" />
            <Cell fill="#f59e0b" />
          </Pie>
          <Tooltip formatter={(v: any) => fmtRupees(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
    </Div>
  );
}

function UpcomingList({ title, items, emptyText }: { title: string; items: { id: string; label: string; sub: string }[]; emptyText: string }) {
  return (
    <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5 flex-1">
      <H3 color="default" className="font-semibold">{title}</H3>
      {items.length === 0 ? (
        <P color="muted" className="text-sm">{emptyText}</P>
      ) : (
        <Div type="col" gap="xs">
          {items.map((item) => (
            <Div key={item.id} type="row" justify="between" align="center" className="rounded-lg bg-muted/30 px-3 py-2">
              <P color="default" className="text-sm font-medium truncate flex-1 mr-2">{item.label}</P>
              <P color="muted" className="text-xs shrink-0">{item.sub}</P>
            </Div>
          ))}
        </Div>
      )}
    </Div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error } = useDashboard();

  const firstName = user?.first_name ?? "";
  const academicYear = data?.currentAcademicYear?.name ?? "—";

  const kpiCards = [
    {
      label: "Total Students",
      value: isLoading ? "…" : fmt(data?.counts.students ?? 0),
      sub: "Active enrolled students",
      icon: Users,
      accent: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
      route: ROUTES.students,
    },
    {
      label: "Total Staff",
      value: isLoading ? "…" : fmt(data?.counts.staff ?? 0),
      sub: "Teaching & non-teaching",
      icon: UserCog,
      accent: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      route: ROUTES.staffs,
    },
    {
      label: "Today's Attendance",
      value: isLoading ? "…" : data?.attendance.rate != null ? `${data.attendance.rate}%` : "—",
      sub: `${fmt(data?.attendance.present ?? 0)} present · ${fmt(data?.attendance.absent ?? 0)} absent`,
      icon: UserCheck,
      accent: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      route: "/attendance",
    },
    {
      label: "Fees Collected",
      value: isLoading ? "…" : fmtRupees(data?.fees.totalCollected ?? 0),
      sub: `${fmtRupees(data?.fees.totalPending ?? 0)} pending`,
      icon: IndianRupee,
      accent: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      route: "/fees",
    },
    {
      label: "Total Parents",
      value: isLoading ? "…" : fmt(data?.counts.parents ?? 0),
      sub: "Registered parents",
      icon: Users,
      accent: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
      route: "/parents",
    },
    {
      label: "Classes",
      value: isLoading ? "…" : fmt(data?.counts.classes ?? 0),
      sub: `${fmt(data?.counts.subjects ?? 0)} subjects · ${fmt(data?.counts.departments ?? 0)} depts`,
      icon: GraduationCap,
      accent: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
      route: ROUTES.classes,
    },
    {
      label: "Pending Leave",
      value: isLoading ? "…" : fmt((data?.leave.pending.teacher ?? 0) + (data?.leave.pending.student ?? 0)),
      sub: `${data?.leave.pending.teacher ?? 0} teacher · ${data?.leave.pending.student ?? 0} student`,
      icon: CalendarOff,
      accent: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
      route: "/leave",
    },
    {
      label: "Finance",
      value: isLoading ? "…" : fmtRupees(data?.finance.totalIncome ?? 0),
      sub: `Expenses: ${fmtRupees(data?.finance.totalExpenses ?? 0)}`,
      icon: BookMarked,
      accent: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
      route: "/finance",
    },
  ];

  const upcomingExams = (data?.exams.upcoming ?? []).map((e) => ({
    id: e.id,
    label: e.name,
    sub: new Date(e.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));

  const upcomingEvents = (data?.events.upcoming ?? []).map((e) => ({
    id: e.id,
    label: e.name,
    sub: e.type === "HOLIDAY" ? "Holiday" : "Event",
  }));

  const recentHomework = (data?.homework.recent ?? []).map((h) => ({
    id: h.id,
    label: h.title,
    sub: h.due_date
      ? new Date(h.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : h.status ?? "—",
  }));

  return (
    <Div type="col" gap="lg" className="min-h-screen bg-background px-4 py-4 sm:px-6 sm:py-8 max-w-screen-7xl mx-auto">
      {/* Header */}
      <Div type="row" justify="between" align="center" className="flex-wrap gap-2">
        <GreetingHeader name={firstName} />
        <Div type="row" align="center" gap="sm">
          {error && (
            <Badge variant="danger" className="gap-1.5">
              <AlertCircle size={12} /> Failed to load
            </Badge>
          )}
          <Badge variant="info" className="gap-1.5 px-3 py-1">
            <CalendarCheck size={12} />
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </Badge>
        </Div>
      </Div>

      {/* School Banner */}
      <SchoolBanner academicYear={academicYear} />

      {/* KPI Cards — 4 per row */}
      <Div type="grid" cols={4} gap="md">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} onClick={() => router.push(card.route)} />
        ))}
      </Div>

      {/* Punch In/Out */}
      <PunchCard />

      {/* Quick Actions */}
      <QuickActions />

      {/* Analytics */}
      <Div type="col" gap="md">
        <SectionLabel>Analytics</SectionLabel>

        {/* Attendance 7-day trend */}
        {(data?.attendance.trend?.length ?? 0) > 0 && (
          <AttendanceTrendChart trend={data!.attendance.trend} />
        )}

        {/* Class-wise students + Fees */}
        <Div type="row" gap="md" align="stretch" className="flex-col md:flex-row">
          {(data?.students.byClass?.length ?? 0) > 0 && (
            <ClasswiseStudentsChart data={data!.students.byClass} />
          )}
          {(data?.fees.byStatus?.length ?? 0) > 0 && (
            <FeesPieChart byStatus={data!.fees.byStatus} />
          )}
        </Div>

        {/* Pie charts row */}
        <Div type="row" gap="md" align="stretch" className="flex-col sm:flex-row flex-wrap">
          {(data?.students.byGender?.length ?? 0) > 0 && (
            <GenderPieChart data={data!.students.byGender} />
          )}
          {(data?.admissions.byStatus?.length ?? 0) > 0 && (
            <AdmissionPieChart data={data!.admissions.byStatus} />
          )}
          {data && (
            <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5 flex-1">
              <H3 color="default" className="font-semibold">Finance Summary</H3>
              <P color="muted" className="text-xs">Income vs Expenses</P>
              <Div type="col" gap="sm" className="mt-2">
                {[
                  { label: "Total Income", val: fmtRupees(data.finance.totalIncome), cls: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" },
                  { label: "Total Expenses", val: fmtRupees(data.finance.totalExpenses), cls: "bg-rose-50 dark:bg-rose-900/20 text-rose-600" },
                  { label: "Pending Salary", val: `${fmt(data.finance.pendingSalaryCount)} staff`, cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-600" },
                ].map((row) => (
                  <Div key={row.label} type="row" justify="between" align="center" className={`rounded-lg px-3 py-2 ${row.cls}`}>
                    <P color="default" className="text-sm font-medium">{row.label}</P>
                    <H3 color="default" className="font-bold text-sm">{row.val}</H3>
                  </Div>
                ))}
              </Div>
            </Div>
          )}
        </Div>
      </Div>

      {/* Upcoming lists */}
      <Div type="col" gap="md">
        <SectionLabel>Upcoming</SectionLabel>
        <Div type="row" gap="md" align="stretch" className="flex-col md:flex-row">
          <UpcomingList title="Upcoming Exams" items={upcomingExams} emptyText="No upcoming exams" />
          <UpcomingList title="Events & Holidays" items={upcomingEvents} emptyText="No upcoming events" />
          <UpcomingList title="Recent Homework" items={recentHomework} emptyText="No recent homework" />
        </Div>
      </Div>
    </Div>
  );
}
