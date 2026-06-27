"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCheck, XCircle, Download } from "lucide-react";
import { useMarkAttendance, type AttendanceSource } from "@/hooks/exam/useExamAttendance";
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
  Spinner,
} from "@/components/ui";
import { ATTENDANCE_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";
import type { AttendanceStatus } from "@/types/exam.types";
import { useStudents } from "@/hooks/useStudentV2";

// ── Status pill — click cycles P → A → L ─────────────────────────────────────

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  ABSENT: "bg-red-100 text-red-700 hover:bg-red-200",
  LATE: "bg-amber-100 text-amber-700 hover:bg-amber-200",
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "P",
  ABSENT: "A",
  LATE: "L",
};

function AttendanceCell({
  status,
  source,
  onClick,
}: {
  status: AttendanceStatus;
  source: AttendanceSource;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${status}${source === "rfid-auto" ? " (RFID)" : ""} — click to change`}
      className={`relative w-10 h-8 rounded-md text-xs font-semibold transition-colors ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABEL[status]}
      {source === "rfid-auto" && (
        <span className="absolute -top-1.5 -right-1.5 text-[9px] leading-none">
          📡
        </span>
      )}
    </button>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Main Component ────────────────────────────────────────────────────────────

function MarkAttendanceContent() {
  const router = useRouter();
  const {
    examId,
    setExamId,
    academicYearId,
    setAcademicYearId,
    availableDates,
    isLoadingSchedules,
    rows,
    initRows,
    cycleStatus,
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
      : {}
  );

  useEffect(() => {
    if (selectedAcademicYearId) setAcademicYearId(selectedAcademicYearId);
  }, [selectedAcademicYearId, setAcademicYearId]);

  useEffect(() => {
    if (!examId || !selectedAcademicYearId || !selectedClassId) return;
    if (isLoadingSchedules || availableDates.length === 0) return;
    initRows(students);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, selectedAcademicYearId, selectedClassId, selectedSectionId, availableDates, isLoadingSchedules]);

  const { attendanceCardUrl } = useExamAttendanceCard({
    examId,
    classId: selectedClassId,
    academicYearId,
    sectionId: selectedSectionId,
  });

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title="Mark Exam Attendance"
        subtitle="Click any cell to cycle: Present → Absent → Late. 📡 = RFID auto-marked."
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

      {/* Filters */}
      <Div variant="card" className="p-5">
        <Div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Grid */}
      {examId && (
        <>
          {isLoadingSchedules ? (
            <Div type="row" justify="center" className="py-10">
              <Spinner size="lg" />
            </Div>
          ) : availableDates.length === 0 ? (
            <Div variant="card-dashed">
              <P color="muted">No exam schedules found for this exam.</P>
            </Div>
          ) : (
            <>
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

              <Div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground w-10">
                        #
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground w-20">
                        Roll
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground min-w-[150px]">
                        Student
                      </th>
                      {availableDates.map((date) => (
                        <th
                          key={date}
                          className="px-3 py-3 text-center font-medium text-muted-foreground w-20"
                        >
                          {fmtDate(date)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3 + availableDates.length}
                          className="px-4 py-12 text-center text-muted-foreground"
                        >
                          Select a class to load students
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, i) => (
                        <tr
                          key={row.student_id}
                          className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {row.roll_number ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {row.student_name}
                          </td>
                          {availableDates.map((date) => {
                            const entry = row.entries[date] ?? {
                              status: "PRESENT" as AttendanceStatus,
                              source: "manual" as AttendanceSource,
                            };
                            return (
                              <td key={date} className="px-3 py-2 text-center">
                                <Div type="row" justify="center">
                                  <AttendanceCell
                                    status={entry.status}
                                    source={entry.source}
                                    onClick={() =>
                                      cycleStatus(row.student_id, date)
                                    }
                                  />
                                </Div>
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Div>

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
