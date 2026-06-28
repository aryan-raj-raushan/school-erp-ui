'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SchoolSettingsService } from '@/services/school-settings.service';
import { SCHOOL_CONFIG_PAGE } from '@/constants/school-settings.constants';
import type { SchoolSettings, UpdateSchoolSettingsPayload } from '@/types/school-settings.types';

export function useSchoolConfig() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<UpdateSchoolSettingsPayload>({});

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await SchoolSettingsService.getSettings();
      setSettings(data);
      setForm({
        attendance_method: data.attendance_method,
        attendance_lock_hours: data.attendance_lock_hours,
        three_lates_equal_half_day: data.three_lates_equal_half_day,
        two_half_days_equal_leave: data.two_half_days_equal_leave,
        auto_notify_parent_on_absent: data.auto_notify_parent_on_absent,
        conflict_resolution_mode: data.conflict_resolution_mode,
      });
    } catch {
      toast.error('Failed to load school configuration');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = useCallback(<K extends keyof UpdateSchoolSettingsPayload>(
    key: K,
    value: UpdateSchoolSettingsPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      const updated = await SchoolSettingsService.updateSettings(form);
      setSettings(updated);
      toast.success(`${SCHOOL_CONFIG_PAGE.title} saved successfully`);
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  }, [form]);

  return {
    settings,
    form,
    isLoading,
    isSaving,
    updateField,
    save,
  };
}
