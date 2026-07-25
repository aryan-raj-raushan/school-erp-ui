'use client';

import { useState, useEffect } from 'react';
import { ParentPortalService, TimetablePeriod } from '@/services/parent-portal.service';
import { useParentStore } from '@/store/parent.store';

export function useParentTimetable() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [today, setToday] = useState<TimetablePeriod[]>([]);
  const [week, setWeek] = useState<TimetablePeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;
    let cancelled = false;
    setIsLoading(true);
    Promise.all([ParentPortalService.getTimetableToday(), ParentPortalService.getTimetableWeek()])
      .then(([t, w]) => {
        if (cancelled) return;
        setToday(t);
        setWeek(w);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load timetable');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeStudentId]);

  return { today, week, isLoading, error };
}
