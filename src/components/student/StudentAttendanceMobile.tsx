"use client";

import { useState } from "react";
import { CalendarOff, Users } from "lucide-react";
import {
  Badge,
  EmptyState,
  Input,
  MobileFilterBar,
  MobileListSkeleton,
  SegmentedControl,
  StatPill,
  DrawerChevron,
  StickyActionBar,
  Switch,
  Button,
  type FilterField,
  type SegmentOption,
} from "@/components/ui";
import { STUDENT_ATTENDANCE_PAGE } from "@/constants";
import type { AttendanceStatus, Student } from "@/types";

export interface AttendanceEntry {
  status?: AttendanceStatus;
  remarks: string;
  isLate: boolean;
}

const STATUS_OPTIONS: ReadonlyArray<SegmentOption<AttendanceStatus>> = [
  { value: "PRESENT", label: "P", tone: "success" },
  { value: "ABSENT", label: "A", tone: "danger" },
  { value: "LATE", label: "L", tone: "warning" },
  { value: "HALF_DAY", label: "HD", tone: "info" },
];

export interface StudentAttendanceMobileProps {
  students: Student[];
  attendanceMap: Record<string, Partial<AttendanceEntry>>;
  isLoading: boolean;
  isSaving: boolean;
  isHoliday: boolean;
  holidayName?: string;
  hasClassSelected: boolean;
  summary: string;
  filterFields: FilterField[];
  filterValues: Record<string, string | undefined>;
  onFilterChange: (next: Record<string, string | undefined>) => void;
  onFilterClear: () => void;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onLateChange: (studentId: string, isLate: boolean) => void;
  onRemarksChange: (studentId: string, remarks: string) => void;
  onMarkAll: (status: AttendanceStatus) => void;
  onSave: () => void;
}

function StudentRow({
  student,
  entry,
  locked,
  onStatusChange,
  onLateChange,
  onRemarksChange,
}: {
  student: Student;
  entry: Partial<AttendanceEntry>;
  locked: boolean;
  onStatusChange: (status: AttendanceStatus) => void;
  onLateChange: (isLate: boolean) => void;
  onRemarksChange: (remarks: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const name = `${student.first_name} ${student.last_name ?? ""}`.trim();
  const systemLocked =
    entry.status === "LEAVE" || entry.status === "HOLIDAY";

  return (
    <div className="rounded-2xl border border-border/60 bg-white p-3 dark:bg-neutral-900">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold">
          {student.roll_number ?? "–"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {student.admission_number}
          </p>
        </div>
        {!locked && !systemLocked && (
          <button
            type="button"
            aria-label="Late arrival and remarks"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
          >
            <DrawerChevron open={expanded} />
            {(entry.remarks || entry.isLate) && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        )}
      </div>

      {systemLocked ? (
        <Badge variant="info">{entry.status}</Badge>
      ) : (
        <SegmentedControl
          ariaLabel={`Attendance for ${name}`}
          options={STATUS_OPTIONS}
          value={entry.status}
          disabled={locked}
          onChange={onStatusChange}
        />
      )}

      {expanded && !locked && !systemLocked && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border/50 pt-3">
          <label className="flex items-center justify-between text-sm">
            Late arrival
            <Switch
              checked={entry.isLate ?? false}
              onCheckedChange={onLateChange}
            />
          </label>
          <Input
            placeholder="Optional remarks"
            value={entry.remarks ?? ""}
            onChange={(e) => onRemarksChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Phone layout for marking class attendance: stats, bulk actions, one
 * thumb-sized P/A/L/HD control per student and a pinned Save bar.
 */
export function StudentAttendanceMobile({
  students,
  attendanceMap,
  isLoading,
  isSaving,
  isHoliday,
  holidayName,
  hasClassSelected,
  summary,
  filterFields,
  filterValues,
  onFilterChange,
  onFilterClear,
  onStatusChange,
  onLateChange,
  onRemarksChange,
  onMarkAll,
  onSave,
}: StudentAttendanceMobileProps) {
  const count = (status: AttendanceStatus) =>
    Object.values(attendanceMap).filter((e) => e.status === status).length;
  const marked = students.filter((s) => attendanceMap[s.id]?.status).length;

  return (
    <div className="flex flex-col gap-3 pt-3">
      <MobileFilterBar
        fields={filterFields}
        values={filterValues}
        onChange={onFilterChange}
        onClear={onFilterClear}
        sheetTitle="Class, date & session"
      />

      {summary && (
        <p className="px-1 text-sm font-medium text-muted-foreground">
          {summary}
        </p>
      )}

      {isHoliday && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <CalendarOff size={20} className="shrink-0" />
          Holiday{holidayName ? `: ${holidayName}` : ""} — attendance marking is
          disabled for this date.
        </div>
      )}

      {!hasClassSelected ? (
        <EmptyState
          icon={<Users size={28} />}
          title="Choose a class"
          description={STUDENT_ATTENDANCE_PAGE.empty}
        />
      ) : isLoading ? (
        <MobileListSkeleton rows={8} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No students"
          description={STUDENT_ATTENDANCE_PAGE.noStudents}
        />
      ) : (
        <>
          <div className="flex gap-2">
            <StatPill label="Present" value={count("PRESENT")} tone="success" />
            <StatPill label="Absent" value={count("ABSENT")} tone="danger" />
            <StatPill label="Late" value={count("LATE")} tone="warning" />
            <StatPill label="Total" value={students.length} />
          </div>

          {!isHoliday && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onMarkAll("PRESENT")}
              >
                All present
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onMarkAll("ABSENT")}
              >
                All absent
              </Button>
            </div>
          )}

          <ul className="flex flex-col gap-2.5">
            {students.map((student) => (
              <li key={student.id}>
                <StudentRow
                  student={student}
                  entry={attendanceMap[student.id] ?? {}}
                  locked={isHoliday}
                  onStatusChange={(status) => onStatusChange(student.id, status)}
                  onLateChange={(late) => onLateChange(student.id, late)}
                  onRemarksChange={(text) => onRemarksChange(student.id, text)}
                />
              </li>
            ))}
          </ul>

          {!isHoliday && (
            <StickyActionBar>
              <Button
                type="button"
                size="lg"
                variant="success"
                className="flex-1"
                loading={isSaving}
                onClick={onSave}
              >
                {STUDENT_ATTENDANCE_PAGE.save} · {marked}/{students.length}
              </Button>
            </StickyActionBar>
          )}
        </>
      )}
    </div>
  );
}
