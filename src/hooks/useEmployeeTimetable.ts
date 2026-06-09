'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TimetableService, type EmployeeTimetableEntry, type DayOfWeek } from '@/services/timetable.service';
import { DAYS_OF_WEEK, DAY_LABELS } from '@/constants';

export interface StaffOption { id: string; name: string; }

export function useEmployeeTimetable() {
  const [teacherId, setTeacherId] = useState('');
  const [entries, setEntries] = useState<EmployeeTimetableEntry[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  const loadStaff = useCallback(async () => {
    setIsLoadingStaff(true);
    try {
      const staffRes = await import('@/services/staff.service').then((m) => m.StaffService.list({ limit: 100 }));
      setStaff(staffRes.items.map((s: any) => ({ id: s.id, name: `${s.first_name} ${s.last_name}` })));
    } catch { /* ignore */ } finally { setIsLoadingStaff(false); }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const fetchEntries = useCallback(async () => {
    if (!teacherId) { setEntries([]); return; }
    setIsLoading(true);
    try {
      const data = await TimetableService.getEmployeeTimetable(teacherId);
      setEntries(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally { setIsLoading(false); }
  }, [teacherId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function getCell(day: DayOfWeek, period: number): EmployeeTimetableEntry | null {
    return entries.find((e) => e.day_of_week === day && e.period_number === period) ?? null;
  }

  const maxPeriod = entries.length > 0 ? Math.max(...entries.map((e) => e.period_number)) : 0;
  const periods = maxPeriod > 0 ? Array.from({ length: maxPeriod }, (_, i) => i + 1) : [];

  return {
    teacherId, setTeacherId,
    staff, isLoadingStaff,
    entries, isLoading,
    days: DAYS_OF_WEEK,
    dayLabels: DAY_LABELS,
    periods,
    getCell,
  };
}
