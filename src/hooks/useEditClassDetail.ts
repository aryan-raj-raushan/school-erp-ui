'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ClassDetailsService } from '@/services/class-details.service';
import { ClassesService } from '@/services/classes.service';
import { TimetableSessionsService, type TimetableSession } from '@/services/timetable-sessions.service';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';

const editClassDetailSchema = z.object({
  timetable_session_id: z.string().optional(),
  class_id: z.string().min(1, 'Class is required'),
  year: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  class_code: z.string().max(50).optional(),
  max_internal_exam: z.coerce.number().int().min(0),
  best_internal_exam_count: z.coerce.number().int().min(0),
  no_of_elective_subjects: z.coerce.number().int().min(0),
  is_enabled: z.boolean(),
});

export type EditClassDetailFormValues = z.infer<typeof editClassDetailSchema>;

export function useEditClassDetail(id: string) {
  const router = useRouter();
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<EditClassDetailFormValues>({
    resolver: zodResolver(editClassDetailSchema) as any,
    defaultValues: {
      max_internal_exam: 4,
      best_internal_exam_count: 2,
      no_of_elective_subjects: 0,
      is_enabled: true,
    },
  });

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [detail, sessionsRes, classesRes] = await Promise.all([
        ClassDetailsService.getById(id),
        TimetableSessionsService.list({ limit: 100 }),
        ClassesService.list({ limit: 100 }),
      ]);
      setSessions(sessionsRes.items);
      setClasses(classesRes.items);
      form.reset({
        timetable_session_id: detail.timetable_session_id ?? '',
        class_id: detail.class_id,
        year: detail.year ?? '',
        name: detail.name,
        class_code: detail.class_code ?? '',
        max_internal_exam: detail.max_internal_exam,
        best_internal_exam_count: detail.best_internal_exam_count,
        no_of_elective_subjects: detail.no_of_elective_subjects,
        is_enabled: detail.is_enabled,
      });
    } catch {
      toast.error('Failed to load class detail');
      router.push('/school/classes');
    } finally {
      setIsLoadingData(false);
    }
  }, [id, form, router]);

  useEffect(() => { loadData(); }, [loadData]);

  function toggleIsEnabled() {
    form.setValue('is_enabled', !form.getValues('is_enabled'));
  }

  async function updateClassDetail(values: EditClassDetailFormValues) {
    try {
      await ClassDetailsService.update(id, {
        timetable_session_id: values.timetable_session_id || undefined,
        class_id: values.class_id,
        year: values.year || undefined,
        name: values.name,
        class_code: values.class_code || undefined,
        max_internal_exam: values.max_internal_exam,
        best_internal_exam_count: values.best_internal_exam_count,
        no_of_elective_subjects: values.no_of_elective_subjects,
        is_enabled: values.is_enabled,
      });
      toast.success('Class detail updated');
      router.push('/school/classes');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update class detail');
    }
  }

  function handleBack() {
    router.push('/school/classes');
  }

  return {
    form,
    sessions,
    classes,
    isLoadingData,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(updateClassDetail),
    toggleIsEnabled,
    handleBack,
  };
}
