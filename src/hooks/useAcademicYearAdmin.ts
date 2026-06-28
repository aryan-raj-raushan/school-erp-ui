'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AcademicYearsService } from '@/services/academic-years.service';
import type { AcademicYear } from '@/types';

export function useAcademicYearAdmin() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rolloverFromId, setRolloverFromId] = useState('');
  const [rolloverToId, setRolloverToId] = useState('');
  const [isRolloverOpen, setIsRolloverOpen] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await AcademicYearsService.list();
      setYears(res.items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const freeze = useCallback(async (id: string) => {
    setActionId(id);
    try {
      const updated = await AcademicYearsService.freeze(id);
      setYears(prev => prev.map(y => y.id === id ? { ...y, ...updated } : y));
      toast.success('Frozen');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setActionId(null); }
  }, []);

  const unfreeze = useCallback(async (id: string) => {
    setActionId(id);
    try {
      const updated = await AcademicYearsService.unfreeze(id);
      setYears(prev => prev.map(y => y.id === id ? { ...y, ...updated } : y));
      toast.success('Unfrozen');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setActionId(null); }
  }, []);

  const rollover = useCallback(async () => {
    if (!rolloverFromId || !rolloverToId) { toast.error('Select both years'); return; }
    try {
      const result = await AcademicYearsService.rollover(rolloverFromId, rolloverToId);
      toast.success(result.message);
      setIsRolloverOpen(false);
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Rollover failed');
    }
  }, [rolloverFromId, rolloverToId, fetch]);

  return {
    years, isLoading, actionId, freeze, unfreeze,
    rollover, rolloverFromId, setRolloverFromId, rolloverToId, setRolloverToId,
    isRolloverOpen, setIsRolloverOpen,
  };
}
