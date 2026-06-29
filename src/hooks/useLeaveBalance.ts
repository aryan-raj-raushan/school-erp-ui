'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TeacherLeaveService } from '@/services/leave.service';
import { AcademicYearsService } from '@/services/academic-years.service';
import type { LeaveBalance, AcademicYear } from '@/types';

export function useLeaveBalance() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [academicYearId, setAcademicYearId] = useState('');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const fetchAcademicYears = useCallback(async () => {
    try {
      const res = await AcademicYearsService.list();
      setAcademicYears(res.items);
      const current = res.items.find((y) => y.is_current);
      if (current) setAcademicYearId(current.id);
    } catch {
      // non-fatal
    }
  }, []);

  const load = useCallback(async () => {
    if (!academicYearId) return;
    setIsLoading(true);
    try {
      const data = await TeacherLeaveService.staffSummary(academicYearId);
      setBalances(data);
    } catch {
      toast.error('Failed to load leave balances');
    } finally {
      setIsLoading(false);
    }
  }, [academicYearId]);

  useEffect(() => { fetchAcademicYears(); }, [fetchAcademicYears]);
  useEffect(() => { load(); }, [load]);

  return { balances, isLoading, academicYearId, setAcademicYearId, academicYears, load };
}
