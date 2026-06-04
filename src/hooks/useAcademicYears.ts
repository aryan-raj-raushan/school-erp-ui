'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AcademicYearsService, type CreateAcademicYearPayload, type UpdateAcademicYearPayload } from '@/services/academic-years.service';
import type { AcademicYear, PaginationMeta } from '@/types';

const academicYearSchema = z.object({
  name: z.string().min(1, 'Name required'),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().min(1, 'End date required'),
});

export type AcademicYearFormValues = z.infer<typeof academicYearSchema>;

export function useAcademicYears() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const form = useForm<AcademicYearFormValues>({ resolver: zodResolver(academicYearSchema) });
  const editForm = useForm<AcademicYearFormValues>({ resolver: zodResolver(academicYearSchema) });

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
    try {
      const payload: CreateAcademicYearPayload = {
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
        // Never set is_current on create — use "Set as Current" button
        is_current: false,
      };
      const year = await AcademicYearsService.create(payload);
      toast.success(`${year.name} created`);
      await fetchYears();
      setShowModal(false);
      form.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create academic year');
    }
  }

  async function updateYear(values: AcademicYearFormValues) {
    if (!editingYear) return;
    try {
      const payload: UpdateAcademicYearPayload = {
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
      };
      await AcademicYearsService.update(editingYear.id, payload);
      toast.success('Academic year updated');
      await fetchYears();
      setShowEditModal(false);
      setEditingYear(null);
      editForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update academic year');
    }
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

  function openEditModal(year: AcademicYear) {
    setEditingYear(year);
    editForm.reset({ name: year.name, start_date: year.start_date, end_date: year.end_date });
    setShowEditModal(true);
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
    showEditModal,
    openEditModal,
    closeEditModal: () => { setShowEditModal(false); setEditingYear(null); editForm.reset(); },
    editingYear,
    form,
    editForm,
    handleSubmit: form.handleSubmit(createYear),
    handleEditSubmit: editForm.handleSubmit(updateYear),
    isSubmitting: form.formState.isSubmitting,
    isEditSubmitting: editForm.formState.isSubmitting,
    setCurrent,
    refetch: fetchYears,
  };
}
