'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ExamResultsService } from '@/services/result.service';
import type {
  ExamResultRow,
  ExamResultFilters,
  ExamScheduleItem,
  StudentMarkEntry,
} from '@/types/result.types';
// import { markFilterSchema, type MarkFilterFormValues } from '@/validations/result.schema';
import { markFilterSchema, type MarkFilterFormValues } from '@/lib/validations/result.validations';
import { RESULT_MARKS_PAGE } from '@/constants/result.constants';

// ─── List + Mark Entry Hook ───────────────────────────────────────────────────

export function useExamResults() {
  const [results, setResults] = useState<ExamResultRow[]>([]);
  const [schedules, setSchedules] = useState<ExamScheduleItem[]>([]);
  const [studentEntries, setStudentEntries] = useState<StudentMarkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Filter form (academic year / class / section / exam)
  const filterForm = useForm<MarkFilterFormValues>({
    resolver: zodResolver(markFilterSchema),
    defaultValues: {
      academic_year_id: '',
      exam_id: '',
      class_id: '',
      section_id: '',
    },
  });

  const { watch } = filterForm;
  const examId = watch('exam_id');
  const classId = watch('class_id');
  const sectionId = watch('section_id');
  const academicYearId = watch('academic_year_id');

  // ── Load schedules when exam changes ────────────────────────────────────────
  const fetchSchedules = useCallback(async (eId: string) => {
    if (!eId) {
      setSchedules([]);
      setStudentEntries([]);
      return;
    }
    setIsLoadingSchedules(true);
    try {
      const data = await ExamResultsService.getSchedules(eId);
      console.log("DATA -> ", data);
      // Only top-level (parent) schedules shown as columns; sub-subjects nested
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

  // ── Load existing results when exam + class ready ────────────────────────────
  const fetchResults = useCallback(async () => {
    if (!examId || !classId) {
      setResults([]);
      setStudentEntries([]);
      return;
    }
    setIsLoading(true);
    try {
      const filters: ExamResultFilters = {
        exam_id: examId,
        class_id: classId,
        section_id: sectionId || undefined,
        academic_year_id: academicYearId || undefined,
      };
      const { items } = await ExamResultsService.list(filters);
      setResults(items);
      buildStudentEntries(items);
    } catch {
      toast.error(RESULT_MARKS_PAGE.toasts.loadResultsError);
    } finally {
      setIsLoading(false);
    }
  }, [examId, classId, sectionId, academicYearId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // ── Build matrix: students × schedules ───────────────────────────────────────
  function buildStudentEntries(rows: ExamResultRow[]) {
    const map: Record<string, StudentMarkEntry> = {};
    rows.forEach((r) => {
      if (!map[r.student_id]) {
        map[r.student_id] = {
          student_id: r.student_id,
          student_name: r.student_name,
          roll_number: r.roll_number,
          admission_number: '',
          marks: {},
        };
      }
      map[r.student_id].marks[r.exam_schedule_id] = {
        marks_obtained: r.marks_obtained != null ? parseFloat(r.marks_obtained) : null,
        is_absent: r.is_absent,
      };
    });
    setStudentEntries(Object.values(map));
    setIsDirty(false);
  }

  // ── Cell-level update (called from table input onChange) ─────────────────────
  function updateMark(
    studentId: string,
    scheduleId: string,
    value: number | null,
    isAbsent: boolean,
  ) {
    setStudentEntries((prev) =>
      prev.map((entry) =>
        entry.student_id === studentId
          ? {
              ...entry,
              marks: {
                ...entry.marks,
                [scheduleId]: { marks_obtained: value, is_absent: isAbsent },
              },
            }
          : entry,
      ),
    );
    setIsDirty(true);
  }

  // ── Save all marks ────────────────────────────────────────────────────────────
  async function saveMarks(students: { student_id: string; subject_id: string }[]) {
    if (!examId || !classId || !academicYearId) {
      toast.error('Please select exam, class and academic year');
      return;
    }
    setIsSaving(true);
    try {
      const resultRows: {
        student_id: string;
        exam_schedule_id: string;
        subject_id: string;
        marks_obtained: number | null;
        is_absent: boolean;
      }[] = [];

      studentEntries.forEach((entry) => {
        schedules.forEach((schedule) => {
          const mark = entry.marks[schedule.id];
          const subjectEntry = students.find((s) => s.student_id === entry.student_id);
          resultRows.push({
            student_id: entry.student_id,
            exam_schedule_id: schedule.id,
            subject_id: schedule.subject_id,
            marks_obtained: mark?.marks_obtained ?? null,
            is_absent: mark?.is_absent ?? false,
          });
        });
      });

      await ExamResultsService.bulkUpsert({
        exam_id: examId,
        class_id: classId,
        section_id: sectionId || undefined,
        academic_year_id: academicYearId,
        results: resultRows,
      });

      toast.success(RESULT_MARKS_PAGE.toasts.saveSuccess);
      setIsDirty(false);
      await fetchResults();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : RESULT_MARKS_PAGE.toasts.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  // ── Publish / unpublish ───────────────────────────────────────────────────────
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
      await fetchResults();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : RESULT_MARKS_PAGE.toasts.publishError);
    } finally {
      setIsPublishing(false);
    }
  }

  // Derived: are all current results published?
  const isPublished = results.length > 0 && results.every((r) => r.is_published);

  return {
    // state
    results,
    schedules,
    studentEntries,
    isLoading,
    isLoadingSchedules,
    isSaving,
    isPublishing,
    isDirty,
    isPublished,
    // filter form
    filterForm,
    examId,
    classId,
    sectionId,
    academicYearId,
    // actions
    updateMark,
    saveMarks,
    togglePublish,
    refetch: fetchResults,
  };
}
