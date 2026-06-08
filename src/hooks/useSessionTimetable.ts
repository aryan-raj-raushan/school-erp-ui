'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TimetableService, type SessionViewEntry, type DayOfWeek } from '@/services/timetable.service';
import { DAYS_OF_WEEK, DAY_LABELS } from '@/constants';

export function useSessionTimetable() {
  const [day, setDay] = useState<DayOfWeek>('MONDAY');
  const [entries, setEntries] = useState<SessionViewEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await TimetableService.getSessionView(day);
      setEntries(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally { setIsLoading(false); }
  }, [day]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  return {
    day, setDay,
    entries, isLoading,
    days: DAYS_OF_WEEK,
    dayLabels: DAY_LABELS,
  };
}
