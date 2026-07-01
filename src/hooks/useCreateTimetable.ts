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
import { ROUTES, DAYS_OF_WEEK, MAX_PERIODS_OPTIONS } from '@/constants';
import type { Class } from '@/types';

export interface GridCell {
  subject_id: string;
  teacher_id: string;
}

export type GridState = Record<string, Record<number, GridCell>>;

export interface StaffOption {
  id: string;
  name: string;
}

export function useCreateTimetable() {
  const router = useRouter();
  const { years, currentYear } = useAcademicYears();

  const [name, setName] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [maxPeriods, setMaxPeriods] = useState(8);
  const [classTeacherId, setClassTeacherId] = useState('');

  const [periodTimes, setPeriodTimes] = useState<PeriodTimeDto[]>([]);
  const [grid, setGrid] = useState<GridState>({});

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentYear && !academicYearId) setAcademicYearId(currentYear.id);
  }, [currentYear, academicYearId]);

  useEffect(() => {
    const times: PeriodTimeDto[] = Array.from({ length: maxPeriods }, (_, i) => ({
      period_number: i + 1,
      start_time: periodTimes[i]?.start_time ?? '',
      end_time: periodTimes[i]?.end_time ?? '',
    }));
    setPeriodTimes(times);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPeriods]);

  const loadStaticData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [clsRes, staffRes, subRes] = await Promise.all([
        ClassesService.list({ limit: 100 }),
        import('@/services/staff.service').then((m) => m.StaffService.list({ limit: 100 })),
        SubjectsService.list({ limit: 100 }),
      ]);
      setClasses(clsRes.items);
      setStaff(staffRes.items.map((s: any) => ({ id: s.id, name: `${s.first_name} ${s.last_name}` })));
      setSubjects(subRes.items);
    } catch { toast.error('Failed to load form data'); }
    finally { setIsLoadingData(false); }
  }, []);

  useEffect(() => { loadStaticData(); }, [loadStaticData]);

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

  function setPeriodTime(periodNum: number, field: 'start_time' | 'end_time', value: string) {
    setPeriodTimes((prev) => prev.map((p) =>
      p.period_number === periodNum ? { ...p, [field]: value } : p,
    ));
  }

  async function handleSubmit() {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setIsSubmitting(true);
    try {
      const entries: TimetableEntryDto[] = [];
      for (const day of DAYS_OF_WEEK) {
        for (let p = 1; p <= maxPeriods; p++) {
          const cell = grid[day]?.[p];
          if (cell?.subject_id || cell?.teacher_id) {
            entries.push({
              day_of_week: day,
              period_number: p,
              subject_id: cell.subject_id || undefined,
              teacher_id: cell.teacher_id || undefined,
            });
          }
        }
      }
      await TimetableService.create({
        name,
        academic_year_id: academicYearId || undefined,
        class_id: classId || undefined,
        max_periods: maxPeriods,
        period_times: periodTimes.map((pt) => ({
          period_number: pt.period_number,
          start_time: pt.start_time || undefined,
          end_time: pt.end_time || undefined,
        })),
        entries,
        class_teacher_id: classTeacherId || undefined,
      });
      toast.success('Timetable created');
      router.push(ROUTES.timetable);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create timetable');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() { router.push(ROUTES.timetable); }

  const periods = Array.from({ length: maxPeriods }, (_, i) => i + 1);

  return {
    years, classes, subjects, staff,
    name, setName,
    academicYearId, setAcademicYearId,
    classId, setClassId,
    maxPeriods, setMaxPeriods,
    classTeacherId, setClassTeacherId,
    periodTimes, setPeriodTime,
    grid, setCellValue,
    periods,
    isLoadingData, isSubmitting,
    handleSubmit, handleBack,
  };
}
