"use client";

import {
  AttendanceRoster,
  type FilterField,
  type SegmentOption,
} from "@/components/ui";
import type { StaffMember } from "@/services/staff-attendance.service";
import type { StaffAttendanceEntryState } from "@/hooks/useStaffAttendance";
import { ATTENDANCE_MODE_LABEL, formatMarkedTime } from "@/lib/attendance-mode";

type StaffStatus = "PRESENT" | "ABSENT";

const STATUS_OPTIONS: ReadonlyArray<SegmentOption<StaffStatus>> = [
  { value: "PRESENT", label: "Present", tone: "success" },
  { value: "ABSENT", label: "Absent", tone: "danger" },
];

export interface StaffAttendanceMobileProps {
  staff: StaffMember[];
  attendanceMap: Record<string, StaffAttendanceEntryState | undefined>;
  isLoading: boolean;
  isSaving: boolean;
  summary?: string;
  filterFields: FilterField[];
  filterValues: Record<string, string | undefined>;
  onFilterChange: (next: Record<string, string | undefined>) => void;
  onFilterClear: () => void;
  onStatusChange: (staffId: string, status: StaffStatus) => void;
  onLateChange: (staffId: string, isLate: boolean) => void;
  onRemarksChange: (staffId: string, remarks: string) => void;
  onMarkAll: (status: StaffStatus) => void;
  onSave: () => void;
}

export function StaffAttendanceMobile({
  staff,
  attendanceMap,
  onMarkAll,
  ...rest
}: StaffAttendanceMobileProps) {
  const entries = Object.fromEntries(
    Object.entries(attendanceMap).map(([id, entry]) => [
      id,
      entry && { status: entry.status, isLate: entry.is_late, remarks: entry.remarks, locked: !!entry.lockReason },
    ]),
  );
  const count = (status: StaffStatus) =>
    Object.values(attendanceMap).filter((e) => e?.status === status).length;
  const lateCount = Object.values(attendanceMap).filter((e) => e?.is_late).length;

  return (
    <AttendanceRoster
      members={staff.map((s) => ({
        id: s.id,
        marker: s.employee_code,
        name: `${s.first_name} ${s.last_name ?? ""}`.trim(),
        subtitle: [
          s.role?.replace(/_/g, " "),
          attendanceMap[s.id]?.record
            ? `${ATTENDANCE_MODE_LABEL[attendanceMap[s.id]!.record!.mode]} · ${formatMarkedTime(attendanceMap[s.id]!.record!.marked_at)}`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
      }))}
      entries={entries}
      statusOptions={STATUS_OPTIONS}
      stats={[
        { label: "Present", value: count("PRESENT"), tone: "success" },
        { label: "Absent", value: count("ABSENT"), tone: "danger" },
        { label: "Late", value: lateCount, tone: "warning" },
        { label: "Total", value: staff.length },
      ]}
      bulkActions={[
        { label: "All present", status: "PRESENT" },
        { label: "All absent", status: "ABSENT" },
      ]}
      hasSelection
      emptySelectionText=""
      emptyRosterText="No staff found"
      saveLabel="Save attendance"
      filterSheetTitle="Date"
      onBulk={onMarkAll}
      {...rest}
    />
  );
}
