'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TimetableService, type TimetableFull, type DayOfWeek } from '@/services/timetable.service';
import { ROUTES, DAYS_OF_WEEK } from '@/constants';

export function useViewTimetable(id: string) {
  const router = useRouter();
  const [timetable, setTimetable] = useState<TimetableFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimetable = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await TimetableService.getById(id);
      setTimetable(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load timetable');
      router.push(ROUTES.timetable);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchTimetable(); }, [fetchTimetable]);

  function getCell(day: DayOfWeek, period: number) {
    return timetable?.entries.find(
      (e) => e.day_of_week === day && e.period_number === period,
    ) ?? null;
  }

  function getPeriodTime(period: number) {
    return timetable?.period_times.find((pt) => pt.period_number === period) ?? null;
  }

  async function togglePublish() {
    if (!timetable) return;
    try {
      const updated = await TimetableService.update(id, { is_complete: !timetable.is_complete });
      setTimetable(updated);
      toast.success(updated.is_complete ? 'Timetable published' : 'Timetable moved back to draft');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update timetable status');
    }
  }

  function handlePrint() { window.print(); }
  function goToEdit() { router.push(ROUTES.timetableEdit(id)); }
  function handleBack() { router.push(ROUTES.timetable); }

  const periods = timetable
    ? Array.from({ length: timetable.max_periods }, (_, i) => i + 1)
    : [];

  return {
    timetable, isLoading, periods,
    days: DAYS_OF_WEEK,
    getCell, getPeriodTime,
    handlePrint, goToEdit, handleBack, togglePublish,
  };
}
