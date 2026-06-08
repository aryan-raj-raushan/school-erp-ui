'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ClassDetailsService } from '@/services/class-details.service';
import { ClassesService } from '@/services/classes.service';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';

const createClassDetailSchema = z.object({
  class_id: z.string().min(1, 'Class is required'),
  year: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  class_code: z.string().max(50).optional(),
  max_internal_exam: z.coerce.number().int().min(0),
  best_internal_exam_count: z.coerce.number().int().min(0),
  no_of_elective_subjects: z.coerce.number().int().min(0),
  is_enabled: z.boolean(),
});

export type CreateClassDetailFormValues = z.infer<typeof createClassDetailSchema>;

export function useCreateClassDetail() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateClassDetailFormValues>({
    resolver: zodResolver(createClassDetailSchema) as any,
    defaultValues: {
      max_internal_exam: 4,
      best_internal_exam_count: 2,
      no_of_elective_subjects: 0,
      is_enabled: true,
    },
  });

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const classesRes = await ClassesService.list({ limit: 100 });
      setClasses(classesRes.items);
    } catch {
      toast.error('Failed to load form data');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function toggleIsEnabled() {
    form.setValue('is_enabled', !form.getValues('is_enabled'));
  }

  async function createClassDetail(values: CreateClassDetailFormValues) {
    try {
      const detail = await ClassDetailsService.create({
        class_id: values.class_id,
        year: values.year || undefined,
        name: values.name,
        class_code: values.class_code || undefined,
        max_internal_exam: values.max_internal_exam,
        best_internal_exam_count: values.best_internal_exam_count,
        no_of_elective_subjects: values.no_of_elective_subjects,
        is_enabled: values.is_enabled,
      });
      toast.success(`${detail.name} created`);
      router.push('/school/classes');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create class detail');
    }
  }

  function handleBack() {
    router.push('/school/classes');
  }

  return {
    form,
    classes,
    isLoadingData,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(createClassDetail),
    toggleIsEnabled,
    handleBack,
  };
}
