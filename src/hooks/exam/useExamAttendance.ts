"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  ExamAttendanceService,
  ExamScheduleService,
} from "@/services/exam.service";
import { StudentsService } from "@/services/students-v2.service";
import type {
  ExamAttendance,
  AttendanceFilters,
  AttendanceEntry,
  AttendanceStatus,
  ExamSchedule,
} from "@/types/exam.types";
import type { PaginationMeta } from "@/types";
import { ATTENDANCE_PAGE } from "@/constants/exam.constants";

// ── List Hook ─────────────────────────────────────────────────────────────────

export function useExamAttendanceList(initialFilters: AttendanceFilters = {}) {
  const [records, setRecords] = useState<ExamAttendance[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ExamAttendanceService.list(filters);
      setRecords(result.items);
      setPagination(result.pagination);
    } catch {
      toast.error(ATTENDANCE_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  function updateFilters(next: Partial<AttendanceFilters>) {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }

  return {
    records,
    pagination,
    filters,
    isLoading,
    updateFilters,
    refetch: fetch,
  };
}

// ── Bulk Mark Hook ────────────────────────────────────────────────────────────

export type AttendanceSource = "manual" | "rfid-auto";

export interface StudentAttendanceRow {
  student_id: string;
  student_name: string;
  roll_number?: string;
  entries: Record<string, { status: AttendanceStatus; source: AttendanceSource }>;
}

const STATUS_CYCLE: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE"];

export function useMarkAttendance({
  classId,
  sectionId,
  academicYearId,
}: {
  classId: string;
  sectionId: string;
  academicYearId: string;
}) {
  const [examId, setExamId] = useState("");
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [students, setStudents] = useState<{ id: string; first_name: string; last_name?: string | null; roll_number?: string | null }[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch students whenever class / section / year changes
  useEffect(() => {
    if (!classId) {
      setStudents([]);
      return;
    }
    StudentsService.list({
      class_id: classId,
      section_id: sectionId || undefined,
      academic_year_id: academicYearId || undefined,
      limit: 500,
    })
      .then((r) => setStudents(r.items))
      .catch(() => toast.error("Failed to load students"));
  }, [classId, sectionId, academicYearId]);

  // Load schedules + derive dates when exam or class changes.
  // class_id is required here — without it, every schedule row for the exam
  // (across all classes it spans) comes back, so students get cross-joined
  // against schedules that belong to a different class entirely.
  useEffect(() => {
    if (!examId || !classId) {
      setSchedules([]);
      setAvailableDates([]);
      setRows([]);
      return;
    }
    setIsLoadingSchedules(true);
    ExamScheduleService.list({ exam_id: examId, class_id: classId, limit: 200 })
      .then((r) => {
        setSchedules(r.items);
        const dates = [...new Set(r.items.map((s) => s.exam_date))].sort();
        setAvailableDates(dates);
      })
      .catch(() => toast.error("Failed to load schedules"))
      .finally(() => setIsLoadingSchedules(false));
  }, [examId, classId]);

  // Build attendance rows automatically when all data is ready
  useEffect(() => {
    if (!examId || !academicYearId || !classId) return;
    if (isLoadingSchedules || availableDates.length === 0) return;
    if (students.length === 0) return;
    buildRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, academicYearId, classId, sectionId, availableDates, students, isLoadingSchedules]);

  async function buildRows() {
    let existing: ExamAttendance[] = [];
    if (examId && academicYearId) {
      try {
        const res = await ExamAttendanceService.list({
          exam_id: examId,
          academic_year_id: academicYearId,
          limit: 1000,
        });
        existing = res.items;
      } catch {
        // fall back to defaults
      }
    }

    const existingMap: Record<
      string,
      Record<string, { status: AttendanceStatus; source: AttendanceSource }>
    > = {};
    for (const r of existing) {
      const dateStr = (r as ExamAttendance & { exam_date?: string }).exam_date;
      if (!dateStr) continue;
      if (!existingMap[r.student_id]) existingMap[r.student_id] = {};
      if (!existingMap[r.student_id][dateStr]) {
        existingMap[r.student_id][dateStr] = {
          status: r.status,
          source: r.marked_by === "rfid-auto" ? "rfid-auto" : "manual",
        };
      }
    }

    const initial: StudentAttendanceRow[] = students.map((s) => ({
      student_id: s.id,
      student_name: [s.first_name, s.last_name].filter(Boolean).join(" "),
      roll_number: s.roll_number ?? undefined,
      entries: Object.fromEntries(
        availableDates.map((date) => [
          date,
          existingMap[s.id]?.[date] ?? {
            status: "PRESENT" as AttendanceStatus,
            source: "manual" as AttendanceSource,
          },
        ])
      ),
    }));

    setRows(initial);
  }

  function cycleStatus(studentId: string, date: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.student_id !== studentId) return r;
        const current = r.entries[date]?.status ?? "PRESENT";
        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
        return { ...r, entries: { ...r.entries, [date]: { status: next, source: "manual" } } };
      })
    );
  }

  function setDateStatus(studentId: string, date: string, status: AttendanceStatus) {
    setRows((prev) =>
      prev.map((r) =>
        r.student_id === studentId
          ? { ...r, entries: { ...r.entries, [date]: { status, source: "manual" } } }
          : r
      )
    );
  }

  function markAllPresent() {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        entries: Object.fromEntries(
          availableDates.map((d) => [d, { status: "PRESENT" as AttendanceStatus, source: "manual" as AttendanceSource }])
        ),
      }))
    );
  }

  function markAllAbsent() {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        entries: Object.fromEntries(
          availableDates.map((d) => [d, { status: "ABSENT" as AttendanceStatus, source: "manual" as AttendanceSource }])
        ),
      }))
    );
  }

  async function save() {
    if (!examId || !academicYearId) {
      toast.error("Select exam and academic year");
      return;
    }
    setIsSaving(true);
    try {
      const entries: AttendanceEntry[] = rows.flatMap((row) =>
        availableDates.flatMap((date) => {
          const schedulesOnDate = schedules.filter((s) => s.exam_date === date);
          const status = row.entries[date]?.status ?? "PRESENT";
          return schedulesOnDate.map((sc) => ({
            student_id: row.student_id,
            schedule_id: sc.id,
            status,
          }));
        })
      );
      await ExamAttendanceService.bulkMark({
        exam_id: examId,
        academic_year_id: academicYearId,
        entries,
      });
      toast.success(ATTENDANCE_PAGE.toasts.saveSuccess);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : ATTENDANCE_PAGE.toasts.saveError
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    examId,
    setExamId,
    availableDates,
    isLoadingSchedules,
    rows,
    cycleStatus,
    setDateStatus,
    markAllPresent,
    markAllAbsent,
    isSaving,
    save,
  };
}
