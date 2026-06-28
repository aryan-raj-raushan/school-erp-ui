'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AttendanceService } from '@/services/attendance.service';
import type { MissingPunchRecord } from '@/types';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function useMissingPunches() {
  const [date, setDate] = useState(todayISO());
  const [records, setRecords] = useState<MissingPunchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await AttendanceService.getMissingPunches(date);
      setRecords(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load missing punches');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  const resolve = useCallback(
    async (punchId: string, status: 'PRESENT' | 'HALF_DAY') => {
      setResolvingId(punchId);
      try {
        await AttendanceService.resolveMissingPunch(punchId, status);
        toast.success('Resolved successfully');
        setRecords((prev) => prev.filter((r) => r.punch_id !== punchId));
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to resolve punch');
      } finally {
        setResolvingId(null);
      }
    },
    [],
  );

  return { date, setDate, records, isLoading, fetch, resolve, resolvingId };
}
