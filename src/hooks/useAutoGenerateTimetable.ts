'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TimetableService, type AutoGenerateConflict } from '@/services/timetable.service';
import { ClassesService } from '@/services/classes.service';
import { SchoolSettingsService } from '@/services/school-settings.service';
import { ClassSubjectTeacherService, type ClassSubjectTeacherMapping } from '@/services/class-subject-teacher.service';
import { useAcademicYears } from './useAcademicYears';
import { ROUTES } from '@/constants';
import { timeToMinutes, formatDuration } from '@/lib/time.utils';
import type { Class } from '@/types';
import type { SchoolTiming } from '@/types/school-settings.types';

function pickDefaultTiming(timings: SchoolTiming[]): SchoolTiming | null {
  const today = new Date().toISOString().slice(0, 10);
  const active = timings
    .filter((t) => t.is_active && t.effective_from <= today && t.effective_to >= today)
    .sort((a, b) => b.priority - a.priority);
  return active[0] ?? null;
}

export interface AutoGeneratePreview {
  totalMinutes: number;
  totalLabel: string;
  lunchMinutes: number;
  teachingMinutes: number;
  periodCount: number;
  periodDurationMinutes: number;
}

export function useAutoGenerateTimetable() {
  const router = useRouter();
  const { years, currentYear } = useAcademicYears();

  const [name, setName] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [schoolTimingId, setSchoolTimingId] = useState('');
  const [lunchAfterPeriod, setLunchAfterPeriod] = useState<number | ''>('');
  const [lunchDurationMinutes, setLunchDurationMinutes] = useState<number | ''>('');

  const [classes, setClasses] = useState<Class[]>([]);
  const [timings, setTimings] = useState<SchoolTiming[]>([]);
  const [mappings, setMappings] = useState<ClassSubjectTeacherMapping[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<AutoGenerateConflict[]>([]);

  useEffect(() => {
    if (currentYear && !academicYearId) setAcademicYearId(currentYear.id);
  }, [currentYear, academicYearId]);

  const loadStaticData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [clsRes, timingsRes] = await Promise.all([
        ClassesService.list({ limit: 100 }),
        SchoolSettingsService.getTimings(),
      ]);
      setClasses(clsRes.items);
      setTimings(timingsRes);
      const defaultTiming = pickDefaultTiming(timingsRes);
      if (defaultTiming) setSchoolTimingId(defaultTiming.id);
    } catch {
      toast.error('Failed to load form data');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => { loadStaticData(); }, [loadStaticData]);

  const loadMappings = useCallback(async () => {
    if (!academicYearId || !classId) { setMappings([]); return; }
    setIsLoadingMappings(true);
    try {
      const res = await ClassSubjectTeacherService.list({ academic_year_id: academicYearId, class_id: classId });
      setMappings(res);
    } catch {
      toast.error('Failed to load subject-teacher mapping');
    } finally {
      setIsLoadingMappings(false);
    }
  }, [academicYearId, classId]);

  useEffect(() => { loadMappings(); }, [loadMappings]);

  const selectedTiming = timings.find((t) => t.id === schoolTimingId) ?? null;

  const preview: AutoGeneratePreview | null = selectedTiming
    ? (() => {
        const totalMinutes = timeToMinutes(selectedTiming.school_end_time) - timeToMinutes(selectedTiming.school_start_time);
        const lunchMinutes = lunchAfterPeriod && lunchDurationMinutes ? Number(lunchDurationMinutes) : 0;
        const teachingMinutes = totalMinutes - lunchMinutes;
        const periodCount = mappings.length;
        return {
          totalMinutes,
          totalLabel: formatDuration(totalMinutes),
          lunchMinutes,
          teachingMinutes,
          periodCount,
          periodDurationMinutes: periodCount > 0 ? teachingMinutes / periodCount : 0,
        };
      })()
    : null;

  async function generate() {
    if (!academicYearId || !classId || !schoolTimingId) {
      toast.error('Select academic year, class and timing profile');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await TimetableService.autoGenerate({
        name: name || undefined,
        academic_year_id: academicYearId,
        class_id: classId,
        school_timing_id: schoolTimingId,
        lunch_after_period: lunchAfterPeriod ? Number(lunchAfterPeriod) : undefined,
        lunch_duration_minutes: lunchDurationMinutes ? Number(lunchDurationMinutes) : undefined,
      });
      setConflicts(result.conflicts);
      if (result.conflicts.length > 0) {
        toast.warning(`Timetable created — ${result.conflicts.length} period(s) left unassigned due to teacher clashes`);
      } else {
        toast.success('Timetable auto-generated');
      }
      router.push(ROUTES.timetableEdit(result.timetable.id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to auto-generate timetable');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() { router.push(ROUTES.timetable); }

  return {
    name, setName,
    years, academicYearId, setAcademicYearId,
    classes, classId, setClassId,
    timings, schoolTimingId, setSchoolTimingId,
    lunchAfterPeriod, setLunchAfterPeriod,
    lunchDurationMinutes, setLunchDurationMinutes,
    preview,
    mappings, isLoadingMappings,
    isLoadingData, isSubmitting, conflicts,
    generate, handleBack,
  };
}
