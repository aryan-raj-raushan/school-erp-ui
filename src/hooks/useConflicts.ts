'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { AttendanceConflict } from '@/types';

function todayISO() { return new Date().toISOString().split('T')[0]; }

export function useConflicts() {
  const [conflicts, setConflicts] = useState<AttendanceConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGateway.get<AttendanceConflict[]>(ENDPOINTS.attendance.conflicts, {
        params: { date },
      });
      setConflicts(res.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load conflicts');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  const resolve = useCallback(async (id: string, resolution: 'RFID_WON' | 'MANUAL_WON' | 'ADMIN_SET') => {
    setResolvingId(id);
    try {
      await apiGateway.put(ENDPOINTS.attendance.resolveConflict(id), { resolution });
      setConflicts(prev => prev.filter(c => c.id !== id));
      toast.success('Conflict resolved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve');
    } finally {
      setResolvingId(null);
    }
  }, []);

  return { conflicts, isLoading, date, setDate, fetch, resolve, resolvingId };
}
