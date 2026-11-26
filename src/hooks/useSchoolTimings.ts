'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SchoolSettingsService } from '@/services/school-settings.service';
import { TIMINGS_PAGE } from '@/constants/school-settings.constants';
import type { SchoolTiming, CreateSchoolTimingPayload, UpdateSchoolTimingPayload } from '@/types/school-settings.types';
import { errorMessage } from '@/lib/api-error';
import { confirmCreate } from '@/components/ui/confirm-dialog';
import { missingFieldsMessage } from '@/lib/required-fields';

const OPTIONAL_TIME_FIELDS = [
  'late_cutoff_time',
  'half_day_cutoff_time',
  'absent_cutoff_time',
  'lunch_start_time',
  'lunch_end_time',
] as const;

// Blank time inputs mean "not set": the API rejects '' but accepts null, which also clears a value on edit.
function toTimingPayload(form: CreateSchoolTimingPayload): CreateSchoolTimingPayload {
  const payload = { ...form };
  OPTIONAL_TIME_FIELDS.forEach((field) => {
    if (!payload[field]) payload[field] = null;
  });
  return payload;
}

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
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load timing schedules'));
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
    const missing = missingFieldsMessage(payload, {
      name: 'Schedule name',
      timing_type: 'Timing type',
      school_start_time: 'Start time',
      school_end_time: 'End time',
      effective_from: 'Effective from',
      effective_to: 'Effective to',
    });
    if (missing) {
      toast.error(missing);
      return;
    }
    setIsSubmitting(true);
    try {
      if (!(await confirmCreate(`timing schedule "${payload.name}"`))) return;
      const created = await SchoolSettingsService.createTiming(payload);
      setTimings((prev) => [...prev, created]);
      toast.success(`${TIMINGS_PAGE.title} — schedule created`);
      closeDialog();
    } catch (err: unknown) {
      toast.error(errorMessage(err, 'Failed to create timing schedule'));
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
    } catch (err: unknown) {
      toast.error(errorMessage(err, 'Failed to update timing schedule'));
    } finally {
      setIsSubmitting(false);
    }
  }, [closeDialog]);

  const remove = useCallback(async (id: string) => {
    try {
      await SchoolSettingsService.deleteTiming(id);
      setTimings((prev) => prev.filter((t) => t.id !== id));
      toast.success('Timing schedule deleted');
    } catch (err: unknown) {
      toast.error(errorMessage(err, 'Failed to delete timing schedule'));
    }
  }, []);

  const submit = useCallback(
    async (payload: CreateSchoolTimingPayload) => {
      const normalized = toTimingPayload(payload);
      if (editingTiming) {
        await update(editingTiming.id, normalized);
      } else {
        await create(normalized);
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
    refresh: load,
  };
}
