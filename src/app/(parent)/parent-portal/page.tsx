"use client";

import { useRouter } from "next/navigation";
import { CalendarCheck, Receipt, GraduationCap, BookOpen } from "lucide-react";
import { Div, H1, H2, P, Spinner, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/auth.store";
import { useParentChildren } from "@/hooks/useParentChildren";
import { useParentDashboard } from "@/hooks/useParentDashboard";
import { ROUTES } from "@/constants";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtRupees(n: number) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: typeof CalendarCheck;
  accent: string;
  onClick?: () => void;
}

function KpiCard({ label, value, sub, icon: Icon, accent, onClick }: KpiCardProps) {
  return (
    <Div
      type="col"
      gap="sm"
      className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <Div type="row" justify="between" align="center">
        <P color="muted" className="text-xs">{label}</P>
        <Div type="row" align="center" justify="center" className={`h-8 w-8 rounded-lg shrink-0 ${accent}`}>
          <Icon size={16} />
        </Div>
      </Div>
      <H1 className="text-2xl font-bold tracking-tight">{value}</H1>
      <P color="muted" className="text-xs">{sub}</P>
    </Div>
  );
}

function UpcomingList({ title, items, emptyText }: { title: string; items: { id: string; label: string; sub: string }[]; emptyText: string }) {
  return (
    <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-4 flex-1 min-w-[240px]">
      <H2 className="text-sm font-semibold">{title}</H2>
      {items.length === 0 ? (
        <P color="muted" className="text-sm">{emptyText}</P>
      ) : (
        <Div type="col" gap="xs">
          {items.map((item) => (
            <Div key={item.id} type="row" justify="between" align="center" className="rounded-lg bg-muted/30 px-3 py-2">
              <P className="text-sm font-medium truncate flex-1 mr-2">{item.label}</P>
              <P color="muted" className="text-xs shrink-0">{item.sub}</P>
            </Div>
          ))}
        </Div>
      )}
    </Div>
  );
}

export default function ParentPortalPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeChild } = useParentChildren();
  const { data, isLoading, error } = useParentDashboard();

  const attendancePercent = data?.attendance?.attendancePercent ?? 0;
  const pendingAmount = data?.pendingFees?.amount ?? 0;
  const pendingCount = data?.pendingFees?.count ?? 0;
  const upcomingExamsCount = data?.upcomingExams?.length ?? 0;
  const homeworkCount = data?.recentHomework?.length ?? 0;

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <Div type="col" gap="xs">
        <P color="muted">{getGreeting()}, {user?.first_name ?? "there"}</P>
        <H1 className="text-2xl font-bold">
          {activeChild?.student_name ?? "Your child"}
          {activeChild?.class_label ? <Badge variant="secondary" className="ml-2 align-middle">{activeChild.class_label}</Badge> : null}
        </H1>
      </Div>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-12">
          <Spinner />
        </Div>
      ) : error ? (
        <Badge variant="danger">Failed to load dashboard</Badge>
      ) : (
        <>
          <Div type="grid" gap="md" className="grid-cols-2 sm:grid-cols-4">
            <KpiCard
              label="Attendance"
              value={`${attendancePercent}%`}
              sub={`${data?.attendance?.totalPresent ?? 0} present / ${data?.attendance?.totalDays ?? 0} days`}
              icon={CalendarCheck}
              accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
              onClick={() => router.push(`${ROUTES.parentPortal}/attendance`)}
            />
            <KpiCard
              label="Fees Pending"
              value={fmtRupees(pendingAmount)}
              sub={`${pendingCount} bill(s) due`}
              icon={Receipt}
              accent="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
              onClick={() => router.push(`${ROUTES.parentPortal}/fees`)}
            />
            <KpiCard
              label="Upcoming Exams"
              value={String(upcomingExamsCount)}
              sub="in your child's class"
              icon={GraduationCap}
              accent="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
              onClick={() => router.push(`${ROUTES.parentPortal}/exams`)}
            />
            <KpiCard
              label="Homework"
              value={String(homeworkCount)}
              sub="recently assigned"
              icon={BookOpen}
              accent="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
              onClick={() => router.push(`${ROUTES.parentPortal}/homework`)}
            />
          </Div>

          <Div type="row" gap="md" className="flex-col sm:flex-row">
            <UpcomingList
              title="Recent Homework"
              emptyText="No homework assigned recently."
              items={(data?.recentHomework ?? []).map((h) => ({
                id: h.id,
                label: h.title,
                sub: h.due_date ? new Date(h.due_date).toLocaleDateString("en-IN") : "—",
              }))}
            />
            <UpcomingList
              title="Upcoming Exams"
              emptyText="No exams scheduled."
              items={(data?.upcomingExams ?? []).map((e) => ({
                id: e.id,
                label: e.name,
                sub: new Date(e.start_date).toLocaleDateString("en-IN"),
              }))}
            />
            <UpcomingList
              title="Events & Holidays"
              emptyText="Nothing coming up."
              items={(data?.upcomingEvents ?? []).map((e) => ({
                id: e.id,
                label: e.name,
                sub: new Date(e.from_date).toLocaleDateString("en-IN"),
              }))}
            />
          </Div>
        </>
      )}
    </Div>
  );
}
