"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ExamsService } from "@/services/exam.service";
import type { Exam, ExamFilters, ExamTerm } from "@/types/exam.types";
import type { PaginationMeta } from "@/types";
import { EXAMS_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

// ── Schema ────────────────────────────────────────────────────────────────────

export const examSchema = z
  .object({
    academic_year_id: z.string().uuid("Required"),
    class_id: z.string().uuid("Required"),
    exam_name: z.string().min(1, "Exam name is required").max(150),
    exam_term: z.enum(["TERM1", "TERM2", "TERM3", "ANNUAL"] as const),
    start_date: z.string().min(1, "Start date required"),
    end_date: z.string().min(1, "End date required"),
    include_in_marks: z.boolean().optional(),
    is_enabled: z.boolean().optional(),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export type ExamFormValues = z.infer<typeof examSchema>;

// ── List Hook ─────────────────────────────────────────────────────────────────

export function useExams(initialFilters: ExamFilters = {}) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<ExamFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ExamsService.list(filters);
      setExams(result.items);
      setPagination(result.pagination);
    } catch {
      toast.error(EXAMS_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  function updateFilters(next: Partial<ExamFilters>) {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }

  async function remove(id: string) {
    try {
      await ExamsService.remove(id);
      toast.success(EXAMS_PAGE.toasts.deleteSuccess);
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function togglePublish(id: string, publish: boolean) {
    try {
      await ExamsService.publish(id, publish);
      toast.success(
        publish
          ? EXAMS_PAGE.toasts.publishSuccess
          : EXAMS_PAGE.toasts.unpublishSuccess
      );
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  return {
    exams,
    pagination,
    filters,
    isLoading,
    updateFilters,
    remove,
    togglePublish,
    refetch: fetch,
  };
}

// ── Detail / Form Hook ────────────────────────────────────────────────────────

export function useExamDetail(id: string) {
  const router = useRouter();
  const isNew = id === "create-new";

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      academic_year_id: "",
      class_id: "",
      exam_name: "",
      exam_term: "TERM1",
      start_date: "",
      end_date: "",
      include_in_marks: true,
      is_enabled: true,
    },
  });

  useEffect(() => {
    if (isNew) return;
    setIsLoading(true);
    ExamsService.getById(id)
      .then((data) => {
        setExam(data);
        form.reset({
          academic_year_id: data.academic_year_id,
          class_id: data.class_id,
          exam_name: data.exam_name,
          exam_term: data.exam_term as ExamTerm,
          start_date: data.start_date,
          end_date: data.end_date,
          include_in_marks: data.include_in_marks,
          is_enabled: data.is_enabled,
        });
      })
      .catch(() => toast.error(EXAMS_PAGE.toasts.fetchError))
      .finally(() => setIsLoading(false));
  }, [id, isNew, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (isNew) {
        await ExamsService.create(values);
        toast.success(EXAMS_PAGE.toasts.createSuccess);
      } else {
        await ExamsService.update(id, values);
        toast.success(EXAMS_PAGE.toasts.updateSuccess);
      }
      router.push(EXAM_ROUTES.exams.list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    exam,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
  };
}