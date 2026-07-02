"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ExamScheduleService, ExamsService } from "@/services/exam.service";
import { SubjectsService } from "@/services/subjects.service";
import type { ExamSchedule, ScheduleFilters } from "@/types/exam.types";
import type { PaginationMeta } from "@/types";
import { SCHEDULE_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

export interface SiblingCopyTask {
  classId: string;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;

const subScheduleSchema = z.object({
  subject_type: z.enum([
    "MAIN_EXAM",
    "SECONDARY_EXAM",
    "PRACTICAL_EXAM",
    "ORAL_EXAM",
  ] as const),
  subject_name: z.string().min(1, "Required"),
  exam_date: z.string().min(1, "Required"),
  start_time: z.string().regex(timeRegex, "HH:mm format"),
  end_time: z.string().regex(timeRegex, "HH:mm format"),
  exam_marks: z.coerce.number().int().min(0),
  passing_marks: z.coerce.number().int().min(0),
  exam_invigilator_id: z.string().optional(),
  hall_detail_id: z.string().optional(),
});

const scheduleItemSchema = z.object({
  subject_id: z.string().uuid("Select a subject"),
  subject_name: z.string().min(1, "Required"),
  subject_type: z
    .enum([
      "MAIN_EXAM",
      "SECONDARY_EXAM",
      "PRACTICAL_EXAM",
      "ORAL_EXAM",
    ] as const)
    .optional(),
  exam_date: z.string().min(1, "Required"),
  start_time: z.string().regex(timeRegex, "HH:mm format"),
  end_time: z.string().regex(timeRegex, "HH:mm format"),
  exam_marks: z.coerce.number().int().min(0),
  passing_marks: z.coerce.number().int().min(0),
  exam_invigilator_id: z.string().optional(),
  hall_detail_id: z.string().optional(),
  sub_subject_enabled: z.boolean().optional(),
  sub_schedules: z.array(subScheduleSchema).optional(),
});

export const scheduleFormSchema = z.object({
  exam_id: z.string().uuid("Select an exam"),
  academic_year_id: z.string().uuid("Required"),
  class_id: z.string().uuid("Required"),
  section_id: z.string().optional(),
  schedules: z.array(scheduleItemSchema).min(1, "Add at least one subject"),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export type ScheduleFormInput = z.input<typeof scheduleFormSchema>;

const defaultScheduleItem = {
  subject_id: "",
  subject_name: "",
  subject_type: "MAIN_EXAM" as const,
  exam_date: "",
  start_time: "",
  end_time: "",
  exam_marks: 100,
  passing_marks: 35,
  exam_invigilator_id: "",
  hall_detail_id: "",
  sub_subject_enabled: false,
  sub_schedules: [],
};

// ── List Hook ─────────────────────────────────────────────────────────────────

export function useExamSchedules(initialFilters: ScheduleFilters = {}) {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<ScheduleFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ExamScheduleService.list(filters);
      setSchedules(result.items);
      setPagination(result.pagination);
    } catch {
      toast.error(SCHEDULE_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  function updateFilters(next: Partial<ScheduleFilters>) {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }

  async function remove(id: string) {
    try {
      await ExamScheduleService.remove(id);
      toast.success(SCHEDULE_PAGE.toasts.deleteSuccess);
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return {
    schedules,
    pagination,
    filters,
    isLoading,
    updateFilters,
    remove,
    refetch: fetch,
  };
}

// ── Bulk Create Hook ──────────────────────────────────────────────────────────

export function useExamScheduleForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSiblings, setPendingSiblings] = useState<SiblingCopyTask[]>([]);
  const [isCopyingToSiblings, setIsCopyingToSiblings] = useState(false);
  // Store the last submitted payload so we can copy it to siblings
  const lastPayloadRef = { current: null as Parameters<typeof ExamScheduleService.bulkCreate>[0] | null };

  const form = useForm<ScheduleFormInput, unknown, ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      exam_id: "",
      academic_year_id: "",
      class_id: "",
      section_id: "",
      schedules: [defaultScheduleItem],
    },
  });

  const schedulesField = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        section_id: values.section_id || undefined,
        schedules: values.schedules.map((s) => ({
          ...s,
          exam_invigilator_id: s.exam_invigilator_id || undefined,
          hall_detail_id: s.hall_detail_id || undefined,
          sub_schedules: s.sub_schedules?.map((sub) => ({
            ...sub,
            exam_invigilator_id: sub.exam_invigilator_id || undefined,
            hall_detail_id: sub.hall_detail_id || undefined,
          })),
        })),
      };
      await ExamScheduleService.bulkCreate(payload);
      lastPayloadRef.current = payload;
      toast.success(SCHEDULE_PAGE.toasts.createSuccess);

      // This exam may span other classes too — offer to copy the same schedule to them
      try {
        const submittedExam = await ExamsService.getById(values.exam_id);
        const otherClassIds = submittedExam.class_ids.filter((cid) => cid !== values.class_id);
        if (otherClassIds.length > 0) {
          setPendingSiblings(otherClassIds.map((classId) => ({ classId })));
          return; // Stay on page to show copy dialog
        }
      } catch {
        // Non-fatal — just navigate away
      }
      router.push(EXAM_ROUTES.schedule.list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  });

  async function copyToSiblings(selectedClassIds: string[]) {
    const payload = lastPayloadRef.current;
    if (!payload || selectedClassIds.length === 0) {
      router.push(EXAM_ROUTES.schedule.list);
      return;
    }
    setIsCopyingToSiblings(true);
    try {
      // Remap subject_ids by name against the school's subject list (once, shared across classes)
      const subjectsRes = await SubjectsService.list({ limit: 100 });
      const subjectByName: Record<string, string> = {};
      subjectsRes.items.forEach((s) => { subjectByName[s.name.toLowerCase()] = s.id; });

      await Promise.all(
        selectedClassIds.map(async (classId) => {
          const siblingSchedules = payload.schedules.map((s) => ({
            ...s,
            subject_id: subjectByName[s.subject_name.toLowerCase()] ?? s.subject_id,
          }));

          await ExamScheduleService.bulkCreate({
            ...payload,
            class_id: classId,
            schedules: siblingSchedules,
          });
        }),
      );
      toast.success(`Schedule copied to ${selectedClassIds.length} more class${selectedClassIds.length > 1 ? "es" : ""}`);
      router.push(EXAM_ROUTES.schedule.list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to copy schedule");
    } finally {
      setIsCopyingToSiblings(false);
    }
  }

  function dismissSiblingCopy() {
    setPendingSiblings([]);
    router.push(EXAM_ROUTES.schedule.list);
  }

  function addScheduleRow() {
    schedulesField.append({ ...defaultScheduleItem });
  }

  function removeScheduleRow(index: number) {
    schedulesField.remove(index);
  }

  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  async function loadAllSubjects() {
    setIsLoadingSubjects(true);
    try {
      const res = await SubjectsService.list({ limit: 100 });
      const rows = res.items.map((s) => ({
        ...defaultScheduleItem,
        subject_id: s.id,
        subject_name: s.name,
      }));
      if (rows.length === 0) {
        toast.error("No subjects found");
        return 0;
      }
      schedulesField.replace(rows);
      toast.success(`${rows.length} subjects loaded`);
      return rows.length;
    } catch {
      toast.error("Failed to load subjects");
      return 0;
    } finally {
      setIsLoadingSubjects(false);
    }
  }

  function applyToAll(field: "exam_date" | "start_time" | "end_time" | "exam_marks" | "passing_marks", value: string | number) {
    schedulesField.fields.forEach((_, i) => {
      form.setValue(`schedules.${i}.${field}` as any, value as any);
    });
  }

  return {
    form,
    schedulesField,
    isSubmitting,
    isLoadingSubjects,
    onSubmit,
    addScheduleRow,
    removeScheduleRow,
    loadAllSubjects,
    applyToAll,
    defaultScheduleItem,
    pendingSiblings,
    isCopyingToSiblings,
    copyToSiblings,
    dismissSiblingCopy,
  };
}

// ── View / Edit single schedule ───────────────────────────────────────────────

const singleScheduleSchema = z.object({
  subject_name: z.string().min(1, "Required"),
  subject_type: z.enum(["MAIN_EXAM", "SECONDARY_EXAM", "PRACTICAL_EXAM", "ORAL_EXAM"] as const).optional(),
  exam_date: z.string().min(1, "Required"),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "HH:mm format"),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "HH:mm format"),
  exam_marks: z.coerce.number().int().min(0),
  passing_marks: z.coerce.number().int().min(0),
  hall_detail_id: z.string().optional(),
  sub_subject_enabled: z.boolean().optional(),
});

