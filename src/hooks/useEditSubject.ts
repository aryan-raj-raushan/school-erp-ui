'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { SubjectsService } from '@/services/subjects.service';
import { ClassesService } from '@/services/classes.service';
import { ClassDetailsService, type ClassDetail } from '@/services/class-details.service';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';

const editSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().max(20).optional(),
  class_id: z.string().optional(),
  class_detail_id: z.string().optional(),
  display_order: z.coerce.number().int().min(0),
  total_marks: z.coerce.number().int().min(0),
  passing_marks: z.coerce.number().int().min(0),
  is_elective: z.boolean(),
  is_active: z.boolean(),
});

export type EditSubjectFormValues = z.infer<typeof editSubjectSchema>;

export function useEditSubject(id: string) {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<EditSubjectFormValues>({
    resolver: zodResolver(editSubjectSchema) as any,
    defaultValues: { display_order: 0, total_marks: 100, passing_marks: 0, is_elective: false, is_active: true },
  });

  const watchedClassId = form.watch('class_id');

  const fetchClassDetails = useCallback(async (classId: string) => {
    if (!classId) { setClassDetails([]); return; }
    try {
      const res = await ClassDetailsService.list({ class_id: classId, limit: 100 });
      setClassDetails(res.items);
    } catch { /* ignore */ }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [subject, clsRes] = await Promise.all([
        SubjectsService.getById(id),
        ClassesService.list({ limit: 100 }),
      ]);
      setClasses(clsRes.items);
      form.reset({
        name: subject.name,
        code: subject.code ?? '',
        class_id: subject.class_id ?? '',
        class_detail_id: subject.class_detail_id ?? '',
        display_order: subject.display_order,
        total_marks: subject.total_marks,
        passing_marks: subject.passing_marks,
        is_elective: subject.is_elective,
        is_active: subject.is_active,
      });
      if (subject.class_id) await fetchClassDetails(subject.class_id);
    } catch {
      toast.error('Failed to load subject');
      router.push(ROUTES.subjects);
    } finally { setIsLoadingData(false); }
  }, [id, form, router, fetchClassDetails]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (watchedClassId !== undefined) fetchClassDetails(watchedClassId ?? '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedClassId]);

  function toggleIsElective() { form.setValue('is_elective', !form.getValues('is_elective')); }
  function toggleIsActive() { form.setValue('is_active', !form.getValues('is_active')); }

  async function updateSubject(values: EditSubjectFormValues) {
    try {
      await SubjectsService.update(id, {
        name: values.name,
        code: values.code || undefined,
        class_id: values.class_id || undefined,
        class_detail_id: values.class_detail_id || undefined,
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
    form, classes, classDetails, isLoadingData,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(updateSubject),
    toggleIsElective, toggleIsActive, handleBack,
  };
}
