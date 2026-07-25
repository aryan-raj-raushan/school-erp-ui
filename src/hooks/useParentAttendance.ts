'use client';

import { useState, useEffect } from 'react';
import { ParentPortalService, ParentAttendanceSummary } from '@/services/parent-portal.service';
import { useParentStore } from '@/store/parent.store';
import type { AttendanceRecord } from '@/types';

export function useParentAttendance() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [summary, setSummary] = useState<ParentAttendanceSummary | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;
    let cancelled = false;
    setIsLoading(true);
    Promise.all([ParentPortalService.getAttendanceSummary(), ParentPortalService.getAttendanceHistory()])
      .then(([s, h]) => {
        if (cancelled) return;
        setSummary(s);
        setHistory(h.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load attendance');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeStudentId]);

  return { summary, history, isLoading, error };
}
