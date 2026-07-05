"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExamsService, ExamTemplateService, SittingPlanService } from "@/services/exam.service";
import {
  ClassSubjectTeacherService,
  type ClassSubjectTeacherMapping,
} from "@/services/class-subject-teacher.service";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useHallDetails } from "@/hooks/exam/useExamHall";
import { EXAM_ROUTES } from "@/constants/exam.constants";
import { GatewayError } from "@/lib/api-gateway/interceptors/error.interceptor";
import type { AutoGenerateConflict, ExamTerm, ExamTemplate } from "@/types/exam.types";

export function useAutoGenerateExam() {
  const router = useRouter();
  const { years, classes, currentYear } = useAcademicClassSection({ autoSelectCurrentYear: true });
  const { details: hallRooms } = useHallDetails();

  const [examName, setExamName] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [examTerm, setExamTerm] = useState<ExamTerm>("TERM1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dailyStartTime, setDailyStartTime] = useState("09:00");
  const [dailyEndTime, setDailyEndTime] = useState("12:00");
  const [subjectDurationMinutes, setSubjectDurationMinutes] = useState(60);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(20);
  const [defaultExamMarks, setDefaultExamMarks] = useState(100);
  const [defaultPassingMarks, setDefaultPassingMarks] = useState(35);
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [autoAssignSeating, setAutoAssignSeating] = useState(false);
  const [seatingHallIds, setSeatingHallIds] = useState<string[]>([]);

  const [mappingsByClass, setMappingsByClass] = useState<
    Record<string, ClassSubjectTeacherMapping[]>
  >({});
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<AutoGenerateConflict[]>([]);

  useEffect(() => {
    if (currentYear && !academicYearId) setAcademicYearId(currentYear.id);
  }, [currentYear, academicYearId]);

  useEffect(() => {
    ExamTemplateService.list().then(setTemplates).catch(() => {});
  }, []);

  // Pre-fill marks/term from the chosen template
  useEffect(() => {
    if (!templateId) return;
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setExamTerm(template.exam_term);
    setDefaultExamMarks(template.default_exam_marks);
    setDefaultPassingMarks(template.default_passing_marks);
  }, [templateId, templates]);

  const loadMappings = useCallback(async () => {
    if (!academicYearId || classIds.length === 0) {
      setMappingsByClass({});
      return;
    }
    setIsLoadingMappings(true);
    try {
      const entries = await Promise.all(
        classIds.map((cid) =>
          ClassSubjectTeacherService.list({ academic_year_id: academicYearId, class_id: cid }).then(
            (mappings) => [cid, mappings] as const,
          ),
        ),
      );
      setMappingsByClass(Object.fromEntries(entries));
    } catch {
      toast.error("Failed to load subject-teacher mappings");
    } finally {
      setIsLoadingMappings(false);
    }
  }, [academicYearId, classIds]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const startDateError =
    startDate && startDate < today ? "Start date cannot be in the past" : "";
  const endDateError =
    startDate && endDate && endDate <= startDate ? "End date must be after start date" : "";

  const totalSubjectCount = useMemo(
    () => Object.values(mappingsByClass).reduce((sum, list) => sum + list.length, 0),
    [mappingsByClass],
  );

  // Classes selected for the exam that have no subject-teacher mapping set up yet
  const classesMissingMapping = useMemo(
    () => classIds.filter((cid) => (mappingsByClass[cid]?.length ?? 0) === 0),
    [classIds, mappingsByClass],
  );

  const canGenerate =
    !!academicYearId &&
    classIds.length > 0 &&
    !!examName &&
    !!startDate &&
    !!endDate &&
    !startDateError &&
    !endDateError &&
    classesMissingMapping.length < classIds.length && // at least one class has subjects to schedule
    (!autoAssignSeating || seatingHallIds.length > 0); // seating needs at least one room picked

  async function generate() {
    if (!canGenerate) {
      toast.error(
        startDateError || endDateError || "Fill in academic year, class(es), exam name and date range",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await ExamsService.autoGenerate({
        academic_year_id: academicYearId,
        class_ids: classIds,
        exam_name: examName,
        exam_term: examTerm,
        start_date: startDate,
        end_date: endDate,
        daily_start_time: dailyStartTime,
        daily_end_time: dailyEndTime,
        subject_duration_minutes: subjectDurationMinutes,
        break_duration_minutes: breakDurationMinutes,
        default_exam_marks: defaultExamMarks,
        default_passing_marks: defaultPassingMarks,
        template_id: templateId || undefined,
      });
      // Backend refuses to create anything unless every subject fit cleanly —
      // a success response here always means a clean, conflict-free exam.
      setConflicts([]);

      if (autoAssignSeating && seatingHallIds.length > 0) {
        try {
          const seating = await SittingPlanService.autoShuffle({
            exam_id: result.exam.id,
            academic_year_id: academicYearId,
            class_ids: classIds,
            hall_detail_ids: seatingHallIds,
            clear_existing: true,
          });
          if (seating.shortfall_warning) {
            toast.warning(`Exam created — ${seating.shortfall_warning}`);
          } else {
            toast.success(
              `Exam auto-generated — ${seating.total_assigned} student(s) seated across ${seating.rooms.length} room(s)`,
            );
          }
        } catch (seatErr: unknown) {
          toast.warning(
            `Exam and schedule created, but seating failed: ${seatErr instanceof Error ? seatErr.message : "unknown error"}. Assign seating manually.`,
          );
        }
      } else {
        toast.success("Exam auto-generated");
      }

      router.push(EXAM_ROUTES.exams.schedule(result.exam.id));
    } catch (err: unknown) {
      if (err instanceof GatewayError && Array.isArray(err.data && (err.data as { conflicts?: unknown }).conflicts)) {
        const data = err.data as { conflicts: AutoGenerateConflict[] };
        setConflicts(data.conflicts);
        toast.error(
          `${data.conflicts.length} subject(s) didn't fit — nothing was created. See details below.`,
        );
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to auto-generate exam");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    router.push(EXAM_ROUTES.exams.list);
  }

  return {
    examName,
    setExamName,
    years,
    academicYearId,
    setAcademicYearId,
    classes,
    classIds,
    setClassIds,
    examTerm,
    setExamTerm,
    startDate,
    setStartDate,
    startDateError,
    endDate,
    setEndDate,
    endDateError,
    dailyStartTime,
    setDailyStartTime,
    dailyEndTime,
    setDailyEndTime,
    subjectDurationMinutes,
    setSubjectDurationMinutes,
    breakDurationMinutes,
    setBreakDurationMinutes,
    defaultExamMarks,
    setDefaultExamMarks,
    defaultPassingMarks,
    setDefaultPassingMarks,
    templateId,
    setTemplateId,
    templates,
    autoAssignSeating,
    setAutoAssignSeating,
    seatingHallIds,
    setSeatingHallIds,
    hallRooms,
    mappingsByClass,
    isLoadingMappings,
    totalSubjectCount,
    classesMissingMapping,
    canGenerate,
    isSubmitting,
    conflicts,
    generate,
    handleBack,
  };
}
