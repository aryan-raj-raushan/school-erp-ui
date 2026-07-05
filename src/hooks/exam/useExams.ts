"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

  // Callers commonly re-derive the filters object from external state (e.g.
  // `useExams(academicYearId ? { academic_year_id: academicYearId } : {})`)
  // expecting the list to refetch when that state changes. Since useState's
  // initializer only runs once, that re-derived object is otherwise ignored
  // after mount — sync it in whenever its content actually changes.
  const initialFiltersKey = JSON.stringify(initialFilters);
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setFilters(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiltersKey]);

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
    if (!confirm(EXAMS_PAGE.confirmDelete)) return;
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
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

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
      .then((data) => {
        setExam(data);
        form.reset({
          academic_year_id: data.academic_year_id,
          class_ids: data.class_ids,
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

  const watchedAcademicYearId = form.watch("academic_year_id");
  const watchedClassIds = form.watch("class_ids");
  const watchedStartDate = form.watch("start_date");
  const watchedEndDate = form.watch("end_date");

  // Client-side heads-up for the same overlap check the backend enforces on submit —
  // lets the user fix the date/class clash before hitting save instead of after.
  useEffect(() => {
    if (
      !watchedAcademicYearId ||
      !watchedClassIds?.length ||
      !watchedStartDate ||
      !watchedEndDate ||
      watchedEndDate <= watchedStartDate
    ) {
      setOverlapWarning(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { items } = await ExamsService.list({
          academic_year_id: watchedAcademicYearId,
          limit: 1000,
        });
        if (cancelled) return;
        const classIdSet = new Set(watchedClassIds);
        const conflict = items.find(
          (e) =>
            e.id !== id &&
            e.class_ids.some((cid) => classIdSet.has(cid)) &&
            e.start_date <= watchedEndDate &&
            e.end_date >= watchedStartDate,
        );
        setOverlapWarning(
          conflict
            ? `Exam dates overlap with "${conflict.exam_name}" (${conflict.start_date} to ${conflict.end_date}) for a shared class — adjust the dates or classes.`
            : null,
        );
      } catch {
        // Ignore — backend will still reject an overlapping save.
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [watchedAcademicYearId, watchedClassIds, watchedStartDate, watchedEndDate, id]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (overlapWarning) {
      toast.error(overlapWarning);
      return;
    }
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
    setExam,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
    overlapWarning,
  };
}