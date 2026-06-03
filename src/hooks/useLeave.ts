'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  LeavePoliciesService,
  TeacherLeaveService,
  StudentLeaveService,
  ParentLeaveService,
  type CreateLeavePolicyPayload,
  type ReviewLeavePayload,
} from '@/services/leave.service';
import { useAcademicYears } from './useAcademicYears';
import { useAuthStore } from '@/store/auth.store';
import type {
  LeavePolicy,
  TeacherLeaveRequest,
  StudentLeaveRequest,
  LeaveBalance,
} from '@/types';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const leaveTypeSchema = z.object({
  name: z.string().min(1, 'Name required'),
  max_days: z.string().min(1, 'Days required'),
  is_paid: z.boolean().optional(),
  description: z.string().optional(),
});

const policySchema = z.object({
  name: z.string().min(1, 'Policy name required'),
  description: z.string().optional(),
  leave_types: z.array(leaveTypeSchema).min(1, 'Add at least one leave type'),
});

const applyLeaveSchema = z.object({
  leave_type_id: z.string().min(1, 'Leave type required'),
  from_date: z.string().min(1, 'From date required'),
  to_date: z.string().min(1, 'To date required'),
  reason: z.string().min(1, 'Reason required'),
});

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewer_remarks: z.string().optional(),
});

const applyStudentLeaveSchema = z.object({
  student_id: z.string().min(1, 'Student required'),
  from_date: z.string().min(1, 'From date required'),
  to_date: z.string().min(1, 'To date required'),
  reason: z.string().min(1, 'Reason required'),
});

export type PolicyFormValues = z.infer<typeof policySchema>;
export type ApplyLeaveFormValues = z.infer<typeof applyLeaveSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
export type ApplyStudentLeaveFormValues = z.infer<typeof applyStudentLeaveSchema>;

// ─── useLeavePolicy (SCHOOL_ADMIN) ────────────────────────────────────────────

export function useLeavePolicy() {
  const { years, currentYear } = useAcademicYears();
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionAcademicYearId, setProvisionAcademicYearId] = useState('');

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      name: '',
      description: '',
      leave_types: [{ name: '', max_days: '1', is_paid: true, description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'leave_types',
  });

  useEffect(() => {
    if (currentYear && !provisionAcademicYearId) {
      setProvisionAcademicYearId(currentYear.id);
    }
  }, [currentYear, provisionAcademicYearId]);

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await LeavePoliciesService.list();
      setPolicies(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  async function handleSelectPolicy(policy: LeavePolicy) {
    try {
      const detail = await LeavePoliciesService.getById(policy.id);
      setSelectedPolicy(detail);
    } catch {
      setSelectedPolicy(policy);
    }
  }

  async function handleCreate(values: PolicyFormValues) {
    if (!currentYear) return;
    setIsSaving(true);
    try {
      const payload: CreateLeavePolicyPayload = {
        name: values.name,
        academic_year_id: currentYear.id,
        description: values.description,
        leave_types: values.leave_types.map((lt) => ({
          name: lt.name,
          max_days: Number(lt.max_days),
          is_paid: lt.is_paid ?? true,
          description: lt.description,
        })),
      };
      await LeavePoliciesService.create(payload);
      toast.success('Leave policy created');
      form.reset();
      setShowModal(false);
      await fetchPolicies();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create policy');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleProvision(staffIds: string[]) {
    if (!selectedPolicy || !provisionAcademicYearId) return;
    setIsSaving(true);
    try {
      await LeavePoliciesService.provision(selectedPolicy.id, staffIds, provisionAcademicYearId);
      toast.success('Leave balances provisioned for staff');
      setShowProvisionModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to provision');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    years,
    policies,
    selectedPolicy,
    isLoading,
    isSaving,
    showModal, setShowModal,
    showProvisionModal, setShowProvisionModal,
    provisionAcademicYearId, setProvisionAcademicYearId,
    form,
    fields,
    append,
    remove,
    handleSelectPolicy,
    handleCreate,
    handleProvision,
  };
}

// ─── useLeaveManagement (SCHOOL_ADMIN: view + review all requests) ─────────────

export function useLeaveManagement() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [teacherRequests, setTeacherRequests] = useState<TeacherLeaveRequest[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentLeaveRequest[]>([]);
  const [staffSummary, setStaffSummary] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewType, setReviewType] = useState<'teacher' | 'student'>('teacher');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const reviewForm = useForm<ReviewFormValues>({ resolver: zodResolver(reviewSchema) });

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [currentYear, selectedAcademicYearId]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tr, sr] = await Promise.all([
        TeacherLeaveService.allRequests(),
        StudentLeaveService.allRequests(),
      ]);
      setTeacherRequests(tr);
      setStudentRequests(sr);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStaffSummary = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    try {
      const data = await TeacherLeaveService.staffSummary(selectedAcademicYearId);
      setStaffSummary(data);
    } catch {
      // ignore
    }
  }, [selectedAcademicYearId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchStaffSummary(); }, [fetchStaffSummary]);

  function openReview(id: string, type: 'teacher' | 'student') {
    setReviewingId(id);
    setReviewType(type);
    reviewForm.reset({ status: 'APPROVED', reviewer_remarks: '' });
    setShowReviewModal(true);
  }

  async function handleReview(values: ReviewFormValues) {
    if (!reviewingId) return;
    setIsSaving(true);
    try {
      const payload: ReviewLeavePayload = {
        status: values.status,
        reviewer_remarks: values.reviewer_remarks,
      };
      if (reviewType === 'teacher') {
        await TeacherLeaveService.review(reviewingId, payload);
      } else {
        await StudentLeaveService.review(reviewingId, payload);
      }
      toast.success(`Leave ${values.status.toLowerCase()}`);
      setShowReviewModal(false);
      await fetchAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to review');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    teacherRequests,
    studentRequests,
    staffSummary,
    isLoading,
    isSaving,
    showReviewModal, setShowReviewModal,
    reviewForm,
    openReview,
    handleReview,
  };
}

// ─── useMyLeave (TEACHER: apply + own history + summary) ─────────────────────

export function useMyLeave() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [myRequests, setMyRequests] = useState<TeacherLeaveRequest[]>([]);
  const [myBalances, setMyBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const applyForm = useForm<ApplyLeaveFormValues>({ resolver: zodResolver(applyLeaveSchema) });

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [currentYear, selectedAcademicYearId]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pol, reqs] = await Promise.all([
        LeavePoliciesService.list(),
        TeacherLeaveService.myRequests(),
      ]);
      setPolicies(pol);
      setMyRequests(reqs);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load leave data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBalances = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    try {
      const data = await TeacherLeaveService.mySummary(selectedAcademicYearId);
      setMyBalances(data);
    } catch {
      // ignore
    }
  }, [selectedAcademicYearId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  // All leave types from all policies flattened
  const leaveTypes = policies.flatMap((p) => p.leave_types ?? []);

  async function handleApply(values: ApplyLeaveFormValues) {
    setIsSaving(true);
    try {
      await TeacherLeaveService.apply({
        leave_type_id: values.leave_type_id,
        from_date: values.from_date,
        to_date: values.to_date,
        reason: values.reason,
      });
      toast.success('Leave applied successfully');
      applyForm.reset();
      setShowApplyModal(false);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to apply for leave');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    leaveTypes,
    myRequests,
    myBalances,
    isLoading,
    isSaving,
    showApplyModal, setShowApplyModal,
    applyForm,
    handleApply,
  };
}
