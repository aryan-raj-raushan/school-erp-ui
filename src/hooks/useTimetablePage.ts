'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TimetableService, type TimetableSummary } from '@/services/timetable.service';
import { ClassesService } from '@/services/classes.service';
import { ClassDetailsService, type ClassDetail } from '@/services/class-details.service';
import { useAcademicYears } from './useAcademicYears';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';

export function useTimetablePage() {
  const router = useRouter();
  const { years, currentYear } = useAcademicYears();

  const [timetables, setTimetables] = useState<TimetableSummary[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterAcademicYearId, setFilterAcademicYearId] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterClassDetailId, setFilterClassDetailId] = useState('');

  useEffect(() => {
    if (currentYear && !filterAcademicYearId) setFilterAcademicYearId(currentYear.id);
  }, [currentYear, filterAcademicYearId]);

  const loadClasses = useCallback(async () => {
    try {
      const res = await ClassesService.list({ limit: 100 });
      setClasses(res.items);
    } catch { /* ignore */ }
  }, []);

  const loadClassDetails = useCallback(async (classId: string) => {
    if (!classId) { setClassDetails([]); return; }
    try {
      const res = await ClassDetailsService.list({ class_id: classId, limit: 100 });
      setClassDetails(res.items);
    } catch { /* ignore */ }
  }, []);

  const fetchTimetables = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await TimetableService.list({
        academic_year_id: filterAcademicYearId || undefined,
        class_id: filterClassId || undefined,
        class_detail_id: filterClassDetailId || undefined,
        limit: 100,
      });
      setTimetables(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load timetables');
    } finally {
      setIsLoading(false);
    }
  }, [filterAcademicYearId, filterClassId, filterClassDetailId]);

  useEffect(() => { loadClasses(); }, [loadClasses]);
  useEffect(() => { loadClassDetails(filterClassId); setFilterClassDetailId(''); }, [filterClassId, loadClassDetails]);
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

  function goToNew() { router.push(ROUTES.timetableNew); }
  function goToView(id: string) { router.push(ROUTES.timetableView(id)); }
  function goToEdit(id: string) { router.push(ROUTES.timetableEdit(id)); }
  function goToEmployee() { router.push(ROUTES.timetableEmployee); }
  function goToSession() { router.push(ROUTES.timetableSession); }

  return {
    years, timetables, classes, classDetails, isLoading,
    filterAcademicYearId, setFilterAcademicYearId,
    filterClassId, setFilterClassId,
    filterClassDetailId, setFilterClassDetailId,
    removeTimetable, goToNew, goToView, goToEdit, goToEmployee, goToSession,
  };
}
