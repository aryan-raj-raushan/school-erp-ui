"use client";

import {
  AttendanceRoster,
  type FilterField,
  type RosterEntry,
  type SegmentOption,
} from "@/components/ui";
import { STUDENT_ATTENDANCE_PAGE } from "@/constants";
import type { AttendanceStatus, Student } from "@/types";

const STATUS_OPTIONS: ReadonlyArray<SegmentOption<AttendanceStatus>> = [
  { value: "PRESENT", label: "P", tone: "success" },
  { value: "ABSENT", label: "A", tone: "danger" },
  { value: "LATE", label: "L", tone: "warning" },
  { value: "HALF_DAY", label: "HD", tone: "info" },
];

const SYSTEM_STATUSES = ["LEAVE", "HOLIDAY"];

export interface StudentAttendanceMobileProps {
  students: Student[];
  attendanceMap: Record<string, RosterEntry<AttendanceStatus> | undefined>;
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

export function StudentAttendanceMobile({
  students,
  attendanceMap,
  holidayName,
  isHoliday,
  hasClassSelected,
  onMarkAll,
  ...rest
}: StudentAttendanceMobileProps) {
  const count = (status: AttendanceStatus) =>
    Object.values(attendanceMap).filter((e) => e?.status === status).length;

  return (
    <AttendanceRoster
      members={students.map((s) => ({
        id: s.id,
        marker: s.roll_number,
        name: `${s.first_name} ${s.last_name ?? ""}`.trim(),
        subtitle: s.admission_number,
      }))}
      entries={attendanceMap}
      statusOptions={STATUS_OPTIONS}
      lockedStatuses={SYSTEM_STATUSES}
      stats={[
        { label: "Present", value: count("PRESENT"), tone: "success" },
        { label: "Absent", value: count("ABSENT"), tone: "danger" },
        { label: "Late", value: count("LATE"), tone: "warning" },
        { label: "Total", value: students.length },
      ]}
      bulkActions={[
        { label: "All present", status: "PRESENT" },
        { label: "All absent", status: "ABSENT" },
      ]}
      isLocked={isHoliday}
      lockedMessage={`Holiday${holidayName ? `: ${holidayName}` : ""} — attendance marking is disabled for this date.`}
      hasSelection={hasClassSelected}
      emptySelectionText={STUDENT_ATTENDANCE_PAGE.empty}
      emptyRosterText={STUDENT_ATTENDANCE_PAGE.noStudents}
      saveLabel={STUDENT_ATTENDANCE_PAGE.save}
      filterSheetTitle="Class, date & session"
      onBulk={onMarkAll}
      {...rest}
    />
  );
}
