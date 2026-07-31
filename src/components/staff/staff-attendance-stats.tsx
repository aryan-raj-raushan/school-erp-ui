"use client";

import { Check, X, Save } from "lucide-react";
import { Div, MiniStat, Button, P } from "@/components/ui";

export interface StaffAttendanceStatsProps {
  total: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendancePct: number;
  onMarkAllPresent: () => void;
  onMarkAllAbsent: () => void;
  onSaveAttendance: () => void;
  isSaving?: boolean;
}

/**
 * Attendance summary + quick "mark all" / save actions for the Staff
 * Attendance page. Mirrors StudentAttendanceStats: on mobile everything
 * stays on a single row — compact "T:8 P:3 A:5" stats on the left,
 * icon-only action buttons on the right. From sm+ the stats expand into
 * labeled tiles and actions show text.
 */
export function StaffAttendanceStats({
  total,
  presentCount,
  absentCount,
  lateCount,
  attendancePct,
  onMarkAllPresent,
  onMarkAllAbsent,
  onSaveAttendance,
  isSaving,
}: StaffAttendanceStatsProps) {
  const pctColor = attendancePct >= 75 ? "green" : "red";

  return (
    <Div
      type="row"
      align="center"
      justify="between"
      gap="sm"
      className="rounded-xl border border-border/60 bg-card/40 p-3 sm:p-4"
    >
      {/* Mobile: compact single-line stats */}
      <Div type="row" align="center" gap="sm" className="min-w-0 overflow-x-auto sm:hidden">
        <P size="xs" weight="semibold" noWrap className="shrink-0">T:{total}</P>
        <P size="xs" weight="semibold" color="green" noWrap className="shrink-0">P:{presentCount}</P>
        <P size="xs" weight="semibold" color="red" noWrap className="shrink-0">A:{absentCount}</P>
        <P size="xs" weight="semibold" color="yellow" noWrap className="shrink-0">L:{lateCount}</P>
        <P size="xs" weight="semibold" color={pctColor} noWrap className="shrink-0">Attendance:{attendancePct}%</P>
      </Div>

      {/* sm+: labeled stat tiles */}
      <div className="hidden sm:flex sm:flex-wrap sm:gap-6">
        <MiniStat label="Total" value={total} />
        <MiniStat label="Present" value={presentCount} color="green" />
        <MiniStat label="Absent" value={absentCount} color="red" />
        <MiniStat label="Late" value={lateCount} color="yellow" />
        <MiniStat label="Attendance" value={`${attendancePct}%`} color={pctColor} />
      </div>

      {/* Mobile: icon-only actions */}
      <Div type="row" align="center" gap="xs" className="shrink-0 sm:hidden">
        <Button
          size="icon-xs"
          variant="outline"
          onClick={onMarkAllPresent}
          aria-label="Mark All Present"
          title="Mark All Present"
           className="bg-green-400 text-white"
        >
          P
        </Button>
        <Button
          size="icon-xs"
          variant="outline"
          onClick={onMarkAllAbsent}
          aria-label="Mark All Absent"
          title="Mark All Absent"
          className="bg-red-400 text-white"
        >
         A
        </Button>
        <Button
          size="icon-xs"
          variant="success"
          loading={isSaving}
          onClick={onSaveAttendance}
          aria-label="Save Attendance"
          title="Save Attendance"
        >
          <Save />
        </Button>
      </Div>

      {/* sm+: full text actions */}
      <div className="hidden sm:flex sm:items-center sm:gap-2 sm:shrink-0">
        <Button size="sm" variant="outline" onClick={onMarkAllPresent}>
          Mark All Present
        </Button>
        <Button size="sm" variant="outline" onClick={onMarkAllAbsent}>
          Mark All Absent
        </Button>
        <Button size="sm" variant="success" loading={isSaving} onClick={onSaveAttendance}>
          Save Attendance
        </Button>
      </div>
    </Div>
  );
}
