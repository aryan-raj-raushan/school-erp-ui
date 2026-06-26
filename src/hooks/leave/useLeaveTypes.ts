'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LeaveTypeService } from '@/services/emp-leave.service';
import { leaveTypeSchema,type LeaveTypeFormValues, } from '@/lib/validations/leave.validation';
import type { LeaveType, LeaveTypeFilters } from '@/types/leave.types';
import type { PaginationMeta } from '@/types';
import { LEAVE_TYPE_PAGE } from '@/constants/emp-leave.constants';

// ─── List hook ────────────────────────────────────────────────────────────────
export function useLeaveTypes(initialFilters: LeaveTypeFilters = {}) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<LeaveTypeFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaveTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await LeaveTypeService.list(filters);
      setLeaveTypes(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : LEAVE_TYPE_PAGE.toasts.fetchError,
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function deleteLeaveType(id: string) {
    try {
      await LeaveTypeService.remove(id);
      toast.success(LEAVE_TYPE_PAGE.toasts.deleteSuccess);
      await fetchLeaveTypes();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : LEAVE_TYPE_PAGE.toasts.deleteError,
      );
    }
  }

  function updateFilters(next: Partial<LeaveTypeFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  return {
    leaveTypes,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteLeaveType,
    refetch: fetchLeaveTypes,
  };
}

// ─── Detail / create / edit hook ──────────────────────────────────────────────
export function useLeaveTypeDetail(id?: string) {
  const isNew = id === 'create-new';
  const [leaveType, setLeaveType] = useState<LeaveType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);

  const form = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      leave_name: '',
      leave_validity: 'YEARLY',
      leave_pay_type: 'PAID',
      leave_count_days: 1,
      is_enabled: true,
    },
  });

  const fetchLeaveType = useCallback(async () => {
    if (!id || isNew) return;
    setIsLoading(true);
    try {
      const data = await LeaveTypeService.getById(id);
      setLeaveType(data);
      form.reset({
        leave_name: data.leave_name,
        leave_validity: data.leave_validity,
        leave_pay_type: data.leave_pay_type,
        leave_count_days: data.leave_count_days,
        is_enabled: data.is_enabled,
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : LEAVE_TYPE_PAGE.toasts.fetchError,
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew, form]);

  async function submit(values: LeaveTypeFormValues): Promise<LeaveType | null> {
    try {
      if (isNew) {
        const created = await LeaveTypeService.create(values);
        toast.success(LEAVE_TYPE_PAGE.toasts.createSuccess);
        return created;
      } else {
        const updated = await LeaveTypeService.update(id!, values);
        setLeaveType(updated);
        toast.success(LEAVE_TYPE_PAGE.toasts.updateSuccess);
        setIsEditing(false);
        return updated;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
      return null;
    }
  }

  useEffect(() => {
    fetchLeaveType();
  }, [fetchLeaveType]);

  return {
    leaveType,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    isNew,
    handleSubmit: form.handleSubmit(submit),
    isSubmitting: form.formState.isSubmitting,
  };
}