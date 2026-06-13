'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { DepartmentsService } from '@/services/departments.service';
import { ROUTES } from '@/constants';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  address: z.string().max(255).optional(),
  description: z.string().optional(),
  is_active: z.boolean(),
});

export type EditDepartmentFormValues = z.infer<typeof schema>;

export function useEditDepartment(id: string) {
  const router = useRouter();
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<EditDepartmentFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { is_active: true },
  });

  const fetchDepartment = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const dept = await DepartmentsService.getById(id);
      form.reset({
        name: dept.name,
        address: dept.address ?? '',
        description: dept.description ?? '',
        is_active: dept.is_active,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load department');
      router.push(ROUTES.departments);
    } finally {
      setIsLoadingData(false);
    }
  }, [id, form, router]);

  useEffect(() => { fetchDepartment(); }, [fetchDepartment]);

  function toggleIsActive() { form.setValue('is_active', !form.getValues('is_active')); }

  async function updateDepartment(values: EditDepartmentFormValues) {
    try {
      const dept = await DepartmentsService.update(id, {
        name: values.name,
        address: values.address || undefined,
        description: values.description || undefined,
        is_active: values.is_active,
      });
      toast.success(`${dept.name} updated`);
      router.push(ROUTES.departments);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update department');
    }
  }

  function handleBack() { router.push(ROUTES.departments); }

  return {
    form,
    isLoadingData,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(updateDepartment),
    toggleIsActive,
    handleBack,
  };
}
