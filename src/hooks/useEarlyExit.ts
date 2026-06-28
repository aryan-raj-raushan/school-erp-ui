'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EarlyExitService } from '@/services/early-exit.service';
import type { EarlyExitRecord, CreateEarlyExitPayload, EarlyExitReason } from '@/types';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function useEarlyExit() {
  const [records, setRecords] = useState<EarlyExitRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());

  // Form state
  const [studentId, setStudentId] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [reason, setReason] = useState<EarlyExitReason>('OTHER');
  const [remarks, setRemarks] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetch = useCallback(async (d?: string) => {
    setIsLoading(true);
    try {
      const data = await EarlyExitService.list(d ?? date);
      setRecords(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load early exits');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  const handleSubmit = useCallback(async () => {
    if (!studentId || !exitTime) { toast.error('Student and exit time required'); return; }
    const payload: CreateEarlyExitPayload = { student_id: studentId, date, exit_time: exitTime, reason, remarks: remarks || undefined };
    try {
      const created = await EarlyExitService.create(payload);
      setRecords(prev => [created, ...prev]);
      setIsDialogOpen(false);
      setStudentId(''); setExitTime(''); setRemarks('');
      toast.success('Early exit logged');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to log early exit');
    }
  }, [studentId, exitTime, reason, remarks, date]);

  const approve = useCallback(async (id: string) => {
    setActionId(id);
    try {
      const updated = await EarlyExitService.approve(id);
      setRecords(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Approved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setActionId(null);
    }
  }, []);

  const reject = useCallback(async (id: string) => {
    setActionId(id);
    try {
      const updated = await EarlyExitService.reject(id);
      setRecords(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Rejected');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setActionId(null);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await EarlyExitService.remove(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Deleted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }, []);

  return {
    records, isLoading, date, setDate, actionId, fetch,
    isDialogOpen, setIsDialogOpen,
    studentId, setStudentId, exitTime, setExitTime, reason, setReason, remarks, setRemarks,
    handleSubmit, approve, reject, remove,
  };
}
