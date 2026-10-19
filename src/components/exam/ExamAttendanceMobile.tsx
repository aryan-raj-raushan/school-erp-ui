"use client";

import { CheckCheck, Download, Radio, Save, XCircle } from "lucide-react";
import {
  Button,
  EmptyState,
  MobileSelectField,
  SegmentedControl,
  Spinner,
  StickyActionBar,
  type SegmentOption,
} from "@/components/ui";
import { ATTENDANCE_PAGE } from "@/constants/exam.constants";
import type { AttendanceSource } from "@/hooks/exam/useExamAttendance";
import type { AttendanceStatus } from "@/types/exam.types";

const STATUS_OPTIONS: ReadonlyArray<SegmentOption<AttendanceStatus>> = [
  { value: "PRESENT", label: "P", tone: "success" },
  { value: "ABSENT", label: "A", tone: "danger" },
  { value: "LATE", label: "L", tone: "warning" },
];

export interface ExamAttendanceRow {
  student_id: string;
  student_name: string;
  roll_number?: string;
  entries: Record<string, { status: AttendanceStatus; source: AttendanceSource }>;
}

interface Option {
  id: string;
  name: string;
  is_current?: boolean;
}

interface ExamOption {
  id: string;
  exam_name: string;
  is_published?: boolean;
  status?: string;
}

interface ScheduleOption {
  id: string;
  subject_name: string;
  exam_date: string;
}

export interface ExamAttendanceMobileProps {
  years: ReadonlyArray<Option>;
  classes: ReadonlyArray<Option>;
  sections: ReadonlyArray<Option>;
  exams: ReadonlyArray<ExamOption>;
  academicYearId: string;
  classId: string;
  sectionId: string;
  examId: string;
  onYearChange: (id: string) => void;
  onClassChange: (id: string) => void;
  onSectionChange: (id: string) => void;
  onExamChange: (id: string) => void;
  isLoadingClasses: boolean;

  schedules: ReadonlyArray<ScheduleOption>;
  isLoadingSchedules: boolean;
  rows: ReadonlyArray<ExamAttendanceRow>;
  canMarkAttendance: boolean;
  selectedExam?: ExamOption;

  /** Omit for read-only (view) mode. */
  onSetStatus?: (studentId: string, scheduleId: string, status: AttendanceStatus) => void;
  onMarkAllPresent?: () => void;
  onMarkAllAbsent?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  onCancel?: () => void;

  canDownloadCard?: boolean;
  isDownloadingCard?: boolean;
  onDownloadCard?: () => void;
}

function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ExamAttendanceMobile({
  years,
  classes,
  sections,
  exams,
  academicYearId,
  classId,
  sectionId,
  examId,
  onYearChange,
  onClassChange,
  onSectionChange,
  onExamChange,
  isLoadingClasses,
  schedules,
  isLoadingSchedules,
  rows,
  canMarkAttendance,
  selectedExam,
  onSetStatus,
  onMarkAllPresent,
  onMarkAllAbsent,
  onSave,
  isSaving,
  onCancel,
  canDownloadCard,
  isDownloadingCard,
  onDownloadCard,
}: ExamAttendanceMobileProps) {
  const editable = Boolean(onSetStatus);

  return (
    <div className="flex flex-col gap-3 pt-3">
      <section className="grid grid-cols-2 gap-2">
        <MobileSelectField
          label={ATTENDANCE_PAGE.labels.academicYear}
          placeholder="Select year"
          value={academicYearId}
          onChange={onYearChange}
          options={years.map((y) => ({
            value: y.id,
            label: `${y.name}${y.is_current ? " (Current)" : ""}`,
          }))}
        />
        <MobileSelectField
          label={ATTENDANCE_PAGE.labels.class}
          placeholder="Select class"
          disabled={!academicYearId || isLoadingClasses}
          value={classId}
          onChange={onClassChange}
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
        />
        <MobileSelectField
          label={ATTENDANCE_PAGE.labels.section}
          placeholder="All sections"
          disabled={!classId}
          value={sectionId}
          onChange={onSectionChange}
          options={sections.map((s) => ({ value: s.id, label: s.name }))}
        />
        <MobileSelectField
          label={ATTENDANCE_PAGE.labels.exam}
          placeholder="Select exam"
          disabled={!classId}
          value={examId}
          onChange={onExamChange}
          options={exams.map((e) => ({
            value: e.id,
            label: `${e.exam_name}${e.is_published ? "" : ` (${e.status} — not published)`}`,
          }))}
        />
      </section>

      {!examId ? (
        <EmptyState
          title="Pick an exam"
          description="Choose the year, class and exam to see its attendance."
        />
      ) : !canMarkAttendance ? (
        <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          Attendance can only be marked once “{selectedExam?.exam_name}” is published (currently{" "}
          {selectedExam?.status}).
        </p>
      ) : isLoadingSchedules ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : schedules.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          No exam schedules found for this exam.
        </p>
      ) : rows.length === 0 ? (
        <EmptyState title="No students" description="Select a class to load its students." />
      ) : (
        <>
          {editable && (
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={onMarkAllPresent}>
                <CheckCheck size={16} className="text-emerald-500" /> {ATTENDANCE_PAGE.labels.markAll}
              </Button>
              <Button type="button" variant="outline" onClick={onMarkAllAbsent}>
                <XCircle size={16} className="text-destructive" /> {ATTENDANCE_PAGE.labels.markAllAbsent}
              </Button>
            </div>
          )}
          {canDownloadCard && (
            <Button
              type="button"
              variant="outline"
              loading={isDownloadingCard}
              onClick={onDownloadCard}
            >
              <Download size={16} /> {ATTENDANCE_PAGE.buttons.downloadCard}
            </Button>
          )}

          <ul className="flex flex-col gap-2.5">
            {rows.map((row, index) => (
              <li
                key={row.student_id}
                className="rounded-2xl border border-border/60 bg-white p-4 dark:bg-neutral-900"
              >
                <p className="text-[15px] font-semibold">
                  {row.student_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  #{index + 1}
                  {row.roll_number ? ` · Roll ${row.roll_number}` : ""}
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  {schedules.map((schedule) => {
                    const entry = row.entries[schedule.id] ?? {
                      // Unmarked students count as present while marking, absent when viewing.
                      status: (editable ? "PRESENT" : "ABSENT") as AttendanceStatus,
                      source: "manual" as AttendanceSource,
                    };
                    return (
                      <div key={schedule.id}>
                        <p className="mb-1 flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                          {schedule.subject_name} · {shortDate(schedule.exam_date)}
                          {entry.source === "rfid-auto" && <Radio size={12} aria-label="RFID" />}
                        </p>
                        <SegmentedControl<AttendanceStatus>
                          ariaLabel={`${row.student_name} – ${schedule.subject_name}`}
                          value={entry.status}
                          disabled={!editable}
                          onChange={(status) => onSetStatus?.(row.student_id, schedule.id, status)}
                          options={STATUS_OPTIONS}
                        />
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>

          {editable && (
            <StickyActionBar>
              {onCancel && (
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onCancel}>
                  {ATTENDANCE_PAGE.buttons.cancel}
                </Button>
              )}
              <Button type="button" size="lg" className="flex-[2]" loading={isSaving} onClick={onSave}>
                <Save size={16} /> {ATTENDANCE_PAGE.buttons.save}
              </Button>
            </StickyActionBar>
          )}
        </>
      )}
    </div>
  );
}
