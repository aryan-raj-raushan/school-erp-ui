"use client";

import { useMemo } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import {
  STUDENT_ATTENDANCE_PAGE,
  ATTENDANCE_SESSION_OPTIONS,
  type AttendanceSession,
} from "@/constants";
import { StudentAttendanceStats } from "@/components/student/student-attendance-stats";
import {
  Div,
  P,
  Button,
  Input,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  DataTable,
  FilterToolbar,
  type FilterField,
  DatePicker,
  Switch,
  type ColumnDef,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";

type StudentAttendanceRow = {
  id: string;
  first_name: string;
  last_name?: string;
  admission_number: string;
  roll_number?: string;
  status?: string;
  isLate?: boolean;
  remarks?: string;
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function StudentAttendancePage() {
  const {
    years,
    classes,
    sections,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    selectedClassSectionId,
    selectedClass,
    handleClassChange,
    handleSectionChange,
    date,
    setDate,
    students,
    attendanceMap,
    isLoadingClasses,
    isLoadingStudents,
    isSaving,
    setStudentStatus,
    setStudentRemarks,
    markAll,
    saveAttendance,
    setStudentLate,
    session,
    setSession,
    holidayEvent,
    isHoliday,
  } = useAttendance();

  const hasStudents = students.length > 0;
  const presentCount = Object.values(attendanceMap).filter(
    (v) => v.status === "PRESENT",
  ).length;
  const absentCount = Object.values(attendanceMap).filter(
    (v) => v.status === "ABSENT",
  ).length;
  const lateCount = Object.values(attendanceMap).filter(
    (v) => v.status === "LATE",
  ).length;
  const attendancePct = hasStudents
    ? Math.round((presentCount / students.length) * 100)
    : 0;

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ("academic_year_id" in next) setSelectedAcademicYearId(next.academic_year_id ?? "");
    if ("class_id" in next) handleClassChange(next.class_id ?? "");
    if ("section_id" in next) handleSectionChange(next.section_id ?? "");
    if ("session" in next && next.session) setSession(next.session as AttendanceSession);
  }

  function handleClearFilters() {
    setSelectedAcademicYearId("");
    handleClassChange("");
    setDate(todayISO());
    setSession("MORNING");
  }

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: "Select year",
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
        resetKeys: ["class_id", "section_id"],
      },
      {
        type: "select",
        key: "class_id",
        label: "Class",
        placeholder: "Select class",
        options: classes.map((c) => ({ value: c.id, label: c.display_name })),
        disabled: !selectedAcademicYearId || isLoadingClasses,
        resetKeys: ["section_id"],
      },
      {
        type: "select",
        key: "section_id",
        label: "Section",
        placeholder: "Select section",
        options: sections.map((s) => ({ value: s.id, label: `Section ${s.name}` })),
        disabled: !selectedClassId,
      },
      {
        type: "custom",
        key: "date",
        label: "Date",
        chipLabel: date ? formatDate(date) : undefined,
        render: () => (
          <DatePicker value={date} onChange={setDate} size="compact" className="w-40" />
        ),
      },
      {
        type: "select",
        key: "session",
        label: "Session",
        placeholder: "Select session",
        options: ATTENDANCE_SESSION_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
      },
    ],
    [years, classes, sections, selectedAcademicYearId, selectedClassId, isLoadingClasses, date, setDate],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: selectedAcademicYearId,
    class_id: selectedClassId,
    section_id: selectedSectionId,
    date,
    session,
  };

  const pageHeaderConfig: PageHeaderConfig = {
    title: STUDENT_ATTENDANCE_PAGE.title,
    subtitle: selectedClass ? `${selectedClass.display_name} · ${formatDate(date)}` : undefined,
  };

  const columns = useMemo<ColumnDef<StudentAttendanceRow>[]>(
    () => [
      {
        id: "index",
        header: "#",
        size: 48,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "first_name",
        header: STUDENT_ATTENDANCE_PAGE.table.student,
        size: 200,
        meta: { primary: true },
        cell: ({ row }) =>
          `${row.original.first_name} ${row.original.last_name ?? ""}`,
      },
      {
        accessorKey: "admission_number",
        header: STUDENT_ATTENDANCE_PAGE.table.admissionNo,
        size: 140,
      },
      {
        accessorKey: "roll_number",
        header: STUDENT_ATTENDANCE_PAGE.table.rollNo,
        size: 100,
        cell: ({ row }) => row.original.roll_number ?? "—",
      },
      {
        id: "status",
        header: STUDENT_ATTENDANCE_PAGE.table.status,
        size: 120,
        cell: ({ row }) => {
          const entry = attendanceMap[row.original.id] ?? {};
          const readOnly = isHoliday || entry.status === 'LEAVE' || entry.status === 'HOLIDAY';
          return (
            <Div type="row" gap="xs">
              <Button size="sm" variant={entry.status === "PRESENT" ? "success" : "outline"} disabled={readOnly} onClick={() => setStudentStatus(row.original.id, "PRESENT")}>P</Button>
              <Button size="sm" variant={entry.status === "ABSENT" ? "destructive" : "outline"} disabled={readOnly} onClick={() => setStudentStatus(row.original.id, "ABSENT")}>A</Button>
              <Button size="sm" variant={entry.status === "LATE" ? "secondary" : "outline"} disabled={readOnly} onClick={() => setStudentStatus(row.original.id, "LATE")}>L</Button>
              <Button size="sm" variant={entry.status === "HALF_DAY" ? "secondary" : "outline"} disabled={readOnly} onClick={() => setStudentStatus(row.original.id, "HALF_DAY")}>HD</Button>
            </Div>
          );
        },
      },
      {
        id: "isLate",
        header: STUDENT_ATTENDANCE_PAGE.table.isLate,
        size: 72,
        cell: ({ row }) => {
          const entry = attendanceMap[row.original.id] ?? {};
          return (
            <Switch
              checked={entry.isLate ?? false}
              onCheckedChange={(checked) => setStudentLate(row.original.id, checked)}
            />
          );
        },
      },
      {
        id: "remarks",
        header: STUDENT_ATTENDANCE_PAGE.table.remarks,
        cell: ({ row }) => {
          const entry = attendanceMap[row.original.id] ?? {};
          return (
            <Input
              placeholder="Optional remarks"
              value={entry.remarks ?? ""}
              onChange={(e) =>
                setStudentRemarks(row.original.id, e.target.value)
              }
              className="h-8 max-w-xs border-transparent bg-muted/40 text-xs placeholder:text-muted-foreground/70 hover:bg-muted/60 focus:border-input focus:bg-background"
            />
          );
        },
      },
    ],
    [attendanceMap, isHoliday, setStudentStatus, setStudentLate, setStudentRemarks]
  );

  return (
    <PageCol>
      {/* Header */}
      <PageHeader sticky {...pageHeaderConfig} />

      {/* Filters */}
        <FilterToolbar
          fields={filterFields}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          sheetTitle="Filter Attendance"
        />

      {/* Holiday Banner */}
      {isHoliday && holidayEvent && (
        <Div variant="inset" type="row" align="center" gap="sm" padding="p-3">
          <P color="yellow">Holiday: {holidayEvent.name} — Attendance marking is disabled for this date.</P>
        </Div>
      )}

      {/* Stats + quick actions */}
      {hasStudents && !isHoliday && (
        <StudentAttendanceStats
          total={students.length}
          presentCount={presentCount}
          absentCount={absentCount}
          lateCount={lateCount}
          attendancePct={attendancePct}
          onMarkAllPresent={() => markAll("PRESENT")}
          onMarkAllAbsent={() => markAll("ABSENT")}
          onSaveAttendance={saveAttendance}
          isSaving={isSaving}
        />
      )}

      {/* Attendance table */}
      {!selectedClassSectionId ? (
        <Div
          type="col"
          gap="sm"
          align="center"
          className="rounded-xl border border-dashed border-border py-16 text-center"
        >
          <P color="muted">{STUDENT_ATTENDANCE_PAGE.empty}</P>
        </Div>
      ) : students.length === 0 ? (
        <Div
          type="col"
          gap="sm"
          align="center"
          className="rounded-xl border border-dashed border-border py-16 text-center"
        >
          <P color="muted">{STUDENT_ATTENDANCE_PAGE.noStudents}</P>
        </Div>
      ) : (
        <DataTable
          columns={columns}
          data={students.map(s => ({
            ...s,
            last_name: s.last_name ?? undefined,
            roll_number: s.roll_number ?? undefined,
          }))}
          isLoading={isLoadingStudents}
          emptyText={STUDENT_ATTENDANCE_PAGE.noStudents}
        />
      )}

      {hasStudents && !isHoliday && (
        <Div type="row" justify="end">
          <Button loading={isSaving} onClick={saveAttendance} variant="success">
            {STUDENT_ATTENDANCE_PAGE.save}
          </Button>
        </Div>
      )}
    </PageCol>
  );
}
