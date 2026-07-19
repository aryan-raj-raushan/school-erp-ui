'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  SubscriptionPlansService,
  type SubscriptionPlanFilters,
  type CreateSubscriptionPlanPayload,
} from '@/services/subscription-plans.service';
import {
  createSubscriptionPlanSchema,
  type CreateSubscriptionPlanFormValues,
} from '@/lib/validations/subscription-plans.validation';
import type { PaginationMeta, SubscriptionPlan } from '@/types';

export function useSubscriptionPlans(initialFilters: SubscriptionPlanFilters = {}) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<SubscriptionPlanFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const createForm = useForm<CreateSubscriptionPlanFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createSubscriptionPlanSchema) as any,
    defaultValues: { billing_model: 'FLAT', billing_cycle: 'MONTHLY', is_active: true },
  });

  const fetchPlans = useCallback(async (overrideFilters?: SubscriptionPlanFilters) => {
    setIsLoading(true);
    try {
      const result = await SubscriptionPlansService.list(overrideFilters ?? filters);
      setPlans(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function handleCreateSubmit(values: CreateSubscriptionPlanFormValues) {
    const payload: CreateSubscriptionPlanPayload = {
      name: values.name,
      billing_model: values.billing_model,
      billing_cycle: values.billing_cycle,
      is_active: values.is_active,
      ...(values.flat_amount != null && { flat_amount: values.flat_amount }),
      ...(values.price_per_student != null && { price_per_student: values.price_per_student }),
    };
    try {
      const plan = await SubscriptionPlansService.create(payload);
      toast.success(`${plan.name} created`);
      await fetchPlans();
      setShowCreateModal(false);
      createForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create plan');
    }
  }

  async function toggleActive(plan: SubscriptionPlan) {
    try {
      await SubscriptionPlansService.update(plan.id, { is_active: !plan.is_active });
      await fetchPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update plan');
    }
  }

  function openCreateModal() {
    createForm.reset({ billing_model: 'FLAT', billing_cycle: 'MONTHLY', is_active: true });
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    createForm.reset();
  }

  function updateFilters(next: Partial<SubscriptionPlanFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return {
    plans, pagination, filters, isLoading,
    showCreateModal, openCreateModal, closeCreateModal,
    createForm,
    handleCreateSubmit: createForm.handleSubmit(handleCreateSubmit),
    isCreating: createForm.formState.isSubmitting,
    toggleActive,
    updateFilters,
  };
}
