"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ExamGradingService } from "@/services/exam.service";
import type { ExamGrading } from "@/types/exam.types";
import { GRADING_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

// ── Schema ────────────────────────────────────────────────────────────────────

export const gradingSchema = z.object({
  grade_name: z.string().min(1, "Grade name is required").max(20),
  from_percentage: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, {
      message: "Must be 0–100",
    }),
  to_percentage: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, {
      message: "Must be 0–100",
    }),
  sequence_index: z.coerce.number().int().min(0).optional(),
  description: z.string().max(200).optional(),
  is_enabled: z.boolean().optional(),
});

// export type GradingFormValues = z.infer<typeof gradingSchema>;
export type GradingFormValues = z.input<typeof gradingSchema>;

type GradingFormInput = z.input<typeof gradingSchema>;
type GradingFormOutput = z.output<typeof gradingSchema>;

// ── List Hook ─────────────────────────────────────────────────────────────────

export function useExamGrading() {
  const [grades, setGrades] = useState<ExamGrading[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ExamGradingService.list();
      setGrades(data);
    } catch {
      toast.error(GRADING_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function remove(id: string) {
    try {
      await ExamGradingService.remove(id);
      toast.success(GRADING_PAGE.toasts.deleteSuccess);
      await fetch();
    } catch {
      toast.error(GRADING_PAGE.toasts.deleteError);
    }
  }

  return { grades, isLoading, refetch: fetch, remove };
}

// ── Detail / Form Hook ────────────────────────────────────────────────────────

export function useExamGradingDetail(id: string) {
  const router = useRouter();
  const isNew = id === "create-new";

  const [grade, setGrade] = useState<ExamGrading | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GradingFormInput, unknown, GradingFormOutput>({
    resolver: zodResolver(gradingSchema),
    defaultValues: {
      grade_name: "",
      from_percentage: "",
      to_percentage: "",
      sequence_index: 0,
      description: "",
      is_enabled: true,
    },
  });

  useEffect(() => {
    if (isNew) return;
    setIsLoading(true);
    ExamGradingService.getById(id)
      .then((data) => {
        setGrade(data);
        form.reset({
          grade_name: data.grade_name,
          from_percentage: data.from_percentage,
          to_percentage: data.to_percentage,
          sequence_index: data.sequence_index,
          description: data.description ?? "",
          is_enabled: data.is_enabled,
        });
      })
      .catch(() => toast.error(GRADING_PAGE.toasts.fetchError))
      .finally(() => setIsLoading(false));
  }, [id, isNew, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (isNew) {
        await ExamGradingService.create(values);
        toast.success(GRADING_PAGE.toasts.createSuccess);
      } else {
        await ExamGradingService.update(id, values);
        toast.success(GRADING_PAGE.toasts.updateSuccess);
      }
      router.push(EXAM_ROUTES.grading.list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    grade,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
  };
}
