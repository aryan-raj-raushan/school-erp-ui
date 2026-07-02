"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExamsService, ExamTemplateService } from "@/services/exam.service";
import {
  ClassSubjectTeacherService,
  type ClassSubjectTeacherMapping,
} from "@/services/class-subject-teacher.service";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { EXAM_ROUTES } from "@/constants/exam.constants";
import type { AutoGenerateConflict, ExamTerm, ExamTemplate } from "@/types/exam.types";

export function useAutoGenerateExam() {
  const router = useRouter();
  const { years, classes, currentYear } = useAcademicClassSection({ autoSelectCurrentYear: true });

  const [examName, setExamName] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [examTerm, setExamTerm] = useState<ExamTerm>("TERM1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dailyStartTime, setDailyStartTime] = useState("09:00");
  const [dailyEndTime, setDailyEndTime] = useState("12:00");
  const [defaultExamMarks, setDefaultExamMarks] = useState(100);
  const [defaultPassingMarks, setDefaultPassingMarks] = useState(35);
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);

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
    classesMissingMapping.length < classIds.length; // at least one class has subjects to schedule

  async function generate() {
    if (!canGenerate) {
      toast.error("Fill in academic year, class(es), exam name and date range");
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
        default_exam_marks: defaultExamMarks,
        default_passing_marks: defaultPassingMarks,
        template_id: templateId || undefined,
      });
      setConflicts(result.conflicts);
      if (result.conflicts.length > 0) {
        toast.warning(`Exam created — ${result.conflicts.length} item(s) need attention`);
      } else {
        toast.success("Exam auto-generated");
      }
      router.push(EXAM_ROUTES.exams.schedule(result.exam.id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to auto-generate exam");
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
    endDate,
    setEndDate,
    dailyStartTime,
    setDailyStartTime,
    dailyEndTime,
    setDailyEndTime,
    defaultExamMarks,
    setDefaultExamMarks,
    defaultPassingMarks,
    setDefaultPassingMarks,
    templateId,
    setTemplateId,
    templates,
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
