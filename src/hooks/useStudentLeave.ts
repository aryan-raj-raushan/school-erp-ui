'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { StudentLeaveService, type ReviewLeavePayload } from '@/services/leave.service';
import type { StudentLeaveRequest } from '@/types';

export function useStudentLeave() {
  const [requests, setRequests] = useState<StudentLeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StudentLeaveRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await StudentLeaveService.allRequests();
      setRequests(data);
    } catch {
      toast.error('Failed to load student leave requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openReview = useCallback((request: StudentLeaveRequest) => {
    setSelectedRequest(request);
    setReviewRemarks('');
  }, []);

  const closeReview = useCallback(() => {
    setSelectedRequest(null);
    setReviewRemarks('');
  }, []);

  const review = useCallback(async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    setIsReviewing(true);
    try {
      const payload: ReviewLeavePayload = { status, reviewer_remarks: reviewRemarks || undefined };
      const updated = await StudentLeaveService.review(selectedRequest.id, payload);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success(`Leave request ${status.toLowerCase()}`);
      closeReview();
    } catch {
      toast.error('Failed to review leave request');
    } finally {
      setIsReviewing(false);
    }
  }, [selectedRequest, reviewRemarks, closeReview]);

  return {
    requests,
    isLoading,
    isReviewing,
    selectedRequest,
    reviewRemarks,
    setReviewRemarks,
    openReview,
    closeReview,
    review,
  };
}
