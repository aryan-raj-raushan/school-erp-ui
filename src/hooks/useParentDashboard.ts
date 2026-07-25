'use client';

import { useState, useEffect } from 'react';
import { DashboardService, ParentDashboard } from '@/services/dashboard.service';
import { useParentStore } from '@/store/parent.store';

export function useParentDashboard() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [data, setData] = useState<ParentDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;
    let cancelled = false;
    setIsLoading(true);
    DashboardService.getParentDashboard()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeStudentId]);

  return { data, isLoading, error };
}
