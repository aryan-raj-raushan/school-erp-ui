'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { SubscriptionsService, type CreateSubscriptionPayload } from '@/services/subscriptions.service';
import type { Subscription, PaginationMeta } from '@/types';

const toOptionalNumber = z.preprocess(
  (v) => (v === '' || v == null ? undefined : Number(v)),
  z.number().optional(),
);

const subscriptionSchema = z.object({
  school_id: z.string().min(1, 'School required'),
  plan_name: z.string().min(1, 'Plan name required'),
  plan_type: z.enum(['MONTHLY', 'ANNUAL', 'LIFETIME', 'TRIAL']),
  amount: z.preprocess((v) => (v === '' || v == null ? 0 : Number(v)), z.number().min(0, 'Amount required')),
  currency: z.string().default('INR'),
  max_students: toOptionalNumber,
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_trial: z.boolean().default(false),
  auto_renew: z.boolean().default(false),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export function useSubscriptions(schoolId?: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema) as any,
    defaultValues: { school_id: schoolId ?? '', plan_type: 'MONTHLY', currency: 'INR', is_trial: false, auto_renew: false },
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

  async function createSubscription(values: SubscriptionFormValues) {
    const payload: CreateSubscriptionPayload = {
      school_id: values.school_id,
      plan_name: values.plan_name,
      plan_type: values.plan_type,
      amount: values.amount,
      currency: values.currency,
      ...(values.max_students && { max_students: values.max_students }),
      ...(values.start_date && { start_date: values.start_date }),
      ...(values.end_date && { end_date: values.end_date }),
      is_trial: values.is_trial,
      auto_renew: values.auto_renew,
    };
    const sub = await SubscriptionsService.create(payload);
    toast.success(`Subscription "${sub.plan_name}" created`);
    await fetchSubscriptions();
    setShowModal(false);
    form.reset();
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

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  return {
    subscriptions, pagination, isLoading,
    showModal,
    openModal: () => setShowModal(true),
    closeModal: () => { setShowModal(false); form.reset(); },
    form,
    handleSubmit: form.handleSubmit(createSubscription),
    isSubmitting: form.formState.isSubmitting,
    cancelSubscription,
    refetch: fetchSubscriptions,
  };
}
