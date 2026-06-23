"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ExamScheduleService } from "@/services/exam.service";
import type { ExamSchedule, ScheduleFilters } from "@/types/exam.types";
import type { PaginationMeta } from "@/types";
import { SCHEDULE_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

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

  const form = useForm<ScheduleFormInput, unknown, ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      exam_id: "",
      academic_year_id: "",
      class_id: "",
      schedules: [defaultScheduleItem],
    },
  });

  const schedulesField = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    console.log("Valyes: ", values);
    setIsSubmitting(true);
    try {
      await ExamScheduleService.bulkCreate(values);
      toast.success(SCHEDULE_PAGE.toasts.createSuccess);
      router.push(EXAM_ROUTES.schedule.list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  });

  function addScheduleRow() {
    schedulesField.append({ ...defaultScheduleItem });
  }

  function removeScheduleRow(index: number) {
    schedulesField.remove(index);
  }

  return {
    form,
    schedulesField,
    isSubmitting,
    onSubmit,
    addScheduleRow,
    removeScheduleRow,
    defaultScheduleItem,
  };
}
