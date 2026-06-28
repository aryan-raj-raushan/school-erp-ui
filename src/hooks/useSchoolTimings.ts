'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SchoolSettingsService } from '@/services/school-settings.service';
import { TIMINGS_PAGE } from '@/constants/school-settings.constants';
import type { SchoolTiming, CreateSchoolTimingPayload, UpdateSchoolTimingPayload } from '@/types/school-settings.types';

export function useSchoolTimings() {
  const [timings, setTimings] = useState<SchoolTiming[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTiming, setEditingTiming] = useState<SchoolTiming | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await SchoolSettingsService.getTimings();
      setTimings(data);
    } catch {
      toast.error('Failed to load timing schedules');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = useCallback(() => {
    setEditingTiming(null);
    setIsDialogOpen(true);
  }, []);

  const openEdit = useCallback((timing: SchoolTiming) => {
    setEditingTiming(timing);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingTiming(null);
  }, []);

  const create = useCallback(async (payload: CreateSchoolTimingPayload) => {
    setIsSubmitting(true);
    try {
      const created = await SchoolSettingsService.createTiming(payload);
      setTimings((prev) => [...prev, created]);
      toast.success(`${TIMINGS_PAGE.title} — schedule created`);
      closeDialog();
    } catch {
      toast.error('Failed to create timing schedule');
    } finally {
      setIsSubmitting(false);
    }
  }, [closeDialog]);

  const update = useCallback(async (id: string, payload: UpdateSchoolTimingPayload) => {
    setIsSubmitting(true);
    try {
      const updated = await SchoolSettingsService.updateTiming(id, payload);
      setTimings((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success('Timing schedule updated');
      closeDialog();
    } catch {
      toast.error('Failed to update timing schedule');
    } finally {
      setIsSubmitting(false);
    }
  }, [closeDialog]);

  const remove = useCallback(async (id: string) => {
    try {
      await SchoolSettingsService.deleteTiming(id);
      setTimings((prev) => prev.filter((t) => t.id !== id));
      toast.success('Timing schedule deleted');
    } catch {
      toast.error('Failed to delete timing schedule');
    }
  }, []);

  const submit = useCallback(
    async (payload: CreateSchoolTimingPayload) => {
      if (editingTiming) {
        await update(editingTiming.id, payload);
      } else {
        await create(payload);
      }
    },
    [editingTiming, update, create],
  );

  return {
    timings,
    isLoading,
    isSubmitting,
    isDialogOpen,
    editingTiming,
    openCreate,
    openEdit,
    closeDialog,
    submit,
    remove,
  };
}
