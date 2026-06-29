'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { StudentLeaveService, ParentLeaveService, type ReviewLeavePayload } from '@/services/leave.service';
import { ClassesService } from '@/services/classes.service';
import { StudentsService } from '@/services/students.service';
import type { StudentLeaveRequest, Student, Section, Class } from '@/types';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function useStudentLeave() {
  // List
  const [requests, setRequests] = useState<StudentLeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Review
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StudentLeaveRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Apply on behalf
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyClasses, setApplyClasses] = useState<Class[]>([]);
  const [applySections, setApplySections] = useState<Section[]>([]);
  const [applySectionId, setApplySectionId] = useState('');
  const [applyStudents, setApplyStudents] = useState<Student[]>([]);
  const [applyStudentId, setApplyStudentId] = useState('');
  const [isLoadingApplyStudents, setIsLoadingApplyStudents] = useState(false);
  const [applyFromDate, setApplyFromDate] = useState(todayISO());
  const [applyToDate, setApplyToDate] = useState(todayISO());
  const [applyReason, setApplyReason] = useState('');

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

  const fetchSectionsForApply = useCallback(async () => {
    try {
      const res = await ClassesService.list();
      setApplyClasses(res.items);
      setApplySections(res.sections);
    } catch {
      // non-fatal
    }
  }, []);

  const fetchStudentsForApply = useCallback(async (sectionId: string) => {
    if (!sectionId) {
      setApplyStudents([]);
      setApplyStudentId('');
      return;
    }
    setIsLoadingApplyStudents(true);
    try {
      const res = await StudentsService.list({ section_id: sectionId, limit: 100 });
      setApplyStudents(res.items);
      setApplyStudentId('');
    } catch {
      toast.error('Failed to load students');
    } finally {
      setIsLoadingApplyStudents(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchSectionsForApply(); }, [fetchSectionsForApply]);
  useEffect(() => { fetchStudentsForApply(applySectionId); }, [applySectionId, fetchStudentsForApply]);

  const openApply = useCallback(() => {
    setApplySectionId('');
    setApplyStudentId('');
    setApplyFromDate(todayISO());
    setApplyToDate(todayISO());
    setApplyReason('');
    setIsApplyOpen(true);
  }, []);

  const closeApply = useCallback(() => {
    setIsApplyOpen(false);
  }, []);

  const applyLeave = useCallback(async () => {
    if (!applyStudentId) { toast.error('Select a student'); return; }
    if (!applyFromDate || !applyToDate) { toast.error('Select date range'); return; }
    if (!applyReason.trim()) { toast.error('Enter a reason'); return; }
    if (applyFromDate > applyToDate) { toast.error('Start date must be before end date'); return; }

    setIsApplying(true);
    try {
      const created = await ParentLeaveService.apply({
        student_id: applyStudentId,
        from_date: applyFromDate,
        to_date: applyToDate,
        reason: applyReason.trim(),
      });
      setRequests((prev) => [created, ...prev]);
      toast.success('Leave request submitted');
      closeApply();
    } catch {
      toast.error('Failed to submit leave request');
    } finally {
      setIsApplying(false);
    }
  }, [applyStudentId, applyFromDate, applyToDate, applyReason, closeApply]);

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

  const sectionOptions = applySections.map((s) => ({
    id: s.id,
    label: `${applyClasses.find((c) => c.id === s.class_id)?.name ?? ''} - Section ${s.name}`,
  }));

  return {
    requests,
    isLoading,
    // Review
    isReviewing,
    selectedRequest,
    reviewRemarks,
    setReviewRemarks,
    openReview,
    closeReview,
    review,
    // Apply on behalf
    isApplyOpen,
    isApplying,
    sectionOptions,
    applySectionId,
    setApplySectionId,
    applyStudents,
    applyStudentId,
    setApplyStudentId,
    isLoadingApplyStudents,
    applyFromDate,
    setApplyFromDate,
    applyToDate,
    setApplyToDate,
    applyReason,
    setApplyReason,
    openApply,
    closeApply,
    applyLeave,
  };
}
