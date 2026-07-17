"use client";

import { Div, MiniStat, Button } from "@/components/ui";
import { STUDENT_ATTENDANCE_PAGE } from "@/constants";

export interface StudentAttendanceStatsProps {
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
 * Attendance summary tiles + quick "mark all" / save actions for the
 * Student Attendance page. Stat tiles wrap into a responsive grid (2 cols
 * on mobile, up to 5 in one row on desktop). On sm+ screens the actions
 * sit on the same line as the stats (right-aligned); on mobile "Mark All
 * Present/Absent" sit side by side with Save Attendance full-width below.
 */
export function StudentAttendanceStats({
  total,
  presentCount,
  absentCount,
  lateCount,
  attendancePct,
  onMarkAllPresent,
  onMarkAllAbsent,
  onSaveAttendance,
  isSaving,
}: StudentAttendanceStatsProps) {
  return (
    <Div
      gap="sm"
      className="rounded-xl border border-border/60 bg-card/40 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
    >
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:flex md:flex-wrap md:gap-6">
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
            {STUDENT_ATTENDANCE_PAGE.markAllPresent}
          </Button>
          <Button size="sm" variant="outline" onClick={onMarkAllAbsent}>
            {STUDENT_ATTENDANCE_PAGE.markAllAbsent}
          </Button>
        </div>
        <Button
          size="sm"
          variant="success"
          loading={isSaving}
          onClick={onSaveAttendance}
          className="w-full sm:w-auto"
        >
          {STUDENT_ATTENDANCE_PAGE.save}
        </Button>
      </div>
    </Div>
  );
}
