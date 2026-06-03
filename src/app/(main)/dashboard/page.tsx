"use client";

import * as React from "react";
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
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Clock,
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
  LineChart,
  Line,
} from "recharts";

import { Div } from "@/components/ui/layout";
import { H1, H2, H3, P, Span, SectionLabel } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Data ────────────────────────────────────────────────────────────────────

const ADMIN_NAME = "Aryan Raj";
const SCHOOL = {
  name: "Active Demo School",
  description:
    "Manage academics, attendance, fees, and school operations efficiently.",
  academicYear: "2025–2026",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Wishing you a restful night";
}

const KPI_CARDS = [
  {
    label: "Total Students",
    value: "1,842",
    change: "+12.5%",
    up: true,
    trend: "Trending up this month",
    sub: "Enrolled across all classes",
    icon: Users,
    accent:
      "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  },
  {
    label: "Total Staff",
    value: "124",
    change: "-3%",
    up: false,
    trend: "Down 3% this month",
    sub: "Teaching & non-teaching",
    icon: UserCog,
    accent: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    label: "Today's Attendance",
    value: "89.4%",
    change: "+2.1%",
    up: true,
    trend: "Strong student presence",
    sub: "1,647 of 1,842 present",
    icon: UserCheck,
    accent:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    label: "Fees Collected",
    value: "₹8,42,500",
    change: "+18%",
    up: true,
    trend: "Exceeds monthly target",
    sub: "₹1,57,500 still pending",
    icon: IndianRupee,
    accent:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
];

const QUICK_ACTIONS = [
  { label: "New Student", icon: UserPlus, color: "bg-violet-500" },
  { label: "New Staff", icon: UserCog, color: "bg-blue-500" },
  { label: "Attendance", icon: ClipboardCheck, color: "bg-emerald-500" },
  { label: "Fee Receipt", icon: Receipt, color: "bg-amber-500" },
  { label: "Leave Approval", icon: CalendarOff, color: "bg-rose-500" },
  { label: "Notice Board", icon: Megaphone, color: "bg-indigo-500" },
];

const ATTENDANCE_DATA = [
  { class: "Class I", present: 54, absent: 6 },
  { class: "Class II", present: 48, absent: 9 },
  { class: "Class III", present: 61, absent: 4 },
  { class: "Class IV", present: 55, absent: 8 },
  { class: "Class V", present: 58, absent: 5 },
  { class: "Class VI", present: 47, absent: 11 },
  { class: "Class VII", present: 52, absent: 7 },
  { class: "Class VIII", present: 60, absent: 3 },
  { class: "Class IX", present: 45, absent: 14 },
  { class: "Class X", present: 56, absent: 6 },
  { class: "Class XI", present: 38, absent: 10 },
  { class: "Class XII", present: 42, absent: 8 },
];

const CAPACITY_DATA = [
  { class: "I", strength: 60, capacity: 65 },
  { class: "II", strength: 57, capacity: 65 },
  { class: "III", strength: 65, capacity: 65 },
  { class: "IV", strength: 63, capacity: 65 },
  { class: "V", strength: 63, capacity: 65 },
  { class: "VI", strength: 58, capacity: 60 },
  { class: "VII", strength: 59, capacity: 60 },
  { class: "VIII", strength: 63, capacity: 60 },
  { class: "IX", strength: 59, capacity: 55 },
  { class: "X", strength: 62, capacity: 55 },
  { class: "XI", strength: 48, capacity: 50 },
  { class: "XII", strength: 50, capacity: 50 },
];

const FEES_DATA = [
  { class: "I", collected: 48000, pending: 12000 },
  { class: "II", collected: 52000, pending: 8000 },
  { class: "III", collected: 45000, pending: 15000 },
  { class: "IV", collected: 60000, pending: 5000 },
  { class: "V", collected: 55000, pending: 10000 },
  { class: "VI", collected: 62000, pending: 8000 },
  { class: "VII", collected: 58000, pending: 12000 },
  { class: "VIII", collected: 70000, pending: 5000 },
  { class: "IX", collected: 65000, pending: 15000 },
  { class: "X", collected: 72000, pending: 8000 },
  { class: "XI", collected: 80000, pending: 20000 },
  { class: "XII", collected: 75000, pending: 22000 },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function GreetingHeader() {
  return (
    <Div type="col" gap="xs">
      <P color="muted">Hi, {ADMIN_NAME}</P>
      <H1 className="text-2xl font-bold">{getGreeting()}</H1>
    </Div>
  );
}

function SchoolBanner() {
  return (
    <Div
      type="row"
      align="center"
      justify="between"
      className="rounded-2xl border border-border bg-gradient-to-r from-violet-50/60 to-indigo-50/40 dark:from-violet-950/30 dark:to-indigo-950/20 px-6 py-5"
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
          <H2 className="text-xl font-bold">{SCHOOL.name}</H2>
          <P color="muted">{SCHOOL.description}</P>
        </Div>
      </Div>

      <Div
        type="row"
        align="center"
        gap="sm"
        className="rounded-xl border border-border bg-background px-4 py-2.5 shrink-0"
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
              {SCHOOL.academicYear}
            </H3>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </Div>
        </Div>
      </Div>
    </Div>
  );
}

function KpiCard({ card }: { card: (typeof KPI_CARDS)[0] }) {
  const Icon = card.icon;
  return (
    <Div
      type="col"
      gap="md"
      className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
    >
      <Div type="row" justify="between" align="start">
        <P color="muted" className="text-sm">
          {card.label}
        </P>
        <Badge variant={card.up ? "success" : "danger"} className="gap-1">
          {card.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {card.change}
        </Badge>
      </Div>
      <H1 className="text-3xl font-bold tracking-tight">{card.value}</H1>
      <Div type="row" justify="between" align="end">
        <Div type="col" gap="xs">
          <Div type="row" align="center" gap="xs">
            <P color="default" className="text-sm font-medium">
              {card.trend}
            </P>
            {card.up ? (
              <TrendingUp size={12} className="text-emerald-500" />
            ) : (
              <TrendingDown size={12} className="text-rose-500" />
            )}
          </Div>
          <P color="muted" className="text-xs">
            {card.sub}
          </P>
        </Div>
        <Div
          type="row"
          align="center"
          justify="center"
          className={`h-10 w-10 rounded-lg shrink-0 ${card.accent}`}
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
    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
      className="rounded-xl border border-border bg-card px-6 py-4"
    >
      <Div type="row" align="center" gap="md">
        <Badge variant={punched ? "success" : "default"} className="gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${punched ? "bg-emerald-500" : "bg-zinc-400"}`}
          />
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
            <P color="muted" className="text-xs">
              Attendance
            </P>
            <H3 color="default" className="text-base font-semibold">
              {punched ? "Punched In" : "Not started"}
            </H3>
            <P color="muted" className="text-xs">
              {punched && time
                ? `Punched in at ${time}`
                : "Mark your attendance for today"}
            </P>
          </Div>
        </Div>
      </Div>

      <Div type="row" align="center" gap="md">
        <Div
          type="row"
          align="center"
          gap="xs"
          className="text-muted-foreground"
        >
          <Clock size={13} />
          <P color="muted" className="text-xs">
            {today}
          </P>
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
          {punched ? (
            <>
              <LogOut size={15} /> Punch Out
            </>
          ) : (
            <>
              <LogIn size={15} /> Punch In
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-1"
        >
          View Logs <ExternalLink size={12} />
        </Button>
      </Div>
    </Div>
  );
}

function QuickActions() {
  return (
    <Div type="col" gap="sm">
      <SectionLabel>Quick Actions</SectionLabel>
      <Div type="grid" cols={6} gap="sm">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 hover:shadow-sm transition-all text-center group"
            >
              <Div
                type="row"
                align="center"
                justify="center"
                // className={`h-10 w-10 rounded-xl ${action.color} bg-opacity-10 text-white`}
              >
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

function AttendanceChart() {
  return (
    <Div
      type="col"
      gap="md"
      className="rounded-xl border border-border bg-card p-5"
    >
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H3 color="default" className="font-semibold">
            Class-wise Attendance
          </H3>
          <P color="muted" className="text-xs">
            Today's present vs absent breakdown
          </P>
        </Div>
        <Badge variant="info">Today</Badge>
      </Div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={ATTENDANCE_DATA} barSize={16} barGap={4}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="class"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="present"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            name="Present"
          />
          <Bar
            dataKey="absent"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
            name="Absent"
          />
        </BarChart>
      </ResponsiveContainer>
    </Div>
  );
}

function CapacityChart() {
  return (
    <Div
      type="col"
      gap="md"
      className="rounded-xl border border-border bg-card p-5 flex-1"
    >
      <Div type="col" gap="xs">
        <H3 color="default" className="font-semibold">
          Strength vs Capacity
        </H3>
        <P color="muted" className="text-xs">
          Class-wise enrollment vs total seats
        </P>
      </Div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={CAPACITY_DATA} barSize={14} barGap={2}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="class"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 80]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="strength"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            name="Strength"
          />
          <Bar
            dataKey="capacity"
            fill="#c7d2fe"
            radius={[4, 4, 0, 0]}
            name="Capacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </Div>
  );
}

function FeesChart() {
  return (
    <Div
      type="col"
      gap="md"
      className="rounded-xl border border-border bg-card p-5 flex-1"
    >
      <Div type="col" gap="xs">
        <H3 color="default" className="font-semibold">
          Fees: Collected vs Pending
        </H3>
        <P color="muted" className="text-xs">
          Class-wise fees collection status (₹)
        </P>
      </Div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={FEES_DATA}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="class"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip
            content={<CustomTooltip />}
            formatter={(v: any) => `₹${v.toLocaleString()}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="collected"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Collected"
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
            strokeDasharray="4 2"
            name="Pending"
          />
        </LineChart>
      </ResponsiveContainer>
    </Div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Div
      type="col"
      gap="lg"
      className="min-h-screen bg-background px-6 py-8 max-w-screen-7xl mx-auto"
    >
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <GreetingHeader />
        <Div type="row" align="center" gap="sm">
          <Badge variant="info" className="gap-1.5 px-3 py-1">
            <CalendarCheck size={12} />
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </Badge>
        </Div>
      </Div>

      {/* School Banner */}
      <SchoolBanner />

      {/* KPI Cards */}
      <Div type="grid" cols={4} gap="md">
        {KPI_CARDS.map((card) => (
          <KpiCard key={card.label} card={card} />
        ))}
      </Div>

      {/* Punch In/Out */}
      <PunchCard />

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts */}
      <Div type="col" gap="md">
        <SectionLabel>Analytics</SectionLabel>

        {/* Full-width attendance */}
        <AttendanceChart />

        {/* Half-width charts */}
        <Div type="row" gap="md" align="stretch">
          <CapacityChart />
          <FeesChart />
        </Div>
      </Div>
    </Div>
  );
}
