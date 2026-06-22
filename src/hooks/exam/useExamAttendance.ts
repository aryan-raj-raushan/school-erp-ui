"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ExamAttendanceService, ExamScheduleService } from "@/services/exam.service";
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

  return { records, pagination, filters, isLoading, updateFilters, refetch: fetch };
}

// ── Bulk Mark Hook ────────────────────────────────────────────────────────────

export interface StudentAttendanceRow {
  student_id: string;
  student_name: string;
  roll_number?: string;
  entries: Record<string, AttendanceStatus>; // scheduleId → status
}

export function useMarkAttendance() {
  const [examId, setExamId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load schedules when exam selected
  useEffect(() => {
    if (!examId) {
      setSchedules([]);
      return;
    }
    setIsLoadingSchedules(true);
    ExamScheduleService.list({ exam_id: examId, limit: 100 })
      .then((r) => setSchedules(r.items))
      .catch(() => toast.error("Failed to load schedules"))
      .finally(() => setIsLoadingSchedules(false));
  }, [examId]);

  function initRows(students: { id: string; first_name:string ;name: string; roll_number?: string }[]) {
    const initial: StudentAttendanceRow[] = students.map((s) => ({
      student_id: s.id,
      student_name: s?.first_name,
      roll_number: s.roll_number,
      entries: Object.fromEntries(schedules.map((sc) => [sc.id, "PRESENT" as AttendanceStatus])),
    }));
    console.log("initRows =========> ", initial)
    setRows(initial);
  }



  function setStatus(studentId: string, scheduleId: string, status: AttendanceStatus) {
    setRows((prev) =>
      prev.map((r) =>
        r.student_id === studentId
          ? { ...r, entries: { ...r.entries, [scheduleId]: status } }
          : r
      )
    );
  }

  function markAllPresent() {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        entries: Object.fromEntries(schedules.map((sc) => [sc.id, "PRESENT" as AttendanceStatus])),
      }))
    );
  }

  function markAllAbsent() {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        entries: Object.fromEntries(schedules.map((sc) => [sc.id, "ABSENT" as AttendanceStatus])),
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
        schedules.map((sc) => ({
          student_id: row.student_id,
          schedule_id: sc.id,
          status: row.entries[sc.id] ?? "ABSENT",
        }))
      );
      await ExamAttendanceService.bulkMark({ exam_id: examId, academic_year_id: academicYearId, entries });
      toast.success(ATTENDANCE_PAGE.toasts.saveSuccess);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : ATTENDANCE_PAGE.toasts.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  return {
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
  };
}