"use client";

import { useMemo } from "react";
import { useAttendance } from "@/hooks/useAttendance";
import {
  STUDENT_ATTENDANCE_PAGE,
  ATTENDANCE_SESSION_OPTIONS,
} from "@/constants";
import {
  Div,
  P,
  Button,
  Select,
  Input,
  PageHeader,
  PageCol,
  Spinner,
  MiniStat,
  FilterLabel,
  DataTable,
  type ColumnDef,
} from "@/components/ui";

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
    isLoadingSections,
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
            <Input
              type="checkbox"
              checked={entry.isLate ?? false}
              onChange={(e) =>
                setStudentLate(row.original.id, e.target.checked)
              }
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
              className="max-w-xs"
            />
          );
        },
      },
    ],
    [attendanceMap, setStudentStatus, setStudentLate, setStudentRemarks]
  );

  return (
    <PageCol>
      {/* Header */}
      <PageHeader
        title={STUDENT_ATTENDANCE_PAGE.title}
        subtitle={selectedClass ? `${selectedClass.display_name} · ${date}` : undefined}
        actions={
          hasStudents ? (
            <Button loading={isSaving} onClick={saveAttendance}>
              {STUDENT_ATTENDANCE_PAGE.save}
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <Div variant="card" padding="p-4">
        <Div type="grid" cols={3} gap="md">
          <Div type="col" gap="xs">
            <FilterLabel>Academic Year</FilterLabel>
            <Select
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                  {y.is_current ? " (Current)" : ""}
                </option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <FilterLabel>Class</FilterLabel>
            <Select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              disabled={!selectedAcademicYearId || isLoadingClasses}
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name}
                </option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <FilterLabel>Section</FilterLabel>
            <Select
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">Select section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name}
                </option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <FilterLabel>Date</FilterLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Div>

          <Div type="col" gap="xs">
            <FilterLabel>Session</FilterLabel>
            <Select
              value={session}
              onChange={(e) => setSession(e.target.value as typeof session)}
            >
              {ATTENDANCE_SESSION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </Div>
        </Div>
      </Div>

      {/* Holiday Banner */}
      {isHoliday && holidayEvent && (
        <Div variant="inset" type="row" align="center" gap="sm" padding="p-3">
          <P color="yellow">Holiday: {holidayEvent.name} — Attendance marking is disabled for this date.</P>
        </Div>
      )}

      {/* Stats + quick actions */}
      {hasStudents && !isHoliday && (
        <Div type="row" justify="between" align="center">
          <Div type="row" gap="sm">
            <MiniStat label="Total" value={students.length} />
            <MiniStat label="Present" value={presentCount} color="green" />
            <MiniStat label="Absent" value={absentCount} color="red" />
            <MiniStat label="Late" value={lateCount} color="yellow" />
            <MiniStat
              label="Attendance"
              value={`${attendancePct}%`}
              color={attendancePct >= 75 ? "green" : "red"}
            />
          </Div>
          <Div type="row" gap="sm">
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAll("PRESENT")}
            >
              {STUDENT_ATTENDANCE_PAGE.markAllPresent}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAll("ABSENT")}
            >
              {STUDENT_ATTENDANCE_PAGE.markAllAbsent}
            </Button>
          </Div>
        </Div>
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
          <Button loading={isSaving} onClick={saveAttendance}>
            {STUDENT_ATTENDANCE_PAGE.save}
          </Button>
        </Div>
      )}
    </PageCol>
  );
}
