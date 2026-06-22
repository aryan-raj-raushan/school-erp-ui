"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { HallPlanService, HallDetailService } from "@/services/exam.service";
import type { ExamHallPlan, ExamHallDetail } from "@/types/exam.types";
import type { PaginationMeta } from "@/types";
import { HALL_PLANS_PAGE, HALL_DETAILS_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

// ── Schemas ───────────────────────────────────────────────────────────────────

export const hallPlanSchema = z.object({
  plan_name: z.string().min(1, "Plan name is required").max(150),
  description: z.string().max(300).optional(),
  is_enabled: z.boolean().optional(),
});

export const hallDetailSchema = z.object({
  hall_plan_id: z.string().uuid("Select a hall plan"),
  room_name: z.string().min(1, "Room name is required").max(150),
  sitting_capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  is_enabled: z.boolean().optional(),
});

export type HallPlanFormValues = z.infer<typeof hallPlanSchema>;
export type HallDetailFormValues = z.infer<typeof hallDetailSchema>;

// ── Hall Plan List ────────────────────────────────────────────────────────────

export function useHallPlans() {
  const [plans, setPlans] = useState<ExamHallPlan[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await HallPlanService.list({ limit: 50 });
      setPlans(result.items);
      setPagination(result.pagination);
    } catch {
      toast.error(HALL_PLANS_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function remove(id: string) {
    try {
      await HallPlanService.remove(id);
      toast.success(HALL_PLANS_PAGE.toasts.deleteSuccess);
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return { plans, pagination, isLoading, remove, refetch: fetch };
}

// ── Hall Plan Detail ──────────────────────────────────────────────────────────

export function useHallPlanDetail(id: string) {
  const router = useRouter();
  const isNew = id === "create-new";

  const [plan, setPlan] = useState<ExamHallPlan | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HallPlanFormValues>({
    resolver: zodResolver(hallPlanSchema),
    defaultValues: { plan_name: "", description: "", is_enabled: true },
  });

  useEffect(() => {
    if (isNew) return;
    setIsLoading(true);
    HallPlanService.getById(id)
      .then((data) => {
        setPlan(data);
        form.reset({ plan_name: data.plan_name, description: data.description ?? "", is_enabled: data.is_enabled });
      })
      .catch(() => toast.error(HALL_PLANS_PAGE.toasts.fetchError))
      .finally(() => setIsLoading(false));
  }, [id, isNew, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (isNew) {
        await HallPlanService.create(values);
        toast.success(HALL_PLANS_PAGE.toasts.createSuccess);
      } else {
        await HallPlanService.update(id, values);
        toast.success(HALL_PLANS_PAGE.toasts.updateSuccess);
      }
      router.push(EXAM_ROUTES.hallPlans.list);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  });

  return { plan, isLoading, isNew, isEditing, setIsEditing, form, isSubmitting, onSubmit };
}

// ── Hall Details List ─────────────────────────────────────────────────────────

export function useHallDetails(hallPlanId?: string) {
  const [details, setDetails] = useState<ExamHallDetail[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await HallDetailService.list({ hall_plan_id: hallPlanId, limit: 100 });
      setDetails(result.items);
      setPagination(result.pagination);
    } catch {
      toast.error(HALL_DETAILS_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [hallPlanId]);

  useEffect(() => { fetch(); }, [fetch]);

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

export function useHallDetailForm(id: string, defaultPlanId?: string) {
  const router = useRouter();
  const isNew = id === "create-new";

  const [detail, setDetail] = useState<ExamHallDetail | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HallDetailFormValues>({
    resolver: zodResolver(hallDetailSchema),
    defaultValues: { hall_plan_id: defaultPlanId ?? "", room_name: "", sitting_capacity: 30, is_enabled: true },
  });

  useEffect(() => {
    if (isNew) return;
    setIsLoading(true);
    HallDetailService.getById(id)
      .then((data) => {
        setDetail(data);
        form.reset({ hall_plan_id: data.hall_plan_id, room_name: data.room_name, sitting_capacity: data.sitting_capacity, is_enabled: data.is_enabled });
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

  return { detail, isLoading, isNew, isEditing, setIsEditing, form, isSubmitting, onSubmit };
}