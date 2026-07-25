'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ParentLeaveService,
  ApplyStudentLeavePayload,
  StudentLeaveBalanceSummary,
} from '@/services/leave.service';
import { useParentStore } from '@/store/parent.store';
import type { StudentLeaveRequest } from '@/types';

export function useParentLeave() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [requests, setRequests] = useState<StudentLeaveRequest[]>([]);
  const [balance, setBalance] = useState<StudentLeaveBalanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    if (!activeStudentId) return;
    setIsLoading(true);
    return Promise.all([
      ParentLeaveService.myRequests(),
      ParentLeaveService.studentSummary(),
    ])
      .then(([r, b]) => {
        setRequests(r);
        setBalance(b);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load leave data'))
      .finally(() => setIsLoading(false));
  }, [activeStudentId]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  async function apply(payload: ApplyStudentLeavePayload) {
    setIsApplying(true);
    try {
      await ParentLeaveService.apply(payload);
      toast.success('Leave request submitted');
      await fetchAll();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit leave request');
      return false;
    } finally {
      setIsApplying(false);
    }
  }

  return { requests, balance, isLoading, isApplying, error, apply, refresh: fetchAll };
}
