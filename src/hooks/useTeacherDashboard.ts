'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardService, TeacherDashboard } from '@/services/dashboard.service';

export function useTeacherDashboard() {
  const [data, setData] = useState<TeacherDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await DashboardService.getTeacherDashboard());
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch: state updates happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return { data, isLoading, error, refresh: load };
}
