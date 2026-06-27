"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { HallDetailService } from "@/services/exam.service";
import type { ExamHallDetail } from "@/types/exam.types";
import type { PaginationMeta } from "@/types";
import {
  HALL_DETAILS_PAGE,
  EXAM_ROUTES,
} from "@/constants/exam.constants";

// ── Schemas ───────────────────────────────────────────────────────────────────

export const hallDetailSchema = z
  .object({
    room_name: z.string().min(1, "Room name is required").max(150),
    // Grid mode: rows × cols auto-computes capacity
    grid_rows: z.coerce.number().int().min(1).optional().or(z.literal("")),
    grid_cols: z.coerce.number().int().min(1).optional().or(z.literal("")),
    // Manual capacity — required when grid not provided
    sitting_capacity: z.coerce.number().int().min(0).optional(),
    is_enabled: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    const hasGrid = val.grid_rows && val.grid_cols;
    if (!hasGrid && (!val.sitting_capacity || val.sitting_capacity < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sitting_capacity"],
        message: "Enter capacity or define a grid (rows × cols)",
      });
    }
  })
  .transform((val) => {
    const rows = val.grid_rows ? Number(val.grid_rows) : undefined;
    const cols = val.grid_cols ? Number(val.grid_cols) : undefined;
    const capacity = rows && cols ? rows * cols : Number(val.sitting_capacity ?? 0);
    return {
      room_name: val.room_name,
      grid_rows: rows,
      grid_cols: cols,
      sitting_capacity: capacity,
      is_enabled: val.is_enabled,
    };
  });

export type HallDetailFormInput = z.input<typeof hallDetailSchema>;
export type HallDetailFormValues = z.output<typeof hallDetailSchema>;

// ── Hall Details List ─────────────────────────────────────────────────────────

export function useHallDetails() {
  const [details, setDetails] = useState<ExamHallDetail[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await HallDetailService.list();
      setDetails(result.items);
      setPagination(result.pagination);
    } catch {
      toast.error(HALL_DETAILS_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function remove(id: string) {
    try {
      await HallDetailService.remove(id);
      toast.success(HALL_DETAILS_PAGE.toasts.deleteSuccess);
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return { details, pagination, isLoading, remove, refetch: fetch };
}

// ── Hall Detail Form ──────────────────────────────────────────────────────────

export function useHallDetailForm(id: string) {
  const router = useRouter();
  const isNew = id === "create-new";

  const [detail, setDetail] = useState<ExamHallDetail | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HallDetailFormInput, unknown, HallDetailFormValues>({
    resolver: zodResolver(hallDetailSchema),
    defaultValues: {
      room_name: "",
      grid_rows: "" as unknown as number,
      grid_cols: "" as unknown as number,
      sitting_capacity: undefined,
      is_enabled: true,
    },
  });

  useEffect(() => {
    if (isNew) return;
    setIsLoading(true);
    HallDetailService.getById(id)
      .then((data) => {
        setDetail(data);
        form.reset({
          room_name: data.room_name,
          grid_rows: data.grid_rows ?? ("" as unknown as number),
          grid_cols: data.grid_cols ?? ("" as unknown as number),
          sitting_capacity: data.grid_rows && data.grid_cols ? undefined : data.sitting_capacity,
          is_enabled: data.is_enabled,
        });
      })
      .catch(() => toast.error(HALL_DETAILS_PAGE.toasts.fetchError))
      .finally(() => setIsLoading(false));
  }, [id, isNew, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (isNew) {
        await HallDetailService.create(values);
        toast.success(HALL_DETAILS_PAGE.toasts.createSuccess);
      } else {
        await HallDetailService.update(id, values);
        toast.success(HALL_DETAILS_PAGE.toasts.updateSuccess);
      }
      router.push(EXAM_ROUTES.hallDetails.list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    detail,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
  };
}
