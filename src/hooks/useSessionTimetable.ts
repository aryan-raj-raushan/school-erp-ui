'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TimetableService, type SessionViewEntry, type DayOfWeek } from '@/services/timetable.service';
import { AcademicYearsService } from '@/services/academic-years.service';
import { DAYS_OF_WEEK, DAY_LABELS } from '@/constants';
import type { AcademicYear } from '@/types';

export interface SessionRow {
  timetable_id: string;
  timetable_name: string;
  class_name: string | null;
}

export function useSessionTimetable() {
  const [academicYearId, setAcademicYearId] = useState('');
  const [day, setDay] = useState<DayOfWeek>('MONDAY');
  const [timetableName, setTimetableName] = useState('');

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [timetableNames, setTimetableNames] = useState<string[]>([]);
  const [entries, setEntries] = useState<SessionViewEntry[]>([]);

  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadMeta = useCallback(async () => {
    setIsLoadingMeta(true);
    try {
      const [yearsRes, timetablesRes] = await Promise.all([
        AcademicYearsService.list(),
        TimetableService.list({ limit: 200 }),
      ]);
      setYears(yearsRes.items);
      const names = [...new Set(timetablesRes.items.map((t) => t.name))].sort();
      setTimetableNames(names);
      const current = yearsRes.items.find((y) => y.is_current);
      if (current) setAcademicYearId(current.id);
      if (names.length > 0) setTimetableName(names[0]);
    } catch { /* ignore */ } finally { setIsLoadingMeta(false); }
  }, []);

  useEffect(() => { loadMeta(); }, [loadMeta]);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await TimetableService.getSessionView(day, {
        academic_year_id: academicYearId || undefined,
        timetable_name: timetableName || undefined,
      });
      setEntries(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally { setIsLoading(false); }
  }, [day, academicYearId, timetableName]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Unique rows: one per timetable_id (= one class/section)
  const rows: SessionRow[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    if (!seen.has(e.timetable_id)) {
      seen.add(e.timetable_id);
      rows.push({
        timetable_id: e.timetable_id,
        timetable_name: e.timetable_name,
        class_name: e.class_name ?? null,
      });
    }
  }

  const maxPeriod = entries.length > 0 ? Math.max(...entries.map((e) => e.period_number)) : 0;
  const periods = maxPeriod > 0 ? Array.from({ length: maxPeriod }, (_, i) => i + 1) : [];

  function getCell(timetableId: string, period: number): SessionViewEntry | null {
    return entries.find((e) => e.timetable_id === timetableId && e.period_number === period) ?? null;
  }

  return {
    academicYearId, setAcademicYearId,
    day, setDay,
    timetableName, setTimetableName,
    years, timetableNames,
    entries, rows, periods,
    isLoadingMeta, isLoading,
    days: DAYS_OF_WEEK,
    dayLabels: DAY_LABELS,
    getCell,
  };
}
