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
import type { AcademicYear } from '@/types';

const createClassSchema = z.object({
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

export type CreateClassFormValues = z.infer<typeof createClassSchema>;

export function useCreateClass() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema) as any,
    defaultValues: {
      sections: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
      is_active: true,
    },
  });

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [sessionsRes, yearsRes] = await Promise.all([
        TimetableSessionsService.list({ limit: 100 }),
        AcademicYearsService.list({ limit: 100 }),
      ]);
      setSessions(sessionsRes.items);
      setYears(yearsRes.items);
    } catch {
      toast.error('Failed to load form data');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  async function createClass(values: CreateClassFormValues) {
    try {
      const defaultSectionsStr = values.sections.join('');
      const cls = await ClassesService.create({
        name: values.name,
        academic_year_id: values.academic_year_id,
        timetable_session_id: values.timetable_session_id || undefined,
        department: values.department,
        class_type: values.class_type || undefined,
        class_sequence: values.class_sequence,
        no_of_sessions: values.no_of_sessions,
        class_code: values.class_code || undefined,
        default_sections: defaultSectionsStr,
        description: values.description || undefined,
        is_active: values.is_active,
      });

      await Promise.all(
        values.sections.map((name) =>
          SectionsService.create({ name, class_id: cls.id }),
        ),
      );

      toast.success(`Class ${cls.name} created with sections ${values.sections.join(', ')}`);
      router.push(ROUTES.classes);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create class');
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
    handleSubmit: form.handleSubmit(createClass),
    toggleSection,
    toggleIsActive,
    handleBack,
  };
}
