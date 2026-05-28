'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AcademicYearsService, type CreateAcademicYearPayload } from '@/services/academic-years.service';
import type { AcademicYear, PaginationMeta } from '@/types';

const academicYearSchema = z.object({
  name: z.string().min(1, 'Name required'),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().min(1, 'End date required'),
  is_current: z.boolean().optional(),
});

export type AcademicYearFormValues = z.infer<typeof academicYearSchema>;

export function useAcademicYears() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const form = useForm<AcademicYearFormValues>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: { is_current: false },
  });

  const fetchYears = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await AcademicYearsService.list();
      setYears(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load academic years');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function createYear(values: AcademicYearFormValues) {
    const payload: CreateAcademicYearPayload = {
      name: values.name,
      start_date: values.start_date,
      end_date: values.end_date,
      is_current: values.is_current,
    };
    const year = await AcademicYearsService.create(payload);
    toast.success(`${year.name} created`);
    await fetchYears();
    setShowModal(false);
    form.reset();
  }

  async function setCurrent(id: string) {
    try {
      await AcademicYearsService.setCurrent(id);
      toast.success('Current academic year updated');
      await fetchYears();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    }
  }

  useEffect(() => { fetchYears(); }, [fetchYears]);

  return {
    years,
    currentYear: years.find((y) => y.is_current) ?? null,
    pagination,
    isLoading,
    showModal,
    openModal: () => setShowModal(true),
    closeModal: () => { setShowModal(false); form.reset(); },
    form,
    handleSubmit: form.handleSubmit(createYear),
    isSubmitting: form.formState.isSubmitting,
    setCurrent,
    refetch: fetchYears,
  };
}
