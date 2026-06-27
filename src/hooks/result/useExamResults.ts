"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ExamResultsService } from "@/services/result.service";
import type {
  ExamResultRow,
  ExamResultFilters,
  ExamScheduleItem,
  StudentMarkEntry,
} from "@/types/result.types";
import type { StudentListItem } from "@/types/students.types";
import {
  markFilterSchema,
  type MarkFilterFormValues,
} from "@/lib/validations/result.validations";
import { RESULT_MARKS_PAGE } from "@/constants/result.constants";
import { Student } from "@/types";

export function useExamResults() {
  const [results, setResults] = useState<ExamResultRow[]>([]);
  const [schedules, setSchedules] = useState<ExamScheduleItem[]>([]);
  const [studentEntries, setStudentEntries] = useState<StudentMarkEntry[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ── Filter form ───────────────────────────────────────────────────────────
  const filterForm = useForm<MarkFilterFormValues>({
    resolver: zodResolver(markFilterSchema),
    defaultValues: {
      academic_year_id: "",
      exam_id: "",
      class_id: "",
      section_id: "",
    },
  });

  const { watch } = filterForm;
  const examId = watch("exam_id");
  const classId = watch("class_id");
  const sectionId = watch("section_id");
  const academicYearId = watch("academic_year_id");

  // ── 1. Load schedules when exam changes ───────────────────────────────────
  const fetchSchedules = useCallback(async (eId: string) => {
    if (!eId) {
      setSchedules([]);
      return;
    }
    setIsLoadingSchedules(true);
    try {
      const data = await ExamResultsService.getSchedules(eId);
      setSchedules(data);
    } catch {
      toast.error(RESULT_MARKS_PAGE.toasts.loadScheduleError);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules(examId);
  }, [examId, fetchSchedules]);

  // ── 2. Load saved marks when exam + class are ready ───────────────────────
  //    Does NOT fetch students — the page passes them in via buildGrid().
  const fetchSavedMarks = useCallback(async () => {
    if (!examId || !classId || !academicYearId) {
      setResults([]);
      return;
    }
    setIsLoadingResults(true);
    try {
      const { items } = await ExamResultsService.list({
        exam_id: examId,
        class_id: classId,
        section_id: sectionId || undefined,
        academic_year_id: academicYearId,
      } as ExamResultFilters);
      setResults(items);

    } catch {
      toast.error(RESULT_MARKS_PAGE.toasts.loadResultsError);
    } finally {
      setIsLoadingResults(false);
    }
  }, [examId, classId, sectionId, academicYearId]);

  useEffect(() => {
    fetchSavedMarks();
  }, [fetchSavedMarks, examId, classId, sectionId, academicYearId]);


  // ── 3. Build the editable grid from the student list + saved marks ─────────
  //    Called by the page whenever students or results change.
  function buildGrid(students: Student[], savedMarks: ExamResultRow[]) {
    // lookup: student_id → { scheduleId → mark }
    const savedMap: Record<
      string,
      Record<string, { marks_obtained: number | null; is_absent: boolean }>
    > = {};
    savedMarks.forEach((r) => {
      if (!savedMap[r.student_id]) savedMap[r.student_id] = {};
      savedMap[r.student_id][r.exam_schedule_id] = {
        marks_obtained:
          r.marks_obtained != null ? parseFloat(r.marks_obtained) : null,
        is_absent: r.is_absent,
      };
    });

    const entries: StudentMarkEntry[] = students.map((s) => {
      const academic = (s as any).academic_info ?? s;
      return {
        student_id: s.id,
        student_name: `${s.first_name} ${s.last_name ?? ""}`.trim(),
        roll_number: academic.roll_number ?? (s as any).roll_number ?? null,
        admission_number:
          academic.admission_number ?? (s as any).admission_number ?? "",
        marks: savedMap[s.id] ?? {},
      };
    });

    setStudentEntries(entries);
    setIsDirty(false);
  }

  // ── 4. Cell-level update ─────────────────────────────────────────────────
  function updateMark(
    studentId: string,
    scheduleId: string,
    value: number | null,
    isAbsent: boolean,
  ) {
    setStudentEntries((prev) =>
      prev.map((e) =>
        e.student_id === studentId
          ? {
              ...e,
              marks: {
                ...e.marks,
                [scheduleId]: { marks_obtained: value, is_absent: isAbsent },
              },
            }
          : e,
      ),
    );
    setIsDirty(true);
  }

  // ── 5. Save all marks ────────────────────────────────────────────────────
  async function saveMarks(filters: {
    examId: string;
    classId: string;
    sectionId?: string;
    academicYearId: string;
  }) {
    if (!examId || !classId || !academicYearId) {
      toast.error("Please select exam, class and academic year");
      return;
    }
    if (studentEntries.length === 0) {
      toast.error("No students to save marks for");
      return;
    }
    setIsSaving(true);
    try {
      const resultRows = studentEntries.flatMap((entry) =>
        schedules.map((schedule) => {
          const mark = entry.marks[schedule.id];
          return {
            student_id: entry.student_id,
            exam_schedule_id: schedule.id,
            subject_id: schedule.subject_id,
            marks_obtained: mark?.marks_obtained ?? null,
            is_absent: mark?.is_absent ?? false,
          };
        }),
      );

      await ExamResultsService.bulkUpsert({
        exam_id: filters.examId,
        class_id: filters.classId,
        section_id: filters.sectionId,
        academic_year_id: filters.academicYearId,
        results: resultRows,
      });

      toast.success(RESULT_MARKS_PAGE.toasts.saveSuccess);
      setIsDirty(false);
      await fetchSavedMarks();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : RESULT_MARKS_PAGE.toasts.saveError,
      );
    } finally {
      setIsSaving(false);
    }
  }

  // ── 6. Publish / unpublish ───────────────────────────────────────────────
  async function togglePublish(isPublished: boolean) {
    if (!examId) return;
    setIsPublishing(true);
    try {
      await ExamResultsService.publish({
        exam_id: examId,
        class_id: classId || undefined,
        section_id: sectionId || undefined,
        is_published: isPublished,
      });
      toast.success(
        isPublished
          ? RESULT_MARKS_PAGE.toasts.publishSuccess
          : RESULT_MARKS_PAGE.toasts.unpublishSuccess,
      );
      await fetchSavedMarks();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : RESULT_MARKS_PAGE.toasts.publishError,
      );
    } finally {
      setIsPublishing(false);
    }
  }

  const isPublished =
    results.length > 0 && results.every((r) => r.is_published);

  return {
    results,
    schedules,
    studentEntries,
    isLoadingSchedules,
    isLoadingResults,
    isSaving,
    isPublishing,
    isDirty,
    isPublished,
    filterForm,
    examId,
    classId,
    sectionId,
    academicYearId,
    buildGrid,
    updateMark,
    saveMarks,
    togglePublish,
    refetch: fetchSavedMarks,
  };
}
