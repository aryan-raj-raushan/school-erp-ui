"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCheck, XCircle, Download } from "lucide-react";
import { useMarkAttendance } from "@/hooks/exam/useExamAttendance";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useExamAttendanceCard } from "@/hooks/exam/useExamAttendanceCard";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  H3,
  P,
  Button,
  Select,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
} from "@/components/ui";
import {
  ATTENDANCE_PAGE,
  EXAM_ROUTES,
  ATTENDANCE_BADGE,
} from "@/constants/exam.constants";
import type { AttendanceStatus } from "@/types/exam.types";
import { useStudents } from "@/hooks/useStudentV2";

type AttendanceRow = {
  student_id: string;
  student_name: string;
  roll_number?: string;
  entries: Record<string, AttendanceStatus>;
};

function MarkAttendanceContent() {
  const router = useRouter();
  const {
    examId,
    setExamId,
    academicYearId,
    setAcademicYearId,
    schedules,
    isLoadingSchedules,
    rows,
    initRows,
    setStatus,
    markAllPresent,
    markAllAbsent,
    isSaving,
    save,
  } = useMarkAttendance();

  const { students } = useStudents();

  const {
    years,
    classes,
    sections,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    handleClassChange,
    handleSectionChange,
    isLoadingClasses,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  const { exams } = useExams(
    selectedAcademicYearId && selectedClassId
      ? { academic_year_id: selectedAcademicYearId, class_id: selectedClassId }
      : {},
  );

  useEffect(() => {
    if (selectedAcademicYearId) setAcademicYearId(selectedAcademicYearId);
  }, [selectedAcademicYearId, setAcademicYearId]);

  useEffect(() => {
    if (!examId || !selectedAcademicYearId || !selectedClassId) return;
    if (isLoadingSchedules || schedules.length === 0) return;
    initRows(students);
  }, [examId, selectedAcademicYearId, selectedClassId, selectedSectionId, schedules, isLoadingSchedules]);

  const { attendanceCardUrl } = useExamAttendanceCard({
    examId,
    classId: selectedClassId,
    academicYearId,
    sectionId: selectedSectionId,
  });

  // Dynamic columns for each schedule
  const columns = useMemo<ColumnDef<AttendanceRow>[]>(() => {
    const baseCols: ColumnDef<AttendanceRow>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "roll_number",
        header: "Roll No.",
        cell: ({ row }) => row.original.roll_number ?? "—",
      },
      {
        accessorKey: "student_name",
        header: "Student",
        meta: { primary: true },
      },
    ];

    const scheduleCols = schedules.map(
      (sc): ColumnDef<AttendanceRow> => ({
        id: `schedule-${sc.id}`,
        header: () => (
          <Div type="col" gap="xs" align="center">
            <Div className="truncate max-w-[120px] block text-xs font-medium">
              {sc.subject_name}
            </Div>
            {sc.subject_type && sc.subject_type !== "MAIN_EXAM" && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 capitalize">
                {sc.subject_type.replace(/_/g, " ").toLowerCase()}
              </Badge>
            )}
            {sc.section_name && (
              <Div className="text-[10px] font-normal text-muted-foreground/60">
                Sec {sc.section_name}
              </Div>
            )}
            <Div className="text-xs font-normal text-muted-foreground/70">
              {sc.exam_date}
            </Div>
          </Div>
        ),
        cell: ({ row }) => {
          const status = row.original.entries[sc.id] ?? "ABSENT";
          return (
            <Div type="col" gap="xs" align="center">
              <Badge variant={ATTENDANCE_BADGE[status]} className="text-xs mb-1">
                {status}
              </Badge>
              <Select
                width="sm"
                value={status}
                onChange={(e) =>
                  setStatus(row.original.student_id, sc.id, e.target.value as AttendanceStatus)
                }
                className="text-xs"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LEAVE">Leave</option>
              </Select>
            </Div>
          );
        },
      })
    );

    return [...baseCols, ...scheduleCols];
  }, [schedules, setStatus]);

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title="Mark Exam Attendance"
        subtitle="Bulk mark attendance for all students across all exam schedules"
        actions={
          <Div type="row" gap="sm">
            {attendanceCardUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(attendanceCardUrl, "_blank")}
              >
                <Download size={14} /> {ATTENDANCE_PAGE.buttons.downloadCard}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(EXAM_ROUTES.attendance.list)}
            >
              <ArrowLeft size={14} /> {ATTENDANCE_PAGE.buttons.back}
            </Button>
          </Div>
        }
      />

      {/* Selectors */}
      <Div variant="card" className="p-5">
        <Div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Academic Year */}
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs font-medium">
              {ATTENDANCE_PAGE.labels.academicYear}
            </P>
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

          {/* Class */}
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs font-medium">
              {ATTENDANCE_PAGE.labels.class}
            </P>
            <Select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              disabled={!selectedAcademicYearId || isLoadingClasses}
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Div>

          {/* Section */}
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs font-medium">
              {ATTENDANCE_PAGE.labels.section}
            </P>
            <Select
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Div>

          {/* Exam */}
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs font-medium">
              {ATTENDANCE_PAGE.labels.exam}
            </P>
            <Select
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">Select exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.exam_name}
                </option>
              ))}
            </Select>
          </Div>
        </Div>
      </Div>

      {/* Attendance grid */}
      {examId && (
        <>
          {isLoadingSchedules ? (
            <Div type="row" justify="center" className="py-10">
              <Spinner size="lg" />
            </Div>
          ) : schedules.length === 0 ? (
            <Div variant="card-dashed">
              <P color="muted">No exam schedules found for this exam.</P>
            </Div>
          ) : (
            <>
              {/* Bulk actions */}
              <Div type="row" gap="sm" align="center">
                <H3 color="default" className="text-sm">
                  Quick Actions:
                </H3>
                <Button size="sm" variant="outline" onClick={markAllPresent}>
                  <CheckCheck size={14} className="text-emerald-500" />
                  {ATTENDANCE_PAGE.labels.markAll}
                </Button>
                <Button size="sm" variant="outline" onClick={markAllAbsent}>
                  <XCircle size={14} className="text-destructive" />
                  {ATTENDANCE_PAGE.labels.markAllAbsent}
                </Button>
              </Div>

              {/* DataTable with dynamic schedule columns */}
              {rows.length === 0 ? (
                <Div
                  type="col"
                  gap="sm"
                  align="center"
                  className="rounded-xl border border-dashed border-border py-16 text-center"
                >
                  <P color="muted">Load students by selecting a class above</P>
                </Div>
              ) : (
                <DataTable
                  columns={columns}
                  data={rows}
                  emptyText="No students found"
                />
              )}

              {rows.length > 0 && (
                <Div type="row" gap="md">
                  <Button
                    variant="outline"
                    onClick={() => router.push(EXAM_ROUTES.attendance.list)}
                  >
                    {ATTENDANCE_PAGE.buttons.cancel}
                  </Button>
                  <Button loading={isSaving} onClick={save}>
                    <Save size={14} /> {ATTENDANCE_PAGE.buttons.save}
                  </Button>
                </Div>
              )}
            </>
          )}
        </>
      )}
    </Div>
  );
}

export default function AttendanceMarkPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <MarkAttendanceContent />
    </Suspense>
  );
}
