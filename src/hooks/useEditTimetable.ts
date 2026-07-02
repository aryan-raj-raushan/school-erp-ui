'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  TimetableService,
  type DayOfWeek,
  type PeriodTimeDto,
  type TimetableEntryDto,
} from '@/services/timetable.service';
import { ClassesService } from '@/services/classes.service';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { useAcademicYears } from './useAcademicYears';
import { ROUTES, DAYS_OF_WEEK } from '@/constants';
import { timeToMinutes, formatDuration } from '@/lib/time.utils';
import type { Class } from '@/types';
import type { GridCell, GridState, StaffOption } from './useCreateTimetable';

export interface DaySummary {
  totalLabel: string;
  teachingCount: number;
  breakCount: number;
}

export function useEditTimetable(id: string) {
  const router = useRouter();
  const { years } = useAcademicYears();

  const [name, setName] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');

  const [periodTimes, setPeriodTimes] = useState<PeriodTimeDto[]>([]);
  const [grid, setGrid] = useState<GridState>({});

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [tt, clsRes, staffRes, subRes] = await Promise.all([
        TimetableService.getById(id),
        ClassesService.list({ limit: 100 }),
        import('@/services/staff.service').then((m) => m.StaffService.list({ limit: 100 })),
        SubjectsService.list({ limit: 100 }),
      ]);

      setClasses(clsRes.items);
      setStaff(staffRes.items.map((s: any) => ({ id: s.id, name: `${s.first_name} ${s.last_name}` })));
      setSubjects(subRes.items);
      setName(tt.name);
      setAcademicYearId(tt.academic_year_id ?? '');
      setClassId(tt.class_id ?? '');
      setClassTeacherId(tt.class_teacher_id ?? '');
      setPeriodTimes(
        Array.from({ length: tt.max_periods }, (_, i) => {
          const pt = tt.period_times.find((p) => p.period_number === i + 1);
          return {
            period_number: i + 1,
            start_time: pt?.start_time ?? '',
            end_time: pt?.end_time ?? '',
            is_break: pt?.is_break ?? false,
          };
        }),
      );

      const newGrid: GridState = {};
      for (const e of tt.entries) {
        if (!newGrid[e.day_of_week]) newGrid[e.day_of_week] = {};
        newGrid[e.day_of_week][e.period_number] = {
          subject_id: e.subject_id ?? '',
          teacher_id: e.teacher_id ?? '',
        };
      }
      setGrid(newGrid);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load timetable');
      router.push(ROUTES.timetable);
    } finally {
      setIsLoadingData(false);
    }
  }, [id, router]);

  useEffect(() => { loadAll(); }, [loadAll]);

  function setCellValue(day: DayOfWeek, period: number, field: 'subject_id' | 'teacher_id', value: string) {
    setGrid((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] ?? {}),
        [period]: {
          subject_id: prev[day]?.[period]?.subject_id ?? '',
          teacher_id: prev[day]?.[period]?.teacher_id ?? '',
          [field]: value,
        },
      },
    }));
  }

  function swapCells(dayA: DayOfWeek, periodA: number, dayB: DayOfWeek, periodB: number) {
    if (dayA === dayB && periodA === periodB) return;
    setGrid((prev) => {
      const cellA = prev[dayA]?.[periodA] ?? { subject_id: '', teacher_id: '' };
      const cellB = prev[dayB]?.[periodB] ?? { subject_id: '', teacher_id: '' };
      if (dayA === dayB) {
        return { ...prev, [dayA]: { ...(prev[dayA] ?? {}), [periodA]: cellB, [periodB]: cellA } };
      }
      return {
        ...prev,
        [dayA]: { ...(prev[dayA] ?? {}), [periodA]: cellB },
        [dayB]: { ...(prev[dayB] ?? {}), [periodB]: cellA },
      };
    });
  }

  function setPeriodTime(periodNum: number, field: 'start_time' | 'end_time', value: string) {
    setPeriodTimes((prev) => prev.map((p) =>
      p.period_number === periodNum ? { ...p, [field]: value } : p,
    ));
  }

  function addPeriod() {
    setPeriodTimes((prev) => [
      ...prev,
      { period_number: prev.length + 1, start_time: '', end_time: '', is_break: false },
    ]);
  }

  function removePeriod(periodNum: number) {
    setPeriodTimes((prev) => {
      if (prev.length <= 1) return prev;
      return prev
        .filter((p) => p.period_number !== periodNum)
        .map((p) => (p.period_number > periodNum ? { ...p, period_number: p.period_number - 1 } : p));
    });
    setGrid((prev) => {
      const next: GridState = {};
      for (const day of DAYS_OF_WEEK) {
        const dayCells = prev[day];
        if (!dayCells) continue;
        const newDayCells: Record<number, GridCell> = {};
        for (const [pStr, cell] of Object.entries(dayCells)) {
          const p = Number(pStr);
          if (p === periodNum) continue;
          newDayCells[p > periodNum ? p - 1 : p] = cell;
        }
        next[day] = newDayCells;
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setIsSubmitting(true);
    try {
      const entries: TimetableEntryDto[] = [];
      for (const day of DAYS_OF_WEEK) {
        for (const pt of periodTimes) {
          const cell = grid[day]?.[pt.period_number];
          if (cell?.subject_id || cell?.teacher_id) {
            entries.push({
              day_of_week: day,
              period_number: pt.period_number,
              subject_id: cell.subject_id || undefined,
              teacher_id: cell.teacher_id || undefined,
            });
          }
        }
      }
      await TimetableService.update(id, {
        name,
        academic_year_id: academicYearId || undefined,
        class_id: classId || undefined,
        max_periods: periodTimes.length,
        period_times: periodTimes.map((pt) => ({
          period_number: pt.period_number,
          start_time: pt.start_time || undefined,
          end_time: pt.end_time || undefined,
          is_break: pt.is_break,
        })),
        entries,
        class_teacher_id: classTeacherId || undefined,
      });
      toast.success('Timetable updated');
      router.push(ROUTES.timetableView(id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update timetable');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() { router.push(ROUTES.timetableView(id)); }

  const periods = periodTimes.map((pt) => pt.period_number);

  const timedPeriods = periodTimes.filter((pt) => pt.start_time && pt.end_time);
  const daySummary: DaySummary | null = timedPeriods.length > 0
    ? (() => {
        const starts = timedPeriods.map((pt) => timeToMinutes(pt.start_time!));
        const ends = timedPeriods.map((pt) => timeToMinutes(pt.end_time!));
        const totalMinutes = Math.max(...ends) - Math.min(...starts);
        return {
          totalLabel: formatDuration(totalMinutes),
          teachingCount: periodTimes.filter((pt) => !pt.is_break).length,
          breakCount: periodTimes.filter((pt) => pt.is_break).length,
        };
      })()
    : null;

  return {
    years, classes, subjects, staff,
    name, setName,
    academicYearId, setAcademicYearId,
    classId, setClassId,
    classTeacherId, setClassTeacherId,
    periodTimes, setPeriodTime, addPeriod, removePeriod,
    grid, setCellValue, swapCells,
    periods, daySummary,
    isLoadingData, isSubmitting,
    handleSubmit, handleBack,
  };
}
