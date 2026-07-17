"use client";

import { Div, MiniStat, Button } from "@/components/ui";

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
 * Attendance summary tiles + quick "mark all" / save actions for the Staff
 * Attendance page. Mirrors StudentAttendanceStats: stat tiles wrap into a
 * responsive grid, actions share the stats' line on sm+ screens, and stack
 * (mark-all pair, then full-width Save) on mobile.
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
  return (
    <Div
      gap="sm"
      className="rounded-xl border border-border/60 bg-card/40 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
    >
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:flex md:flex-wrap md:gap-6">
        <MiniStat label="Total" value={total} />
        <MiniStat label="Present" value={presentCount} color="green" />
        <MiniStat label="Absent" value={absentCount} color="red" />
        <MiniStat label="Late" value={lateCount} color="yellow" />
        <MiniStat
          label="Attendance"
          value={`${attendancePct}%`}
          color={attendancePct >= 75 ? "green" : "red"}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:shrink-0">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button size="sm" variant="outline" onClick={onMarkAllPresent}>
            Mark All Present
          </Button>
          <Button size="sm" variant="outline" onClick={onMarkAllAbsent}>
            Mark All Absent
          </Button>
        </div>
        <Button
          size="sm"
          variant="success"
          loading={isSaving}
          onClick={onSaveAttendance}
          className="w-full sm:w-auto"
        >
          Save Attendance
        </Button>
      </div>
    </Div>
  );
}
