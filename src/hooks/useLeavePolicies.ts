'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { LeavePoliciesService, type CreateLeavePolicyPayload } from '@/services/leave.service';
import { AcademicYearsService } from '@/services/academic-years.service';
import type { LeavePolicy, LeaveType, AcademicYear } from '@/types';

export function useLeavePolicies() {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const fetchAcademicYears = useCallback(async () => {
    try {
      const res = await AcademicYearsService.list();
      setAcademicYears(res.items);
    } catch {
      // non-fatal
    }
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await LeavePoliciesService.list();
      setPolicies(data);
    } catch {
      toast.error('Failed to load leave policies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAcademicYears(); }, [fetchAcademicYears]);
  useEffect(() => { load(); }, [load]);

  const openCreate = useCallback(() => {
    setEditingPolicy(null);
    setIsDialogOpen(true);
  }, []);

  const openEdit = useCallback((policy: LeavePolicy) => {
    setEditingPolicy(policy);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingPolicy(null);
  }, []);

  const submit = useCallback(async (payload: CreateLeavePolicyPayload) => {
    setIsSaving(true);
    try {
      if (editingPolicy) {
        const updated = await LeavePoliciesService.update(editingPolicy.id, {
          name: payload.name,
          description: payload.description,
        });
        setPolicies((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success('Policy updated');
      } else {
        const created = await LeavePoliciesService.create(payload);
        setPolicies((prev) => [...prev, created]);
        toast.success('Policy created');
      }
      closeDialog();
    } catch {
      toast.error('Failed to save policy');
    } finally {
      setIsSaving(false);
    }
  }, [editingPolicy, closeDialog]);

  const updateLeaveType = useCallback(async (leaveTypeId: string, patch: Partial<LeaveType>) => {
    const sanitized = { ...patch, description: patch.description ?? undefined };
    try {
      const updated = await LeavePoliciesService.updateLeaveType(leaveTypeId, sanitized);
      setPolicies((prev) =>
        prev.map((p) => ({
          ...p,
          leave_types: p.leave_types?.map((lt) => (lt.id === updated.id ? updated : lt)),
        })),
      );
      toast.success('Leave type updated');
    } catch {
      toast.error('Failed to update leave type');
    }
  }, []);

  const provision = useCallback(async (policyId: string, staffIds: string[], academicYearId: string) => {
    try {
      await LeavePoliciesService.provision(policyId, staffIds, academicYearId);
      toast.success('Leave balances provisioned');
    } catch {
      toast.error('Failed to provision balances');
    }
  }, []);

  return {
    policies, isLoading, isSaving, isDialogOpen, editingPolicy, selectedPolicy,
    setSelectedPolicy, openCreate, openEdit, closeDialog, submit, updateLeaveType, provision, load,
    academicYears,
  };
}
