"use client";

import { Div, H1, H2, P, Badge, Spinner, EmptyState } from "@/components/ui";
import { CalendarCheck } from "lucide-react";
import { useParentAttendance } from "@/hooks/useParentAttendance";
const STATUS_VARIANT: Partial<Record<string, "success" | "danger" | "warning" | "default">> = {
  PRESENT: "success",
  ABSENT: "danger",
  LATE: "warning",
  HALF_DAY: "warning",
  EXCUSED: "default",
  LEAVE: "default",
  HOLIDAY: "default",
  MISSING_PUNCH: "warning",
};

export default function ParentAttendancePage() {
  const { summary, history, isLoading, error } = useParentAttendance();

  if (isLoading) {
    return (
      <Div type="row" align="center" justify="center" className="py-16">
        <Spinner />
      </Div>
    );
  }

  if (error) {
    return (
      <Div className="p-4 sm:p-6">
        <Badge variant="danger">{error}</Badge>
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Attendance</H1>

      <Div type="grid" gap="md" className="grid-cols-2 sm:grid-cols-4">
        <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4">
          <P color="muted" className="text-xs">Attendance %</P>
          <H1 className="text-2xl font-bold">{summary?.attendancePercent ?? 0}%</H1>
        </Div>
        <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4">
          <P color="muted" className="text-xs">Present</P>
          <H1 className="text-2xl font-bold">{summary?.totalPresent ?? 0}</H1>
        </Div>
        <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4">
          <P color="muted" className="text-xs">Absent</P>
          <H1 className="text-2xl font-bold">{summary?.totalAbsent ?? 0}</H1>
        </Div>
        <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4">
          <P color="muted" className="text-xs">Total Days</P>
          <H1 className="text-2xl font-bold">{summary?.totalDays ?? 0}</H1>
        </Div>
      </Div>

      <Div type="col" gap="sm">
        <H2 className="text-sm font-semibold">History</H2>
        {history.length === 0 ? (
          <EmptyState icon={<CalendarCheck size={28} />} title="No attendance records yet" />
        ) : (
          <Div type="col" gap="xs">
            {history.map((r) => (
              <Div key={r.id} type="row" justify="between" align="center" className="rounded-lg border border-border bg-card px-4 py-3">
                <P className="text-sm font-medium">
                  {new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </P>
                <Div type="row" align="center" gap="sm">
                  {r.is_late && <Badge variant="warning">Late</Badge>}
                  <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{r.status}</Badge>
                </Div>
              </Div>
            ))}
          </Div>
        )}
      </Div>
    </Div>
  );
}
