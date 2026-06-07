'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AcademicYearsService } from '@/services/academic-years.service';
import { TimetableSessionsService, type TimetableSession } from '@/services/timetable-sessions.service';
import { ROUTES } from '@/constants';
import type { AcademicYear, PaginationMeta } from '@/types';

export function useAcademicYears() {
  const router = useRouter();
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchYears = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await AcademicYearsService.list();
      setYears(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load academic years');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchYears();
    TimetableSessionsService.list({ limit: 100 })
      .then((res) => setSessions(res.items))
      .catch(() => {});
  }, [fetchYears]);

  function getSessionName(id?: string | null): string {
    if (!id) return '—';
    return sessions.find((s) => s.id === id)?.name ?? '—';
  }

  async function setCurrent(id: string) {
    try {
      await AcademicYearsService.setCurrent(id);
      toast.success('Current academic year updated');
      await fetchYears();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    }
  }

  function navigateToNew() {
    router.push(ROUTES.academicYearNew);
  }

  function navigateToEdit(id: string) {
    router.push(ROUTES.academicYearEdit(id));
  }

  return {
    years,
    sessions,
    currentYear: years.find((y) => y.is_current) ?? null,
    pagination,
    isLoading,
    getSessionName,
    setCurrent,
    navigateToNew,
    navigateToEdit,
    refetch: fetchYears,
  };
}
