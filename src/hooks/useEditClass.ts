'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ClassesService, SectionsService } from '@/services/classes.service';
import { TimetableSessionsService, type TimetableSession } from '@/services/timetable-sessions.service';
import { AcademicYearsService } from '@/services/academic-years.service';
import { ALL_SECTION_NAMES, ROUTES } from '@/constants';
import type { AcademicYear, Section } from '@/types';

const editClassSchema = z.object({
  timetable_session_id: z.string().optional(),
  academic_year_id: z.string().min(1, 'Academic year is required'),
  name: z.string().min(1, 'Name is required').max(50),
  department: z.string().min(1, 'Department is required').max(100),
  class_type: z.string().max(50).optional(),
  class_sequence: z.coerce.number().int().min(1).optional(),
  no_of_sessions: z.coerce.number().int().min(1).optional(),
  class_code: z.string().max(50).optional(),
  sections: z.array(z.string()).min(1, 'Select at least one section'),
  description: z.string().max(255).optional(),
  is_active: z.boolean(),
});

export type EditClassFormValues = z.infer<typeof editClassSchema>;

export function useEditClass(classId: string) {
  const router = useRouter();
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [existingSections, setExistingSections] = useState<Section[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<EditClassFormValues>({
    resolver: zodResolver(editClassSchema) as any,
    defaultValues: { sections: [], is_active: true },
  });

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [cls, sectionsRes, sessionsRes, yearsRes] = await Promise.all([
        ClassesService.getById(classId),
        SectionsService.list({ class_id: classId }),
        TimetableSessionsService.list({ limit: 100 }),
        AcademicYearsService.list({ limit: 100 }),
      ]);
      setSessions(sessionsRes.items);
      setYears(yearsRes.items);
      setExistingSections(sectionsRes.items);
      form.reset({
        name: cls.name,
        academic_year_id: cls.academic_year_id,
        timetable_session_id: cls.timetable_session_id ?? '',
        department: cls.department ?? '',
        class_type: cls.class_type ?? '',
        class_sequence: cls.class_sequence ?? undefined,
        no_of_sessions: cls.no_of_sessions ?? undefined,
        class_code: cls.class_code ?? '',
        sections: sectionsRes.items.map((s) => s.name),
        description: cls.description ?? '',
        is_active: cls.is_active,
      });
    } catch {
      toast.error('Failed to load class');
      router.push(ROUTES.classes);
    } finally {
      setIsLoadingData(false);
    }
  }, [classId, form, router]);

  useEffect(() => { loadData(); }, [loadData]);

  function toggleSection(name: string) {
    const current = form.getValues('sections') ?? [];
    if (current.includes(name)) {
      form.setValue('sections', current.filter((s) => s !== name), { shouldValidate: true });
    } else {
      form.setValue('sections', [...current, name], { shouldValidate: true });
    }
  }

  function toggleIsActive() {
    form.setValue('is_active', !form.getValues('is_active'));
  }

  async function updateClass(values: EditClassFormValues) {
    try {
      await ClassesService.update(classId, {
        name: values.name,
        academic_year_id: values.academic_year_id,
        timetable_session_id: values.timetable_session_id || undefined,
        department: values.department,
        class_type: values.class_type || undefined,
        class_sequence: values.class_sequence,
        no_of_sessions: values.no_of_sessions,
        class_code: values.class_code || undefined,
        default_sections: values.sections.join(''),
        description: values.description || undefined,
        is_active: values.is_active,
      });

      const existingNames = existingSections.map((s) => s.name);
      const toAdd = values.sections.filter((n) => !existingNames.includes(n));
      const toRemove = existingSections.filter((s) => !values.sections.includes(s.name));

      await Promise.all([
        ...toAdd.map((name) => SectionsService.create({ name, class_id: classId })),
        ...toRemove.map((s) => SectionsService.remove(s.id)),
      ]);

      toast.success('Class updated');
      router.push(ROUTES.classes);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update class');
    }
  }

  function handleBack() {
    router.push(ROUTES.classes);
  }

  return {
    form,
    sessions,
    years,
    isLoadingData,
    isSubmitting: form.formState.isSubmitting,
    allSectionNames: ALL_SECTION_NAMES,
    watchedSections: form.watch('sections') ?? [],
    handleSubmit: form.handleSubmit(updateClass),
    toggleSection,
    toggleIsActive,
    handleBack,
  };
}