type SingleScheduleInput = z.input<typeof singleScheduleSchema>;
type SingleScheduleValues = z.infer<typeof singleScheduleSchema>;

export function useExamScheduleEdit(id: string | null) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedule, setSchedule] = useState<ExamSchedule | null>(null);
  const [subSchedules, setSubSchedules] = useState<ExamSchedule[]>([]);

  const form = useForm<SingleScheduleInput, unknown, SingleScheduleValues>({
    resolver: zodResolver(singleScheduleSchema) as any,
    defaultValues: {
      subject_name: "",
      subject_type: "MAIN_EXAM",
      exam_date: "",
      start_time: "",
      end_time: "",
      exam_marks: 100,
      passing_marks: 35,
      hall_detail_id: "",
      sub_subject_enabled: false,
    },
  });

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    ExamScheduleService.getById(id)
      .then(({ schedule: s, subSchedules: subs }) => {
        setSchedule(s);
        setSubSchedules(subs);
        form.reset({
          subject_name: s.subject_name,
          subject_type: s.subject_type,
          exam_date: s.exam_date,
          start_time: s.start_time?.slice(0, 5) ?? "",
          end_time: s.end_time?.slice(0, 5) ?? "",
          exam_marks: s.exam_marks,
          passing_marks: s.passing_marks,
          hall_detail_id: s.hall_detail_id ?? "",
          sub_subject_enabled: s.sub_subject_enabled,
        });
      })
      .catch(() => toast.error(SCHEDULE_PAGE.toasts.fetchError))
      .finally(() => setIsLoading(false));
  }, [id]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await ExamScheduleService.update(id, {
        ...values,
        hall_detail_id: values.hall_detail_id || undefined,
      });
      toast.success(SCHEDULE_PAGE.toasts.updateSuccess);
      router.push(EXAM_ROUTES.schedule.list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  });

  return { form, schedule, subSchedules, isLoading, isSubmitting, onSubmit };
}
