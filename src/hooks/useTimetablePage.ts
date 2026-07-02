'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TimetableService, type TimetableSummary } from '@/services/timetable.service';
import { ClassesService } from '@/services/classes.service';
import { useAcademicYears } from './useAcademicYears';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';

export function useTimetablePage() {
  const router = useRouter();
  const { years, currentYear } = useAcademicYears();

  const [timetables, setTimetables] = useState<TimetableSummary[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterAcademicYearId, setFilterAcademicYearId] = useState('');
  const [filterClassId, setFilterClassId] = useState('');

  useEffect(() => {
    if (currentYear && !filterAcademicYearId) setFilterAcademicYearId(currentYear.id);
  }, [currentYear, filterAcademicYearId]);

  const loadClasses = useCallback(async () => {
    try {
      const res = await ClassesService.list({ limit: 100 });
      setClasses(res.items);
    } catch { /* ignore */ }
  }, []);

  const fetchTimetables = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await TimetableService.list({
        academic_year_id: filterAcademicYearId || undefined,
        class_id: filterClassId || undefined,
        limit: 100,
      });
      setTimetables(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load timetables');
    } finally {
      setIsLoading(false);
    }
  }, [filterAcademicYearId, filterClassId]);

  useEffect(() => { loadClasses(); }, [loadClasses]);
  useEffect(() => { fetchTimetables(); }, [fetchTimetables]);

  async function removeTimetable(id: string) {
    if (!confirm('Delete this timetable?')) return;
    try {
      await TimetableService.remove(id);
      toast.success('Timetable deleted');
      await fetchTimetables();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function togglePublish(tt: TimetableSummary) {
    try {
      await TimetableService.update(tt.id, { is_complete: !tt.is_complete });
      toast.success(tt.is_complete ? 'Timetable moved back to draft' : 'Timetable published');
      await fetchTimetables();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update timetable status');
    }
  }

  function goToNew() { router.push(ROUTES.timetableNew); }
  function goToView(id: string) { router.push(ROUTES.timetableView(id)); }
  function goToEdit(id: string) { router.push(ROUTES.timetableEdit(id)); }
  function goToEmployee() { router.push(ROUTES.timetableEmployee); }
  function goToSession() { router.push(ROUTES.timetableSession); }

  return {
    years, timetables, classes, isLoading,
    filterAcademicYearId, setFilterAcademicYearId,
    filterClassId, setFilterClassId,
    removeTimetable, togglePublish, goToNew, goToView, goToEdit, goToEmployee, goToSession,
  };
}
