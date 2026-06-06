"use client";

import { useAttendance } from "@/hooks/useAttendance";
import {
  STUDENT_ATTENDANCE_PAGE,
  ATTENDANCE_STATUS_OPTIONS,
} from "@/constants";
import {
  Div,
  H1,
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
  Spinner,
  MiniStat,
  FilterLabel,
} from "@/components/ui";

export default function StudentAttendancePage() {
  const {
    years,
    classes,
    // sections,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedClassSectionId,
    selectedClass,
    // selectedSection,
    handleClassChange,
    // handleSectionChange,
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

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H1>{STUDENT_ATTENDANCE_PAGE.title}</H1>
          {selectedClass && (
            <P>
              {selectedClass.display_name} &nbsp;·&nbsp; {date}
            </P>
          )}
        </Div>
        {hasStudents && (
          <Button loading={isSaving} onClick={saveAttendance}>
            {STUDENT_ATTENDANCE_PAGE.save}
          </Button>
        )}
      </Div>

      {/* Filters */}
      <Div variant="card" padding="p-4">
        <Div type="grid" cols={4} gap="md">
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

          {/* <Div type="col" gap="xs">
            <FilterLabel>Section</FilterLabel>
            <Select
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!selectedClassId || isLoadingSections}
            >
              <option value="">Select section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name}
                </option>
              ))}
            </Select>
          </Div> */}

          <Div type="col" gap="xs">
            <FilterLabel>Date</FilterLabel>
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
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>
              {STUDENT_ATTENDANCE_PAGE.table.student}
            </TableHeaderCell>
            <TableHeaderCell>
              {STUDENT_ATTENDANCE_PAGE.table.admissionNo}
            </TableHeaderCell>
            <TableHeaderCell>
              {STUDENT_ATTENDANCE_PAGE.table.rollNo}
            </TableHeaderCell>
            <TableHeaderCell>
              {STUDENT_ATTENDANCE_PAGE.table.status}
            </TableHeaderCell>
            <TableHeaderCell>
              {STUDENT_ATTENDANCE_PAGE.table.isLate}
            </TableHeaderCell>

            <TableHeaderCell>
              {STUDENT_ATTENDANCE_PAGE.table.remarks}
            </TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoadingStudents ? (
            <TableEmptyRow colSpan={7}>
              <Spinner />
            </TableEmptyRow>
          ) : !selectedClassSectionId ? (
            <TableEmptyRow colSpan={7}>
              {STUDENT_ATTENDANCE_PAGE.empty}
            </TableEmptyRow>
          ) : students.length === 0 ? (
            <TableEmptyRow colSpan={7}>
              {STUDENT_ATTENDANCE_PAGE.noStudents}
            </TableEmptyRow>
          ) : (
            students.map((student, i) => {
              const entry = attendanceMap[student.id] ?? {
                // status: "PRESENT",
                remarks: "",
                isLate: false,
              };
              const isAbsent = entry.status === "ABSENT";
              return (
                <TableRow
                  key={student.id}
                  variant={isAbsent ? "danger" : undefined}
                >
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>
                    {student.first_name} {student.last_name ?? ""}
                  </TableCell>
                  <TableCell>{student.admission_number}</TableCell>
                  <TableCell>{student.roll_number ?? "—"}</TableCell>
                  {/* <TableCell>
                    <Select
                      value={entry.status}
                      onChange={(e) =>
                        setStudentStatus(student.id, e.target.value as any)
                      }
                    >
                      {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </TableCell> */}
                  <TableCell>
                    <Div type="row" gap="xs">
                      <Button
                        size="sm"
                        variant={
                          entry.status === "PRESENT" ? "success" : "outline"
                        }
                        onClick={() => setStudentStatus(student.id, "PRESENT")}
                      >
                        P
                      </Button>

                      <Button
                        size="sm"
                        variant={
                          entry.status === "ABSENT" ? "destructive" : "outline"
                        }
                        onClick={() => setStudentStatus(student.id, "ABSENT")}
                      >
                        A
                      </Button>
                    </Div>
                  </TableCell>
                  <TableCell>
                    <TableCell>
                      <Input
                        type="checkbox"
                        checked={entry.isLate}
                        onChange={(e) =>
                          setStudentLate(student.id, e.target.checked)
                        }
                      />
                    </TableCell>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Optional remarks"
                      value={entry.remarks}
                      onChange={(e) =>
                        setStudentRemarks(student.id, e.target.value)
                      }
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
