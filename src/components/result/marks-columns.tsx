"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { REGEX } from "@/constants/regex.constants";
import { RESULT_MARKS_PAGE } from "@/constants/result.constants";
import type { StudentMarkEntry, ExamScheduleItem, ExamResultRow } from "@/types/result.types";

// ─── MarkInput ────────────────────────────────────────────────────────────────

type MarkSlot = { marks_obtained: number | null; is_absent: boolean } | undefined;

function MarkInput({
  studentId,
  schedule,
  mark,
  updateMark,
}: {
  studentId: string;
  schedule: ExamScheduleItem;
  mark: MarkSlot;
  updateMark: (studentId: string, scheduleId: string, value: number | null, isAbsent: boolean) => void;
}) {
  const isAbsent = mark?.is_absent ?? false;
  const [localValue, setLocalValue] = useState<string>(
    mark?.marks_obtained != null ? String(mark.marks_obtained) : "",
  );

  if (isAbsent) {
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center rounded-md bg-amber-500 dark:bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm tracking-wide">
          ABSENT
        </span>
      </div>
    );
  }

  const numVal = localValue !== "" ? parseFloat(localValue) : null;
  const hasValue = numVal !== null && !isNaN(numVal);
  const pct = hasValue ? (numVal / schedule.exam_marks) * 100 : 0;
  const isPass = pct >= 33;

  return (
    <div className="flex items-center gap-1.5 justify-center">
      <div className="w-16">
        <Input
          type="text"
          inputMode="numeric"
          placeholder="—"
          value={localValue}
          className={cn(
            "h-8 w-full text-center text-sm font-semibold tabular-nums rounded-lg transition-colors",
            hasValue
              ? isPass
                ? "border-emerald-300 bg-emerald-50/80 text-emerald-800 focus-visible:ring-emerald-400/30 dark:bg-emerald-950/25 dark:border-emerald-700 dark:text-emerald-300"
                : "border-red-300 bg-red-50/80 text-red-700 focus-visible:ring-red-400/30 dark:bg-red-950/25 dark:border-red-700 dark:text-red-300"
              : "bg-background",
          )}
          onChange={(e) => {
            const v = e.target.value;
            if (v !== "" && !REGEX.numericPartial.test(v)) return;
            if (v !== "" && parseFloat(v) > schedule.exam_marks) return;
            setLocalValue(v);
          }}
          onBlur={() => {
            const n = localValue === "" ? null : parseFloat(localValue);
            updateMark(studentId, schedule.id, n !== null && isNaN(n) ? null : n, false);
          }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground/40 font-mono leading-none shrink-0">
        /{schedule.exam_marks}
      </span>
    </div>
  );
}

// ─── Edit columns ─────────────────────────────────────────────────────────────

export function getMarksColumns(
  parentSchedules: ExamScheduleItem[],
  updateMark: (
    studentId: string,
    scheduleId: string,
    value: number | null,
    isAbsent: boolean,
  ) => void,
): ColumnDef<StudentMarkEntry>[] {
  const base: ColumnDef<StudentMarkEntry>[] = [
    {
      id: "index",
      size: 48,
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground/40 text-xs tabular-nums">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "roll_number",
      size: 88,
      header: RESULT_MARKS_PAGE.table.rollNo,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.roll_number ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "student_name",
      size: 190,
      header: RESULT_MARKS_PAGE.table.studentName,
      meta: { primary: true },
    },
  ];

  const scheduleCols = parentSchedules.map(
    (schedule): ColumnDef<StudentMarkEntry> => ({
      id: `schedule-${schedule.id}`,
      size: 130,
      header: () => (
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-[11px] font-semibold leading-tight text-foreground">
            {schedule.subject_name}
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">
            {RESULT_MARKS_PAGE.subjectTypes[schedule.subject_type] ?? schedule.subject_type}
            {" · "}
            <span className="font-medium">{schedule.exam_marks}</span>
          </span>
        </div>
      ),
      cell: ({ row }) => (
        <MarkInput
          studentId={row.original.student_id}
          schedule={schedule}
          mark={row.original.marks[schedule.id]}
          updateMark={updateMark}
        />
      ),
    }),
  );

  return [...base, ...scheduleCols];
}

// ─── Display columns ──────────────────────────────────────────────────────────

export function getMarksDisplayColumns(
  parentSchedules: ExamScheduleItem[],
): ColumnDef<StudentMarkEntry>[] {
  const base: ColumnDef<StudentMarkEntry>[] = [
    {
      id: "index",
      size: 48,
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground/40 text-xs tabular-nums">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "roll_number",
      size: 88,
      header: RESULT_MARKS_PAGE.table.rollNo,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.roll_number ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "student_name",
      size: 190,
      header: RESULT_MARKS_PAGE.table.studentName,
      meta: { primary: true },
    },
  ];

  const scheduleCols = parentSchedules.map(
    (schedule): ColumnDef<StudentMarkEntry> => ({
      id: `schedule-${schedule.id}`,
      size: 130,
      header: () => (
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-[11px] font-semibold leading-tight text-foreground">
            {schedule.subject_name}
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">
            {RESULT_MARKS_PAGE.subjectTypes[schedule.subject_type] ?? schedule.subject_type}
            {" · "}
            <span className="font-medium">{schedule.exam_marks}</span>
          </span>
        </div>
      ),
      cell: ({ row }) => {
        const mark = row.original.marks[schedule.id];
        if (mark?.is_absent) {
          return (
            <div className="flex justify-center">
              <Badge variant="warning">Absent</Badge>
            </div>
          );
        }
        const val = mark?.marks_obtained;
        const pct = val != null ? (val / schedule.exam_marks) * 100 : null;
        return (
          <div className="text-center">
            {val != null ? (
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  pct !== null && pct < 33
                    ? "text-destructive"
                    : pct !== null && pct < 60
                      ? "text-amber-600"
                      : "text-emerald-600",
                )}
              >
                {val}
              </span>
            ) : (
              <span className="text-muted-foreground/30 text-xs">—</span>
            )}
          </div>
        );
      },
    }),
  );

  return [...base, ...scheduleCols];
}

// ─── Result view columns (student result detail) ──────────────────────────────

export function getResultViewColumns(): ColumnDef<ExamResultRow>[] {
  return [
    {
      id: "index",
      size: 48,
      header: RESULT_MARKS_PAGE.table.sno,
      cell: ({ row }) => (
        <span className="text-muted-foreground/40 text-xs tabular-nums">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "subject_name",
      header: "Subject",
      meta: { primary: true },
    },
    {
      accessorKey: "subject_type",
      header: "Type",
      cell: ({ row }) =>
        RESULT_MARKS_PAGE.subjectTypes[row.original.subject_type] ??
        row.original.subject_type,
    },
    {
      accessorKey: "max_marks",
      header: "Max",
    },
    {
      accessorKey: "marks_obtained",
      header: "Obtained",
      cell: ({ row }) =>
        row.original.is_absent ? (
          <Badge variant="warning">Absent</Badge>
        ) : (
          <span className="font-semibold tabular-nums">
            {row.original.marks_obtained ?? "—"}
          </span>
        ),
    },
    {
      accessorKey: "is_published",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_published ? (
          <Badge variant="success">Published</Badge>
        ) : (
          <Badge variant="default">Draft</Badge>
        ),
    },
  ];
}
