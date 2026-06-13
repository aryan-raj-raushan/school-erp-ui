'use client';

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

export type CreateDepartmentFormValues = z.infer<typeof schema>;

export function useCreateDepartment() {
  const router = useRouter();

  const form = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { is_active: true },
  });

  function toggleIsActive() { form.setValue('is_active', !form.getValues('is_active')); }

  async function createDepartment(values: CreateDepartmentFormValues) {
    try {
      const dept = await DepartmentsService.create({
        name: values.name,
        address: values.address || undefined,
        description: values.description || undefined,
        is_active: values.is_active,
      });
      toast.success(`${dept.name} created`);
      router.push(ROUTES.departments);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create department');
    }
  }

  function handleBack() { router.push(ROUTES.departments); }

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(createDepartment),
    toggleIsActive,
    handleBack,
  };
}
