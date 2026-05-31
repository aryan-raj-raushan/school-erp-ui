'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ClassesService, SectionsService, type CreateClassPayload, type CreateSectionPayload } from '@/services/classes.service';
import type { Class, Section, PaginationMeta } from '@/types';

const toOptionalNumber = z.preprocess(
  (v) => (v === '' || v == null ? undefined : Number(v)),
  z.number().optional(),
);

const classSchema = z.object({
  name: z.string().min(1, 'Class name required'),
  academic_year_id: z.string().min(1, 'Academic year required'),
  numeric_value: toOptionalNumber,
  description: z.string().optional(),
});

const sectionSchema = z.object({
  name: z.string().min(1, 'Section name required'),
  class_id: z.string().min(1, 'Class required'),
  room_number: z.string().optional(),
  max_strength: toOptionalNumber,
});

export type ClassFormValues = z.infer<typeof classSchema>;
export type SectionFormValues = z.infer<typeof sectionSchema>;

export function useClasses(academicYearId?: string) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const classForm = useForm<ClassFormValues>({ resolver: zodResolver(classSchema) as any, defaultValues: { academic_year_id: academicYearId ?? '' } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionForm = useForm<SectionFormValues>({ resolver: zodResolver(sectionSchema) as any });

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ClassesService.list(academicYearId ? { academic_year_id: academicYearId } : {});
      setClasses(result.items);
      setPagination(result.pagination);
      if (result.items.length > 0) {
        const sectionRes = await SectionsService.list({});
        setSections(sectionRes.items);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  }, [academicYearId]);

  async function createClass(values: ClassFormValues) {
    const payload: CreateClassPayload = {
      name: values.name,
      academic_year_id: values.academic_year_id,
      ...(values.numeric_value && { numeric_value: values.numeric_value }),
      ...(values.description && { description: values.description }),
    };
    const cls = await ClassesService.create(payload);
    toast.success(`Class ${cls.name} created`);
    await fetchClasses();
    setShowClassModal(false);
    classForm.reset();
  }

  async function createSection(values: SectionFormValues) {
    const payload: CreateSectionPayload = {
      name: values.name,
      class_id: values.class_id,
      ...(values.room_number && { room_number: values.room_number }),
      ...(values.max_strength && { max_strength: values.max_strength }),
    };
    const sec = await SectionsService.create(payload);
    toast.success(`Section ${sec.name} created`);
    await fetchClasses();
    setShowSectionModal(false);
    sectionForm.reset();
  }

  async function removeClass(id: string) {
    try {
      await ClassesService.remove(id);
      toast.success('Class deleted');
      await fetchClasses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function removeSection(id: string) {
    try {
      await SectionsService.remove(id);
      toast.success('Section deleted');
      await fetchClasses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  return {
    classes, sections, pagination, isLoading,
    showClassModal, showSectionModal,
    openClassModal: () => setShowClassModal(true),
    closeClassModal: () => { setShowClassModal(false); classForm.reset(); },
    openSectionModal: () => setShowSectionModal(true),
    closeSectionModal: () => { setShowSectionModal(false); sectionForm.reset(); },
    classForm, sectionForm,
    handleClassSubmit: classForm.handleSubmit(createClass),
    handleSectionSubmit: sectionForm.handleSubmit(createSection),
    isClassSubmitting: classForm.formState.isSubmitting,
    isSectionSubmitting: sectionForm.formState.isSubmitting,
    removeClass, removeSection,
    refetch: fetchClasses,
  };
}
