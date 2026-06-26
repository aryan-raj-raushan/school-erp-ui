'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  LeaveApplicationService,
  LeaveAssignedService,
} from '@/services/emp-leave.service';
import {
  applyLeaveSchema,
  reviewLeaveSchema,
  type ApplyLeaveFormValues,
  type ReviewLeaveFormValues,
} from '@/lib/validations/leave.validation';
import type {
  LeaveApplication,
  LeaveApplicationFilters,
  EmployeeLeaveView,
} from '@/types/leave.types';
import type { PaginationMeta } from '@/types';
import { LEAVE_APPLICATION_PAGE } from '@/constants/emp-leave.constants';

export function useLeaveApplications(
  initialFilters: LeaveApplicationFilters = {},
) {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<LeaveApplicationFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  // Apply modal (employee flow)
  const [showApplyModal, setShowApplyModal] = useState(false);
  // Review modal (admin flow)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<LeaveApplication | null>(null);
  const [reviewingStatus, setReviewingStatus] = useState<'APPROVED' | 'REJECTED'>(
    'APPROVED',
  );

  // Leave types assigned to the current employee (for the apply dropdown)
  const [employeeLeaves, setEmployeeLeaves] = useState<EmployeeLeaveView[]>([]);
  const [isLoadingEmployeeLeaves, setIsLoadingEmployeeLeaves] = useState(false);

  const applyForm = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      leave_type_id: '',
      academic_year_id: '',
      start_date: '',
      end_date: '',
      reason: '',
    },
  });

  const reviewForm = useForm<ReviewLeaveFormValues>({
    resolver: zodResolver(reviewLeaveSchema),
    defaultValues: { status: 'APPROVED', remarks: '' },
  });

  // ─── Fetch list ─────────────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await LeaveApplicationService.list(filters);
      setApplications(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : LEAVE_APPLICATION_PAGE.toasts.fetchError,
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // ─── Apply leave ─────────────────────────────────────────────────────────────
  async function applyLeave(values: ApplyLeaveFormValues) {
    try {
      await LeaveApplicationService.apply({
        leave_type_id: values.leave_type_id,
        academic_year_id: values.academic_year_id,
        start_date: values.start_date,
        end_date: values.end_date,
        reason: values.reason || undefined,
      });
      toast.success(LEAVE_APPLICATION_PAGE.toasts.applySuccess);
      setShowApplyModal(false);
      applyForm.reset();
      await fetchApplications();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : LEAVE_APPLICATION_PAGE.toasts.applyError,
      );
    }
  }

  // ─── Review leave (approve / reject) ─────────────────────────────────────────
  async function reviewLeave(values: ReviewLeaveFormValues) {
    if (!selectedApplication) return;
    try {
      await LeaveApplicationService.review(selectedApplication.id, {
        status: values.status,
        remarks: values.remarks || undefined,
      });
      toast.success(
        values.status === 'APPROVED'
          ? LEAVE_APPLICATION_PAGE.toasts.approveSuccess
          : LEAVE_APPLICATION_PAGE.toasts.rejectSuccess,
      );
      setShowReviewModal(false);
      setSelectedApplication(null);
      reviewForm.reset();
      await fetchApplications();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : LEAVE_APPLICATION_PAGE.toasts.reviewError,
      );
    }
  }

  // ─── Cancel leave (employee) ──────────────────────────────────────────────────
  async function cancelLeave(id: string) {
    try {
      await LeaveApplicationService.cancel(id);
      toast.success(LEAVE_APPLICATION_PAGE.toasts.cancelSuccess);
      await fetchApplications();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : LEAVE_APPLICATION_PAGE.toasts.cancelError,
      );
    }
  }

  // ─── Open review modal ────────────────────────────────────────────────────────
  function openReviewModal(
    application: LeaveApplication,
    status: 'APPROVED' | 'REJECTED',
  ) {
    setSelectedApplication(application);
    setReviewingStatus(status);
    reviewForm.reset({ status, remarks: '' });
    setShowReviewModal(true);
  }

  // ─── Open apply modal (fetch employee's assigned leaves first) ────────────────
  async function openApplyModal(employeeId: string) {
    setIsLoadingEmployeeLeaves(true);
    setShowApplyModal(true);
    applyForm.reset();
    try {
      const result = await LeaveAssignedService.listByEmployee(employeeId, {
        limit: 100,
      });
      setEmployeeLeaves(result.items);
    } catch {
      setEmployeeLeaves([]);
    } finally {
      setIsLoadingEmployeeLeaves(false);
    }
  }

  function updateFilters(next: Partial<LeaveApplicationFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    pagination,
    filters,
    isLoading,
    updateFilters,
    cancelLeave,
    refetch: fetchApplications,

    // Apply modal
    showApplyModal,
    openApplyModal,
    closeApplyModal: () => {
      setShowApplyModal(false);
      applyForm.reset();
    },
    applyForm,
    handleApply: applyForm.handleSubmit(applyLeave),
    isApplying: applyForm.formState.isSubmitting,
    employeeLeaves,
    isLoadingEmployeeLeaves,

    // Review modal
    showReviewModal,
    openReviewModal,
    closeReviewModal: () => {
      setShowReviewModal(false);
      setSelectedApplication(null);
      reviewForm.reset();
    },
    reviewForm,
    handleReview: reviewForm.handleSubmit(reviewLeave),
    isReviewing: reviewForm.formState.isSubmitting,
    selectedApplication,
    reviewingStatus,
  };
}