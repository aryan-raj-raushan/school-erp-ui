"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ExamGradingService } from "@/services/exam.service";
import type { ExamGrading } from "@/types/exam.types";
import { GRADING_PAGE, EXAM_ROUTES, DEFAULT_GRADE_BANDS } from "@/constants/exam.constants";

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

// ── Bulk Create Hook ──────────────────────────────────────────────────────────

const defaultGradeRow: GradingFormInput = {
  grade_name: "",
  from_percentage: "",
  to_percentage: "",
  sequence_index: 0,
  description: "",
  is_enabled: true,
};

const bulkGradingFormSchema = z.object({
  grades: z.array(gradingSchema).min(1, "Add at least one grade"),
});

export function useExamGradingBulkForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<{ grades: GradingFormInput[] }, unknown, { grades: GradingFormOutput[] }>({
    resolver: zodResolver(bulkGradingFormSchema) as any,
    defaultValues: { grades: [{ ...defaultGradeRow }] },
  });

  const gradesField = useFieldArray({ control: form.control, name: "grades" });

  function addGradeRow() {
    gradesField.append({ ...defaultGradeRow, sequence_index: gradesField.fields.length });
  }

  function removeGradeRow(index: number) {
    gradesField.remove(index);
  }

  /** Fills the rows with a standard grade scale — fully editable before submit. */
  function autoGenerate() {
    gradesField.replace(
      DEFAULT_GRADE_BANDS.map((band, i) => ({
        grade_name: band.grade_name,
        from_percentage: band.from_percentage,
        to_percentage: band.to_percentage,
        sequence_index: i,
        description: "",
        is_enabled: true,
      })),
    );
    toast.success(`${DEFAULT_GRADE_BANDS.length} default grade bands loaded — review and save`);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await ExamGradingService.bulkCreate(values.grades);
      toast.success(GRADING_PAGE.toasts.bulkCreateSuccess);
      router.push(EXAM_ROUTES.grading.list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    gradesField,
    isSubmitting,
    onSubmit,
    addGradeRow,
    removeGradeRow,
    autoGenerate,
  };
}

// ── Detail / Form Hook (view/edit an existing grade) ─────────────────────────

export function useExamGradingDetail(id: string) {
  const router = useRouter();

  const [grade, setGrade] = useState<ExamGrading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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
  }, [id, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await ExamGradingService.update(id, values);
      toast.success(GRADING_PAGE.toasts.updateSuccess);
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
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
  };
}
