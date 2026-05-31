'use client';

import { useAuthStore } from '@/store/auth.store';
import { useAcademicYears } from './useAcademicYears';
import { useClasses } from './useClasses';
import { useStudents } from './useStudents';
import type { DashboardStatKey } from '@/constants';

export interface DashboardStat {
  key: DashboardStatKey;
  value: string;
  sub: string;
}

export interface SetupStepState {
  key: DashboardStatKey;
  done: boolean;
}

export function useSchoolDashboard() {
  const user = useAuthStore((s) => s.user);
  const { years, currentYear, isLoading: yearsLoading } = useAcademicYears();
  const { classes, isLoading: classesLoading } = useClasses();
  const { pagination, isLoading: studentsLoading } = useStudents();

  const totalStudents = pagination?.total ?? 0;

  const stats: DashboardStat[] = [
    { key: 'academic-years', value: yearsLoading ? '…' : String(years.length), sub: currentYear ? `Current: ${currentYear.name}` : 'None set' },
    { key: 'classes', value: classesLoading ? '…' : String(classes.length), sub: 'Total classes' },
    { key: 'students', value: studentsLoading ? '…' : String(totalStudents), sub: 'Total enrolled' },
  ];

  const setupSteps: SetupStepState[] = [
    { key: 'academic-years', done: years.length > 0 },
    { key: 'classes', done: classes.length > 0 },
    { key: 'students', done: totalStudents > 0 },
  ];

  return {
    user,
    currentYear,
    stats,
    setupSteps,
    showSetup: !currentYear,
  };
}
