'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TeacherLeaveService } from '@/services/leave.service';
import type { LeaveBalance } from '@/types';

export function useLeaveBalance() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [academicYearId, setAcademicYearId] = useState('');

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

  useEffect(() => {
    load();
  }, [load]);

  return { balances, isLoading, academicYearId, setAcademicYearId, load };
}
