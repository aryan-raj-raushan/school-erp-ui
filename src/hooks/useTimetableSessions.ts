'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  TimetableSessionsService,
  type CreateTimetableSessionPayload,
  type UpdateTimetableSessionPayload,
  type TimetableSession,
} from '@/services/timetable-sessions.service';
import type { PaginationMeta } from '@/types';

const timetableSessionSchema = z.object({
  name: z.string().min(1, 'Name required'),
  session_code: z.string().optional(),
  timetable_session: z.enum(['summer', 'winter', 'spring', 'autumn', 'annual', 'quarterly']),
  academic_year_id: z.string().optional(),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().min(1, 'End date required'),
  description: z.string().optional(),
  is_enabled: z.boolean().default(true),
});

export type TimetableSessionFormValues = z.infer<typeof timetableSessionSchema>;

export function useTimetableSessions() {
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState<TimetableSession | null>(null);

  const form = useForm<TimetableSessionFormValues>({
    resolver: zodResolver(timetableSessionSchema) as any,
    defaultValues: { is_enabled: true, timetable_session: 'annual' },
  });

  const editForm = useForm<TimetableSessionFormValues>({
    resolver: zodResolver(timetableSessionSchema) as any,
    defaultValues: { is_enabled: true, timetable_session: 'annual' },
  });

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await TimetableSessionsService.list();
      setSessions(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load timetable sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function createSession(values: TimetableSessionFormValues) {
    try {
      const payload: CreateTimetableSessionPayload = {
        name: values.name,
        session_code: values.session_code || undefined,
        timetable_session: values.timetable_session,
        academic_year_id: values.academic_year_id || undefined,
        start_date: values.start_date,
        end_date: values.end_date,
        description: values.description || undefined,
        is_enabled: values.is_enabled,
      };
      const session = await TimetableSessionsService.create(payload);
      toast.success(`${session.name} created`);
      await fetchSessions();
      setShowModal(false);
      form.reset({ is_enabled: true, timetable_session: 'annual' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create timetable session');
    }
  }

  async function updateSession(values: TimetableSessionFormValues) {
    if (!editingSession) return;
    try {
      const payload: UpdateTimetableSessionPayload = {
        name: values.name,
        session_code: values.session_code || undefined,
        timetable_session: values.timetable_session,
        academic_year_id: values.academic_year_id || undefined,
        start_date: values.start_date,
        end_date: values.end_date,
        description: values.description || undefined,
        is_enabled: values.is_enabled,
      };
      await TimetableSessionsService.update(editingSession.id, payload);
      toast.success('Timetable session updated');
      await fetchSessions();
      setShowEditModal(false);
      setEditingSession(null);
      editForm.reset({ is_enabled: true, timetable_session: 'annual' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update timetable session');
    }
  }

  async function setActive(id: string) {
    try {
      await TimetableSessionsService.setActive(id);
      toast.success('Active session updated');
      await fetchSessions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    }
  }

  async function removeSession(id: string) {
    try {
      await TimetableSessionsService.remove(id);
      toast.success('Session deleted');
      await fetchSessions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  function openEditModal(session: TimetableSession) {
    setEditingSession(session);
    editForm.reset({
      name: session.name,
      session_code: session.session_code ?? '',
      timetable_session: session.timetable_session,
      academic_year_id: session.academic_year_id ?? '',
      start_date: session.start_date,
      end_date: session.end_date,
      description: session.description ?? '',
      is_enabled: session.is_enabled,
    });
    setShowEditModal(true);
  }

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return {
    sessions,
    pagination,
    isLoading,
    showModal,
    openModal: () => setShowModal(true),
    closeModal: () => { setShowModal(false); form.reset({ is_enabled: true, timetable_session: 'annual' }); },
    showEditModal,
    openEditModal,
    closeEditModal: () => { setShowEditModal(false); setEditingSession(null); editForm.reset({ is_enabled: true, timetable_session: 'annual' }); },
    editingSession,
    form,
    editForm,
    handleSubmit: form.handleSubmit(createSession),
    handleEditSubmit: editForm.handleSubmit(updateSession),
    isSubmitting: form.formState.isSubmitting,
    isEditSubmitting: editForm.formState.isSubmitting,
    setActive,
    removeSession,
    refetch: fetchSessions,
  };
}
