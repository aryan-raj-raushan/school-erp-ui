"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ExamResultsService } from "@/services/result.service";
import { StudentsService } from "@/services/students.service";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { getMarksColumns, getMarksDisplayColumns } from "@/components/result/marks-columns";
import type {
  ExamResultRow,
  ExamResultFilters,
  ExamScheduleItem,
  StudentMarkEntry,
} from "@/types/result.types";
import type { Student } from "@/types";
import {
  markFilterSchema,
  type MarkFilterFormValues,
} from "@/lib/validations/result.validations";
import { RESULT_MARKS_PAGE } from "@/constants/result.constants";

export function useExamResults() {
  // ── Selector state (year / class / section) ──────────────────────────────
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
  } = useAcademicClassSection();

  // ── Exam list filtered by year + class ───────────────────────────────────
  const { exams } = useExams({
    academic_year_id: selectedAcademicYearId || undefined,
    class_id: selectedClassId || undefined,
  });

  // ── Marks-entry state ─────────────────────────────────────────────────────
  const [results, setResults] = useState<ExamResultRow[]>([]);
  const [schedules, setSchedules] = useState<ExamScheduleItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentEntries, setStudentEntries] = useState<StudentMarkEntry[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // ── Confirm modal state ───────────────────────────────────────────────────
  const [confirmAction, setConfirmAction] = useState<"publish" | "unpublish" | null>(null);

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

  const { watch, setValue } = filterForm;
  const examId = watch("exam_id");
  const classId = watch("class_id");
  const sectionId = watch("section_id");
  const academicYearId = watch("academic_year_id");

  // ── Sync auto-selected year from useAcademicClassSection ─────────────────
  // useAcademicClassSection auto-selects currentYear on mount without user
  // interaction (no onChange fires), so we must mirror it into the form.
  useEffect(() => {
    if (selectedAcademicYearId) {
      setValue("academic_year_id", selectedAcademicYearId);
    }
  }, [selectedAcademicYearId, setValue]);

  // ── Filter-change handlers (all form + selector state kept in sync) ───────
  function onYearChange(yearId: string) {
    setSelectedAcademicYearId(yearId);
    setValue("academic_year_id", yearId);
    handleClassChange("");
    setValue("class_id", "");
    setValue("section_id", "");
    setValue("exam_id", "");
  }

  function onClassChange(cId: string) {
    handleClassChange(cId);
    setValue("class_id", cId);
    setValue("section_id", "");
    setValue("exam_id", "");
  }

  function onSectionChange(sId: string) {
    handleSectionChange(sId);
    setValue("section_id", sId);
  }

  function onExamChange(eId: string) {
    setValue("exam_id", eId);
  }

  // ── 1. Load schedules when exam changes ───────────────────────────────────
  const fetchSchedules = useCallback(async (eId: string) => {
    if (!eId) { setSchedules([]); return; }
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

  useEffect(() => { fetchSchedules(examId); }, [examId, fetchSchedules]);

  // ── 2. Load saved marks when exam + class + year are ready ───────────────
  const fetchSavedMarks = useCallback(async () => {
    if (!examId || !classId || !academicYearId) { setResults([]); return; }
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

  useEffect(() => { fetchSavedMarks(); }, [fetchSavedMarks]);

  // ── 3. Fetch students when class / section / year change ──────────────────
  useEffect(() => {
    if (!classId || !academicYearId) { setStudents([]); return; }
    setIsLoadingStudents(true);
    StudentsService.list({
      class_id: classId,
      section_id: sectionId || undefined,
      academic_year_id: academicYearId,
      limit: 1000,
    })
      .then(({ items }) => setStudents(items))
      .catch(() => toast.error(RESULT_MARKS_PAGE.toasts.loadStudentsError))
      .finally(() => setIsLoadingStudents(false));
  }, [classId, sectionId, academicYearId]);

  // ── 4. Rebuild entry grid when students or saved marks change ─────────────
  const buildGrid = useCallback((sts: Student[], savedMarks: ExamResultRow[]) => {
    const savedMap: Record<
      string,
      Record<string, { marks_obtained: number | null; is_absent: boolean }>
    > = {};
    savedMarks.forEach((r) => {
      if (!savedMap[r.student_id]) savedMap[r.student_id] = {};
      savedMap[r.student_id][r.exam_schedule_id] = {
        marks_obtained: r.marks_obtained != null ? parseFloat(r.marks_obtained) : null,
        is_absent: r.is_absent,
      };
    });
    const entries: StudentMarkEntry[] = sts.map((s) => {
      const academic = (s as any).academic_info ?? s;
      return {
        student_id: s.id,
        student_name: `${s.first_name} ${s.last_name ?? ""}`.trim(),
        roll_number: academic.roll_number ?? (s as any).roll_number ?? null,
        admission_number: academic.admission_number ?? (s as any).admission_number ?? "",
        marks: savedMap[s.id] ?? {},
      };
    });
    setStudentEntries(entries);
    setIsDirty(false);
  }, []);

  useEffect(() => { buildGrid(students, results); }, [students, results, buildGrid]);

  // ── 5. Cell-level mark update ────────────────────────────────────────────
  // useCallback with empty deps: state setters are permanently stable refs
  const updateMark = useCallback(
    (studentId: string, scheduleId: string, value: number | null, isAbsent: boolean) => {
      setStudentEntries((prev) =>
        prev.map((e) =>
          e.student_id === studentId
            ? { ...e, marks: { ...e.marks, [scheduleId]: { marks_obtained: value, is_absent: isAbsent } } }
            : e,
        ),
      );
      setIsDirty(true);
    },
    [],
  );

  // ── 6. Save all marks ────────────────────────────────────────────────────
  async function saveMarks() {
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
        exam_id: examId,
        class_id: classId,
        section_id: sectionId || undefined,
        academic_year_id: academicYearId,
        results: resultRows,
      });
      toast.success(RESULT_MARKS_PAGE.toasts.saveSuccess);
      setIsDirty(false);
      await fetchSavedMarks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : RESULT_MARKS_PAGE.toasts.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  // ── 7. Publish / unpublish ───────────────────────────────────────────────
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
      toast.success(isPublished ? RESULT_MARKS_PAGE.toasts.publishSuccess : RESULT_MARKS_PAGE.toasts.unpublishSuccess);
      await fetchSavedMarks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : RESULT_MARKS_PAGE.toasts.publishError);
    } finally {
      setIsPublishing(false);
    }
  }

  async function onConfirmPublish() {
    await togglePublish(true);
    setConfirmAction(null);
  }

  async function onConfirmUnpublish() {
    await togglePublish(false);
    setConfirmAction(null);
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const isPublished = results.length > 0 && results.every((r) => r.is_published);
  const noSelection = !examId || !classId;
  const isTableBusy = isLoadingSchedules || isLoadingResults || isLoadingStudents;

  const parentSchedules = useMemo(
    () => schedules.filter((s) => !s.parent_schedule_id),
    [schedules],
  );

  function cancelEdit() {
    buildGrid(students, results);
    setIsDirty(false);
    setIsEditMode(false);
  }

  const columns = useMemo(
    () =>
      isEditMode
        ? getMarksColumns(parentSchedules, updateMark)
        : getMarksDisplayColumns(parentSchedules),
    [parentSchedules, updateMark, isEditMode],
  );

  return {
    // Selector data
    years,
    classes,
    sections,
    exams,
    selectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    isLoadingClasses,
    // Handlers
    onYearChange,
    onClassChange,
    onSectionChange,
    onExamChange,
    // Marks data
    results,
    schedules,
    studentEntries,
    isLoadingSchedules,
    isLoadingResults,
    isLoadingStudents,
    isSaving,
    isPublishing,
    isDirty,
    isPublished,
    noSelection,
    isTableBusy,
    isEditMode,
    setIsEditMode,
    cancelEdit,
    parentSchedules,
    columns,
    // Form (for view page compatibility)
    filterForm,
    examId,
    classId,
    sectionId,
    academicYearId,
    // Actions
    updateMark,
    saveMarks,
    togglePublish,
    // Confirm modal
    confirmAction,
    setConfirmAction,
    onConfirmPublish,
    onConfirmUnpublish,
    refetch: fetchSavedMarks,
  };
}
