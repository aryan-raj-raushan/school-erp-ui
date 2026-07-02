'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { SubjectsService } from '@/services/subjects.service';
import { ROUTES } from '@/constants';

const editSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().max(20).optional(),
  display_order: z.coerce.number().int().min(0),
  total_marks: z.coerce.number().int().min(0),
  passing_marks: z.coerce.number().int().min(0),
  is_elective: z.boolean(),
  is_active: z.boolean(),
});

export type EditSubjectFormValues = z.infer<typeof editSubjectSchema>;

export function useEditSubject(id: string) {
  const router = useRouter();
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<EditSubjectFormValues>({
    resolver: zodResolver(editSubjectSchema) as any,
    defaultValues: { display_order: 0, total_marks: 100, passing_marks: 0, is_elective: false, is_active: true },
  });

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const subject = await SubjectsService.getById(id);
      form.reset({
        name: subject.name,
        code: subject.code ?? '',
        display_order: subject.display_order,
        total_marks: subject.total_marks,
        passing_marks: subject.passing_marks,
        is_elective: subject.is_elective,
        is_active: subject.is_active,
      });
    } catch {
      toast.error('Failed to load subject');
      router.push(ROUTES.subjects);
    } finally {
      setIsLoadingData(false);
    }
  }, [id, form, router]);

  useEffect(() => { loadData(); }, [loadData]);

  function toggleIsElective() { form.setValue('is_elective', !form.getValues('is_elective')); }
  function toggleIsActive() { form.setValue('is_active', !form.getValues('is_active')); }

  async function updateSubject(values: EditSubjectFormValues) {
    try {
      await SubjectsService.update(id, {
        name: values.name,
        code: values.code || undefined,
        display_order: values.display_order,
        total_marks: values.total_marks,
        passing_marks: values.passing_marks,
        is_elective: values.is_elective,
        is_active: values.is_active,
      });
      toast.success('Subject updated');
      router.push(ROUTES.subjects);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update subject');
    }
  }

  function handleBack() { router.push(ROUTES.subjects); }

  return {
    form, isLoadingData,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(updateSubject),
    toggleIsElective, toggleIsActive, handleBack,
  };
}
