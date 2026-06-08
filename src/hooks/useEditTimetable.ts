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
import { ClassDetailsService, type ClassDetail } from '@/services/class-details.service';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { useAcademicYears } from './useAcademicYears';
import { ROUTES, DAYS_OF_WEEK } from '@/constants';
import type { Class } from '@/types';
import type { GridCell, GridState, StaffOption } from './useCreateTimetable';

export function useEditTimetable(id: string) {
  const router = useRouter();
  const { years } = useAcademicYears();

  const [name, setName] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [classDetailId, setClassDetailId] = useState('');
  const [maxPeriods, setMaxPeriods] = useState(8);
  const [classTeacherId, setClassTeacherId] = useState('');

  const [periodTimes, setPeriodTimes] = useState<PeriodTimeDto[]>([]);
  const [grid, setGrid] = useState<GridState>({});

  const [classes, setClasses] = useState<Class[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [tt, clsRes, staffRes] = await Promise.all([
        TimetableService.getById(id),
        ClassesService.list({ limit: 100 }),
        import('@/services/staff.service').then((m) => m.StaffService.list({ limit: 100 })),
      ]);

      setClasses(clsRes.items);
      setStaff(staffRes.items.map((s: any) => ({ id: s.id, name: `${s.first_name} ${s.last_name}` })));
      setName(tt.name);
      setAcademicYearId(tt.academic_year_id ?? '');
      setClassId(tt.class_id ?? '');
      setClassDetailId(tt.class_detail_id ?? '');
      setMaxPeriods(tt.max_periods);
      setClassTeacherId(tt.class_teacher_id ?? '');
      setPeriodTimes(
        Array.from({ length: tt.max_periods }, (_, i) => {
          const pt = tt.period_times.find((p) => p.period_number === i + 1);
          return { period_number: i + 1, start_time: pt?.start_time ?? '', end_time: pt?.end_time ?? '' };
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

      if (tt.class_id) {
        const [cdRes, subRes] = await Promise.all([
          ClassDetailsService.list({ class_id: tt.class_id, limit: 100 }),
          SubjectsService.list({ class_id: tt.class_id, limit: 100 }),
        ]);
        setClassDetails(cdRes.items);
        setSubjects(subRes.items);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load timetable');
      router.push(ROUTES.timetable);
    } finally {
      setIsLoadingData(false);
    }
  }, [id, router]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadClassDetails = useCallback(async (cid: string) => {
    if (!cid) { setClassDetails([]); setSubjects([]); return; }
    try {
      const [cdRes, subRes] = await Promise.all([
        ClassDetailsService.list({ class_id: cid, limit: 100 }),
        SubjectsService.list({ class_id: cid, limit: 100 }),
      ]);
      setClassDetails(cdRes.items);
      setSubjects(subRes.items);
    } catch { /* ignore */ }
  }, []);

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
      await TimetableService.update(id, {
        name,
        academic_year_id: academicYearId || undefined,
        class_id: classId || undefined,
        class_detail_id: classDetailId || undefined,
        max_periods: maxPeriods,
        period_times: periodTimes.map((pt) => ({
          period_number: pt.period_number,
          start_time: pt.start_time || undefined,
          end_time: pt.end_time || undefined,
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

  const periods = Array.from({ length: maxPeriods }, (_, i) => i + 1);

  return {
    years, classes, classDetails, subjects, staff,
    name, setName,
    academicYearId, setAcademicYearId,
    classId, setClassId, loadClassDetails,
    classDetailId, setClassDetailId,
    maxPeriods, setMaxPeriods,
    classTeacherId, setClassTeacherId,
    periodTimes, setPeriodTime,
    grid, setCellValue,
    periods,
    isLoadingData, isSubmitting,
    handleSubmit, handleBack,
  };
}
