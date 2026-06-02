"use client";

import { useAttendance } from "@/hooks/useAttendance";
import {
  STUDENT_ATTENDANCE_PAGE,
  ATTENDANCE_STATUS_OPTIONS,
  ATTENDANCE_STATUS_BADGE,
} from "@/constants";
import {
  Div,
  H1,
  H2,
  P,
  Button,
  Select,
  Input,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  Badge,
  Spinner,
} from "@/components/ui";

export default function StudentAttendancePage() {
  const {
    years,
    classes,
    sections,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    selectedClass,
    selectedSection,
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
  } = useAttendance();

  const hasStudents = students.length > 0;
  const presentCount = Object.values(attendanceMap).filter((v) => v.status === "PRESENT").length;
  const absentCount = Object.values(attendanceMap).filter((v) => v.status === "ABSENT").length;
  const lateCount = Object.values(attendanceMap).filter((v) => v.status === "LATE").length;
  const attendancePct = hasStudents ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H1>{STUDENT_ATTENDANCE_PAGE.title}</H1>
          {selectedClass && selectedSection && (
            <P>
              {selectedClass.name} — Section {selectedSection.name} &nbsp;·&nbsp; {date}
            </P>
          )}
        </Div>
        {hasStudents && (
          <Button loading={isSaving} onClick={saveAttendance}>
            {STUDENT_ATTENDANCE_PAGE.save}
          </Button>
        )}
      </Div>

      {/* Filters — academic year → class → section → date */}
      <Div className="rounded-xl border border-border bg-card p-4">
        <Div type="grid" cols={4} gap="md">
          <Div type="col" gap="xs">
            <P className="text-xs font-medium text-muted-foreground">Academic Year</P>
            <Select
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}{y.is_current ? " (Current)" : ""}
                </option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <P className="text-xs font-medium text-muted-foreground">Class</P>
            <Select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              disabled={!selectedAcademicYearId || isLoadingClasses}
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <P className="text-xs font-medium text-muted-foreground">Section</P>
            <Select
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!selectedClassId || isLoadingSections}
            >
              <option value="">Select section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <P className="text-xs font-medium text-muted-foreground">Date</P>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Div>
        </Div>
      </Div>

      {/* Stats + quick actions */}
      {hasStudents && (
        <Div type="row" justify="between" align="center">
          <Div type="row" gap="sm">
            <Div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
              <P className="text-xs text-muted-foreground">Total</P>
              <H2>{students.length}</H2>
            </Div>
            <Div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 px-4 py-2 text-center">
              <P className="text-xs text-green-600">Present</P>
              <H2 className="text-green-600">{presentCount}</H2>
            </Div>
            <Div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-2 text-center">
              <P className="text-xs text-red-600">Absent</P>
              <H2 className="text-red-600">{absentCount}</H2>
            </Div>
            <Div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-2 text-center">
              <P className="text-xs text-yellow-600">Late</P>
              <H2 className="text-yellow-600">{lateCount}</H2>
            </Div>
            <Div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
              <P className="text-xs text-muted-foreground">Attendance</P>
              <H2 className={attendancePct >= 75 ? "text-green-600" : "text-red-600"}>
                {attendancePct}%
              </H2>
            </Div>
          </Div>
          <Div type="row" gap="sm">
            <Button size="sm" variant="outline" onClick={() => markAll("PRESENT")}>
              {STUDENT_ATTENDANCE_PAGE.markAllPresent}
            </Button>
            <Button size="sm" variant="outline" onClick={() => markAll("ABSENT")}>
              {STUDENT_ATTENDANCE_PAGE.markAllAbsent}
            </Button>
          </Div>
        </Div>
      )}

      {/* Attendance table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>{STUDENT_ATTENDANCE_PAGE.table.student}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_ATTENDANCE_PAGE.table.admissionNo}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_ATTENDANCE_PAGE.table.rollNo}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_ATTENDANCE_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_ATTENDANCE_PAGE.table.remarks}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoadingStudents ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : !selectedSectionId ? (
            <TableEmptyRow colSpan={6}>
              {STUDENT_ATTENDANCE_PAGE.empty}
            </TableEmptyRow>
          ) : students.length === 0 ? (
            <TableEmptyRow colSpan={6}>
              {STUDENT_ATTENDANCE_PAGE.noStudents}
            </TableEmptyRow>
          ) : (
            students.map((student, i) => {
              const entry = attendanceMap[student.id] ?? { status: "PRESENT", remarks: "" };
              const isAbsent = entry.status === "ABSENT";
              return (
                <TableRow
                  key={student.id}
                  className={isAbsent ? "bg-red-50/50 dark:bg-red-950/10" : undefined}
                >
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>
                    {student.first_name} {student.last_name ?? ""}
                  </TableCell>
                  <TableCell>{student.admission_number}</TableCell>
                  <TableCell>{student.roll_number ?? "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={entry.status}
                      onChange={(e) => setStudentStatus(student.id, e.target.value as any)}
                    >
                      {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Optional remarks"
                      value={entry.remarks}
                      onChange={(e) => setStudentRemarks(student.id, e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {hasStudents && (
        <Div type="row" justify="end">
          <Button loading={isSaving} onClick={saveAttendance}>
            {STUDENT_ATTENDANCE_PAGE.save}
          </Button>
        </Div>
      )}
    </Div>
  );
}
