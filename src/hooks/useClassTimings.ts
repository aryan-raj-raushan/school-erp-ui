'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SchoolSettingsService } from '@/services/school-settings.service';
import { ClassesService } from '@/services/classes.service';
import type { ClassTimingOverride, SchoolTiming } from '@/types/school-settings.types';
import type { Class } from '@/types';

export function useClassTimings() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [timings, setTimings] = useState<SchoolTiming[]>([]);
  const [overrides, setOverrides] = useState<ClassTimingOverride[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingClassId, setSavingClassId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [classResponse, timingData, overrideData] = await Promise.all([
        ClassesService.list(),
        SchoolSettingsService.getTimings(),
        SchoolSettingsService.getClassOverrides(),
      ]);
      setClasses(classResponse.items);
      setTimings(timingData);
      setOverrides(overrideData);
    } catch {
      toast.error('Failed to load class timings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getOverrideForClass = useCallback(
    (classId: string): string | null => {
      return overrides.find((o) => o.class_id === classId)?.timing_id ?? null;
    },
    [overrides],
  );

  const setClassTiming = useCallback(
    async (classId: string, timingId: string | null) => {
      setSavingClassId(classId);
      try {
        const updated = await SchoolSettingsService.setClassTiming(classId, { timing_id: timingId });
        setOverrides((prev) => {
          const exists = prev.find((o) => o.class_id === classId);
          if (exists) return prev.map((o) => (o.class_id === classId ? updated : o));
          return [...prev, updated];
        });
        toast.success(timingId ? 'Class timing override saved' : 'Class timing reset to school default');
      } catch {
        toast.error('Failed to update class timing');
      } finally {
        setSavingClassId(null);
      }
    },
    [],
  );

  return {
    classes,
    timings,
    overrides,
    isLoading,
    savingClassId,
    getOverrideForClass,
    setClassTiming,
  };
}
