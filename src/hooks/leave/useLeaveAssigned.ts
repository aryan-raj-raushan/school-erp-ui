'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LeaveAssignedService, LeaveTypeService } from '@/services/emp-leave.service';
import {
  assignLeaveSchema,
  type AssignLeaveFormValues,
} from'@/lib/validations/leave.validation';
import type {
  EmployeeLeaveView,
  LeaveType,
  AssignedLeaveFilters,
} from '@/types/leave.types';
import type { PaginationMeta } from '@/types';
import { LEAVE_ASSIGNED_PAGE } from '@/constants/emp-leave.constants';

export function useLeaveAssigned(
  employeeId: string,
  initialFilters: AssignedLeaveFilters = {},
) {
  const [assignedLeaves, setAssignedLeaves] = useState<EmployeeLeaveView[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<AssignedLeaveFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Available enabled leave types for the dropdown in the assign modal
  const [availableLeaveTypes, setAvailableLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoadingLeaveTypes, setIsLoadingLeaveTypes] = useState(false);

  const form = useForm<AssignLeaveFormValues>({
    resolver: zodResolver(assignLeaveSchema),
    defaultValues: { leave_type_id: '', academic_year_id: '' },
  });

  const fetchAssigned = useCallback(async () => {
    if (!employeeId) return;
    setIsLoading(true);
    try {
      const result = await LeaveAssignedService.listByEmployee(employeeId, filters);
      setAssignedLeaves(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : LEAVE_ASSIGNED_PAGE.toasts.fetchError,
      );
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, filters]);

  const fetchAvailableLeaveTypes = useCallback(async () => {
    setIsLoadingLeaveTypes(true);
    try {
      const result = await LeaveTypeService.list({ is_enabled: true, limit: 100 });
      setAvailableLeaveTypes(result.items);
    } catch {
      // non-critical — dropdown will just be empty
    } finally {
      setIsLoadingLeaveTypes(false);
    }
  }, []);

  async function assignLeave(values: AssignLeaveFormValues) {
    try {
      await LeaveAssignedService.assign(employeeId, {
        leave_type_id: values.leave_type_id,
        academic_year_id: values.academic_year_id,
      });
      toast.success(LEAVE_ASSIGNED_PAGE.toasts.assignSuccess);
      setShowAssignModal(false);
      form.reset();
      await fetchAssigned();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : LEAVE_ASSIGNED_PAGE.toasts.assignError,
      );
    }
  }

  async function revokeLeave(assignmentId: string) {
    try {
      await LeaveAssignedService.revoke(employeeId, assignmentId);
      toast.success(LEAVE_ASSIGNED_PAGE.toasts.revokeSuccess);
      await fetchAssigned();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : LEAVE_ASSIGNED_PAGE.toasts.revokeError,
      );
    }
  }

  function updateFilters(next: Partial<AssignedLeaveFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  function openAssignModal() {
    form.reset();
    fetchAvailableLeaveTypes();
    setShowAssignModal(true);
  }

  function closeAssignModal() {
    setShowAssignModal(false);
    form.reset();
  }

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  return {
    assignedLeaves,
    pagination,
    filters,
    isLoading,
    updateFilters,
    revokeLeave,
    refetch: fetchAssigned,
    // Assign modal
    showAssignModal,
    openAssignModal,
    closeAssignModal,
    form,
    handleAssign: form.handleSubmit(assignLeave),
    isAssigning: form.formState.isSubmitting,
    availableLeaveTypes,
    isLoadingLeaveTypes,
  };
}