'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AcademicYearsService } from '@/services/academic-years.service';
import { TimetableSessionsService, type TimetableSession } from '@/services/timetable-sessions.service';
import { ROUTES } from '@/constants';

const editAcademicYearSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  session_code: z.string().max(50).optional(),
  timetable_session_id: z.string().min(1, 'Timetable session is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  description: z.string().optional(),
  is_enabled: z.boolean(),
  is_current: z.boolean(),
});

export type EditAcademicYearFormValues = z.infer<typeof editAcademicYearSchema>;

export function useEditAcademicYear(id: string) {
  const router = useRouter();
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<EditAcademicYearFormValues>({
    resolver: zodResolver(editAcademicYearSchema) as any,
    defaultValues: { is_enabled: true, is_current: false },
  });

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [year, sessionsRes] = await Promise.all([
        AcademicYearsService.getById(id),
        TimetableSessionsService.list({ limit: 100 }),
      ]);
      setSessions(sessionsRes.items);
      form.reset({
        name: year.name,
        session_code: year.session_code ?? '',
        timetable_session_id: year.timetable_session_id ?? '',
        start_date: year.start_date,
        end_date: year.end_date,
        description: year.description ?? '',
        is_enabled: year.is_enabled,
        is_current: year.is_current,
      });
    } catch {
      toast.error('Failed to load academic year');
      router.push(ROUTES.academicYears);
    } finally {
      setIsLoadingData(false);
    }
  }, [id, form, router]);

  useEffect(() => { loadData(); }, [loadData]);

  async function updateAcademicYear(values: EditAcademicYearFormValues) {
    try {
      await AcademicYearsService.update(id, {
        name: values.name,
        session_code: values.session_code || undefined,
        timetable_session_id: values.timetable_session_id,
        start_date: values.start_date,
        end_date: values.end_date,
        description: values.description || undefined,
        is_enabled: values.is_enabled,
        is_current: values.is_current,
      });
      toast.success('Academic year updated');
      router.push(ROUTES.academicYears);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update academic year');
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
    sessions,
    isLoadingData,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(updateAcademicYear),
    handleBack,
    toggleIsEnabled,
    toggleIsCurrent,
  };
}
