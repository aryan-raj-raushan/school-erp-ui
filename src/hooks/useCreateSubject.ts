'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { SubjectsService } from '@/services/subjects.service';
import { ROUTES } from '@/constants';

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().max(20).optional(),
  display_order: z.coerce.number().int().min(0),
  total_marks: z.coerce.number().int().min(0),
  passing_marks: z.coerce.number().int().min(0),
  is_elective: z.boolean(),
  is_active: z.boolean(),
});

export type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>;

export function useCreateSubject() {
  const router = useRouter();

  const form = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(createSubjectSchema) as any,
    defaultValues: { display_order: 0, total_marks: 100, passing_marks: 0, is_elective: false, is_active: true },
  });

  function toggleIsElective() { form.setValue('is_elective', !form.getValues('is_elective')); }
  function toggleIsActive() { form.setValue('is_active', !form.getValues('is_active')); }

  async function createSubject(values: CreateSubjectFormValues) {
    try {
      const subject = await SubjectsService.create({
        name: values.name,
        code: values.code || undefined,
        display_order: values.display_order,
        total_marks: values.total_marks,
        passing_marks: values.passing_marks,
        is_elective: values.is_elective,
        is_active: values.is_active,
      });
      toast.success(`${subject.name} created`);
      router.push(ROUTES.subjects);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create subject');
    }
  }

  function handleBack() { router.push(ROUTES.subjects); }

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(createSubject),
    toggleIsElective, toggleIsActive, handleBack,
  };
}
