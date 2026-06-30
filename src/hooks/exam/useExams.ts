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
    class_ids: z
      .array(z.string().uuid())
      .min(1, "Select at least one class"),
    exam_name: z.string().min(1, "Exam name is required").max(150),
    exam_term: z.enum(["TERM1", "TERM2", "TERM3", "ANNUAL"] as const),
    start_date: z.string().min(1, "Start date required").date("Start date must be valid"),
    end_date: z.string().min(1, "End date required").date("End date must be valid"),
    include_in_marks: z.boolean().optional(),
    is_enabled: z.boolean().optional(),
  })
  .refine((d) => d.end_date > d.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  })
  .refine((d) => new Date(d.start_date) >= new Date(), {
    message: "Start date cannot be in the past",
    path: ["start_date"],
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
  // All sibling exam records (same name+term+year, different classes) in edit mode
  const [siblingExams, setSiblingExams] = useState<Exam[]>([]);

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      academic_year_id: "",
      class_ids: [],
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
      .then(async (data) => {
        setExam(data);
        // Load all sibling exams (same name+term+year) so edit reflects full group
        const allRes = await ExamsService.list({
          academic_year_id: data.academic_year_id,
          limit: 200,
        });
        const siblings = allRes.items.filter(
          (e) => e.exam_name === data.exam_name && e.exam_term === data.exam_term,
        );
        setSiblingExams(siblings);
        form.reset({
          academic_year_id: data.academic_year_id,
          class_ids: siblings.map((e) => e.class_id),
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
        const { class_ids, ...rest } = values;
        await Promise.all(
          class_ids.map((class_id) =>
            ExamsService.create({ ...rest, class_id })
          )
        );
        toast.success(
          class_ids.length > 1
            ? `${class_ids.length} exams created successfully`
            : EXAMS_PAGE.toasts.createSuccess
        );
      } else {
        const { class_ids, ...rest } = values;
        const existingClassIds = siblingExams.map((e) => e.class_id);
        const newClassIds = class_ids.filter((cid) => !existingClassIds.includes(cid));
        const removedClassIds = existingClassIds.filter((cid) => !class_ids.includes(cid));

        // Update all existing sibling records with shared fields
        await Promise.all(
          siblingExams
            .filter((e) => !removedClassIds.includes(e.class_id))
            .map((e) => ExamsService.update(e.id, { ...rest, class_id: e.class_id })),
        );

        // Create records for newly added classes
        if (newClassIds.length > 0) {
          await Promise.all(
            newClassIds.map((class_id) =>
              ExamsService.create({ ...rest, class_id }),
            ),
          );
        }

        // Soft-delete removed classes
        if (removedClassIds.length > 0) {
          const toDelete = siblingExams.filter((e) => removedClassIds.includes(e.class_id));
          await Promise.all(toDelete.map((e) => ExamsService.remove(e.id)));
        }

        const msg =
          newClassIds.length > 0
            ? `Updated + added ${newClassIds.length} class${newClassIds.length > 1 ? "es" : ""}`
            : EXAMS_PAGE.toasts.updateSuccess;
        toast.success(msg);
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
    siblingExams,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
  };
}