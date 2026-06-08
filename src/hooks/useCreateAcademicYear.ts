'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AcademicYearsService } from '@/services/academic-years.service';
import { ROUTES } from '@/constants';

const createAcademicYearSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  session_code: z.string().max(50).optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  description: z.string().optional(),
  is_enabled: z.boolean(),
  is_current: z.boolean(),
});

export type CreateAcademicYearFormValues = z.infer<typeof createAcademicYearSchema>;

export function useCreateAcademicYear() {
  const router = useRouter();

  const form = useForm<CreateAcademicYearFormValues>({
    resolver: zodResolver(createAcademicYearSchema) as any,
    defaultValues: { is_enabled: true, is_current: false },
  });

  async function createAcademicYear(values: CreateAcademicYearFormValues) {
    try {
      await AcademicYearsService.create({
        name: values.name,
        session_code: values.session_code || undefined,
        start_date: values.start_date,
        end_date: values.end_date,
        description: values.description || undefined,
        is_enabled: values.is_enabled,
        is_current: values.is_current,
      });
      toast.success('Academic year created');
      router.push(ROUTES.academicYears);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create academic year');
    }
  }

  function handleBack() {
    router.push(ROUTES.academicYears);
  }

  function toggleIsEnabled() {
    form.setValue('is_enabled', !form.getValues('is_enabled'));
  }

  function toggleIsCurrent() {
    form.setValue('is_current', !form.getValues('is_current'));
  }

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(createAcademicYear),
    handleBack,
    toggleIsEnabled,
    toggleIsCurrent,
  };
}
