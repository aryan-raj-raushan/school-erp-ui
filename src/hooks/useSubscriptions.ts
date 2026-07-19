'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { SubscriptionsService, type CreateSubscriptionPayload } from '@/services/subscriptions.service';
import { SubscriptionPlansService } from '@/services/subscription-plans.service';
import {
  createSubscriptionSchema,
  type CreateSubscriptionFormValues,
} from '@/lib/validations/subscriptions.validation';
import type { Subscription, PaginationMeta, SubscriptionPlan } from '@/types';

export type { CreateSubscriptionFormValues as SubscriptionFormValues };

export function useSubscriptions(schoolId?: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const form = useForm<CreateSubscriptionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createSubscriptionSchema) as any,
    defaultValues: {
      school_id: schoolId ?? '',
      currency: 'INR',
      is_trial: false,
      auto_renew: false,
      restriction_mode: 'NONE',
      restricted_resources: [],
      payment_methods_allowed: [],
    },
  });

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SubscriptionsService.list(schoolId ? { school_id: schoolId } : {});
      setSubscriptions(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  const fetchPlans = useCallback(async () => {
    try {
      const result = await SubscriptionPlansService.list({ is_active: true, limit: 100 });
      setPlans(result.items);
    } catch {
      // Plan catalog is optional for assignment (custom plans remain available)
    }
  }, []);

  async function createSubscription(values: CreateSubscriptionFormValues) {
    const payload: CreateSubscriptionPayload = {
      school_id: values.school_id,
      ...(values.plan_id && { plan_id: values.plan_id }),
      ...(!values.plan_id && values.plan_name && { plan_name: values.plan_name }),
      ...(!values.plan_id && values.plan_type && { plan_type: values.plan_type }),
      ...(!values.plan_id && values.billing_model && { billing_model: values.billing_model }),
      ...(!values.plan_id && values.amount != null && { amount: values.amount }),
      ...(!values.plan_id && values.price_per_student != null && { price_per_student: values.price_per_student }),
      currency: values.currency,
      ...(values.max_students && { max_students: values.max_students }),
      ...(values.start_date && { start_date: values.start_date }),
      ...(values.end_date && { end_date: values.end_date }),
      is_trial: values.is_trial,
      auto_renew: values.auto_renew,
      ...(values.grace_period_days != null && { grace_period_days: values.grace_period_days }),
      restriction_mode: values.restriction_mode,
      restricted_resources: values.restricted_resources,
      payment_methods_allowed: values.payment_methods_allowed,
    };
    try {
      const sub = await SubscriptionsService.create(payload);
      toast.success(`Subscription "${sub.plan_name}" created`);
      await fetchSubscriptions();
      setShowModal(false);
      form.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create subscription');
    }
  }

  async function cancelSubscription(id: string, reason?: string) {
    try {
      await SubscriptionsService.cancel(id, reason);
      toast.success('Subscription cancelled');
      await fetchSubscriptions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel');
    }
  }

  function toggleArrayValue(field: 'restricted_resources' | 'payment_methods_allowed', value: string) {
    const current = form.getValues(field) ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    form.setValue(field, next, { shouldDirty: true });
  }

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);
  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return {
    subscriptions, pagination, isLoading,
    plans,
    showModal,
    openModal: () => setShowModal(true),
    closeModal: () => { setShowModal(false); form.reset(); },
    form,
    handleSubmit: form.handleSubmit(createSubscription),
    isSubmitting: form.formState.isSubmitting,
    cancelSubscription,
    toggleArrayValue,
    refetch: fetchSubscriptions,
  };
}
