'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { GatePassService } from '@/services/gate-pass.service';
import type { GatePassRecord, CreateGatePassPayload } from '@/types';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function useGatePass() {
  const [records, setRecords] = useState<GatePassRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  // List filter — no date selected by default, so all gate passes show.
  const [date, setDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Form state
  const [studentId, setStudentId] = useState('');
  const [reason, setReason] = useState('');
  const [formDate, setFormDate] = useState(todayISO());
  const [exitTime, setExitTime] = useState('');
  const [returnTime, setReturnTime] = useState('');

  function openDialog() {
    setAttemptedSubmit(false);
    setFormDate(todayISO());
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setAttemptedSubmit(false);
    setStudentId(''); setReason(''); setExitTime(''); setReturnTime('');
  }

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await GatePassService.list(date || undefined, statusFilter || undefined);
      setRecords(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load gate passes');
    } finally {
      setIsLoading(false);
    }
  }, [date, statusFilter]);

  const handleSubmit = useCallback(async () => {
    setAttemptedSubmit(true);
    if (!studentId || !reason || !exitTime || !returnTime) return;
    const payload: CreateGatePassPayload = {
      student_id: studentId,
      date: formDate,
      reason,
      ...(exitTime && { exit_time: exitTime }),
      ...(returnTime && { return_time: returnTime }),
    };
    try {
      const created = await GatePassService.create(payload);
      setRecords(prev => [created, ...prev]);
      closeDialog();
      toast.success('Gate pass created');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create gate pass');
    }
  }, [studentId, reason, formDate, exitTime, returnTime]);

  const approve = useCallback(async (id: string) => {
    setActionId(id);
    try {
      const updated = await GatePassService.approve(id);
      setRecords(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Approved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setActionId(null); }
  }, []);

  const reject = useCallback(async (id: string) => {
    setActionId(id);
    try {
      const updated = await GatePassService.reject(id);
      setRecords(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Rejected');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setActionId(null); }
  }, []);

  return {
    records, isLoading, date, setDate, statusFilter, setStatusFilter, actionId,
    isDialogOpen, openDialog, closeDialog, fetch,
    studentId, setStudentId, reason, setReason, formDate, setFormDate, exitTime, setExitTime,
    returnTime, setReturnTime, handleSubmit, approve, reject, attemptedSubmit,
  };
}
