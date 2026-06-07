'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  SyllabiService,
  type CreateSyllabusPayload,
  type UpdateSyllabusPayload,
  type Syllabus,
} from '@/services/syllabi.service';
import type { PaginationMeta } from '@/types';

const syllabusSchema = z.object({
  class_id: z.string().min(1, 'Class required'),
  timetable_session_id: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  content: z.string().optional(),
  is_enabled: z.boolean().default(true),
});

export type SyllabusFormValues = z.infer<typeof syllabusSchema>;

export function useSyllabi() {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<Syllabus | null>(null);

  const form = useForm<SyllabusFormValues>({
    resolver: zodResolver(syllabusSchema) as any,
    defaultValues: { is_enabled: true },
  });

  const editForm = useForm<SyllabusFormValues>({
    resolver: zodResolver(syllabusSchema) as any,
    defaultValues: { is_enabled: true },
  });

  const fetchSyllabi = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SyllabiService.list();
      setSyllabi(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load syllabi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function createSyllabus(values: SyllabusFormValues) {
    try {
      const payload: CreateSyllabusPayload = {
        class_id: values.class_id,
        timetable_session_id: values.timetable_session_id || undefined,
        title: values.title,
        content: values.content || undefined,
        is_enabled: values.is_enabled,
      };
      const syllabus = await SyllabiService.create(payload);
      toast.success(`${syllabus.title} created`);
      await fetchSyllabi();
      setShowModal(false);
      form.reset({ is_enabled: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create syllabus');
    }
  }

  async function updateSyllabus(values: SyllabusFormValues) {
    if (!editingSyllabus) return;
    try {
      const payload: UpdateSyllabusPayload = {
        class_id: values.class_id,
        timetable_session_id: values.timetable_session_id || undefined,
        title: values.title,
        content: values.content || undefined,
        is_enabled: values.is_enabled,
      };
      await SyllabiService.update(editingSyllabus.id, payload);
      toast.success('Syllabus updated');
      await fetchSyllabi();
      setShowEditModal(false);
      setEditingSyllabus(null);
      editForm.reset({ is_enabled: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update syllabus');
    }
  }

  async function removeSyllabus(id: string) {
    try {
      await SyllabiService.remove(id);
      toast.success('Syllabus deleted');
      await fetchSyllabi();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  function openEditModal(syllabus: Syllabus) {
    setEditingSyllabus(syllabus);
    editForm.reset({
      class_id: syllabus.class_id,
      timetable_session_id: syllabus.timetable_session_id ?? '',
      title: syllabus.title,
      content: syllabus.content ?? '',
      is_enabled: syllabus.is_enabled,
    });
    setShowEditModal(true);
  }

  useEffect(() => { fetchSyllabi(); }, [fetchSyllabi]);

  return {
    syllabi,
    pagination,
    isLoading,
    showModal,
    openModal: () => setShowModal(true),
    closeModal: () => { setShowModal(false); form.reset({ is_enabled: true }); },
    showEditModal,
    openEditModal,
    closeEditModal: () => { setShowEditModal(false); setEditingSyllabus(null); editForm.reset({ is_enabled: true }); },
    editingSyllabus,
    form,
    editForm,
    handleSubmit: form.handleSubmit(createSyllabus),
    handleEditSubmit: editForm.handleSubmit(updateSyllabus),
    isSubmitting: form.formState.isSubmitting,
    isEditSubmitting: editForm.formState.isSubmitting,
    removeSyllabus,
    refetch: fetchSyllabi,
  };
}
