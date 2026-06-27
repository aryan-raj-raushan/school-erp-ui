'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LeaveApplicationService, LeaveAssignedService } from '@/services/emp-leave.service';
import { StaffService } from '@/services/staff.service';
import type { Staff } from '@/types';
import type { EmployeeLeaveView, LeaveApplication } from '@/types/leave.types';
import { LEAVE_APPLY_PAGE } from '@/constants/emp-leave.constants';

import { adminApplyLeaveSchema, type AdminApplyLeaveFormValues } from '@/lib/validations/leave.validation';
import { useAuthStore } from '@/store/auth.store';

export function useLeaveApply() {
  const currentUser = useAuthStore((s) => s.user);

  // ─── Employee search state ─────────────────────────────────────────────────
  const [staffSearch, setStaffSearch] = useState('');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Staff | null>(null);
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);

  // ─── Leave balance state for selected employee ─────────────────────────────
  const [employeeLeaves, setEmployeeLeaves] = useState<EmployeeLeaveView[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);

  // ─── Recent applications for the selected target (for the summary panel) ──
  const [recentApplications, setRecentApplications] = useState<LeaveApplication[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // ─── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<AdminApplyLeaveFormValues>({
    resolver: zodResolver(adminApplyLeaveSchema),
    defaultValues: {
      apply_mode: 'self',
      employee_id: '',
      academic_year_id: '',
      leave_type_id: '',
      start_date: '',
      end_date: '',
      reason: '',
    },
  });

  const applyMode = useWatch({ control: form.control, name: 'apply_mode' });
  const selectedAcademicYearId = useWatch({ control: form.control, name: 'academic_year_id' });
  const selectedLeaveTypeId = useWatch({ control: form.control, name: 'leave_type_id' });
  const startDate = useWatch({ control: form.control, name: 'start_date' });
  const endDate = useWatch({ control: form.control, name: 'end_date' });

  // ─── Derived: the effective employee id based on mode ─────────────────────
  const effectiveEmployeeId =
    applyMode === 'self' ? (currentUser?.id ?? '') : (selectedEmployee?.id ?? '');

  // ─── Computed total days (inclusive) ──────────────────────────────────────
  const totalDays =
    startDate && endDate && new Date(endDate) >= new Date(startDate)
      ? Math.floor(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : 0;

  // ─── Current leave balance for the selected leave type ────────────────────
  const currentLeaveBalance = employeeLeaves.find(
    (el) => el.leave_type_id === selectedLeaveTypeId,
  ) ?? null;

  // ─── Fetch staff for picker ─────────────────────────────────────────────────
  const fetchStaff = useCallback(async (q: string) => {
    setIsLoadingStaff(true);
    try {
      const result = await StaffService.list({ search: q || undefined, limit: 20 });
      setStaffList(result.items);
    } catch {
      setStaffList([]);
    } finally {
      setIsLoadingStaff(false);
    }
  }, []);

  // Initial staff load
  useEffect(() => {
    fetchStaff('');
  }, [fetchStaff]);

  // Debounced staff search
  useEffect(() => {
    const t = setTimeout(() => fetchStaff(staffSearch), 350);
    return () => clearTimeout(t);
  }, [staffSearch, fetchStaff]);

  // ─── Fetch employee's assigned leaves when employee + academic year change ──
  useEffect(() => {
    if (!effectiveEmployeeId || !selectedAcademicYearId) {
      setEmployeeLeaves([]);
      return;
    }
    setIsLoadingLeaves(true);
    LeaveAssignedService.listByEmployee(effectiveEmployeeId, {
      academic_year_id: selectedAcademicYearId,
      limit: 100,
    })
      .then((r) => setEmployeeLeaves(r.items))
      .catch(() => {
        toast.error(LEAVE_APPLY_PAGE.toasts.fetchEmployeeLeavesError);
        setEmployeeLeaves([]);
      })
      .finally(() => setIsLoadingLeaves(false));

    // Reset leave type when employee or year changes
    form.setValue('leave_type_id', '');
  }, [effectiveEmployeeId, selectedAcademicYearId, form]);

  // ─── Fetch recent applications for selected employee ───────────────────────
  useEffect(() => {
    if (!effectiveEmployeeId) {
      setRecentApplications([]);
      return;
    }
    setIsLoadingRecent(true);
    LeaveApplicationService.list({
      employee_id: effectiveEmployeeId,
      limit: 5,
    })
      .then((r) => setRecentApplications(r.items))
      .catch(() => setRecentApplications([]))
      .finally(() => setIsLoadingRecent(false));
  }, [effectiveEmployeeId]);

  // ─── When mode switches, clear employee selection ─────────────────────────
  useEffect(() => {
    if (applyMode === 'self') {
      setSelectedEmployee(null);
      form.setValue('employee_id', '');
    }
    form.setValue('leave_type_id', '');
    form.setValue('academic_year_id', '');
  }, [applyMode, form]);

  // ─── Employee picker handlers ──────────────────────────────────────────────
  function selectEmployee(staff: Staff) {
    setSelectedEmployee(staff);
    form.setValue('employee_id', staff.id);
    setShowEmployeePicker(false);
    setStaffSearch('');
  }

  function clearEmployee() {
    setSelectedEmployee(null);
    form.setValue('employee_id', '');
    form.setValue('leave_type_id', '');
    setEmployeeLeaves([]);
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(values: AdminApplyLeaveFormValues) {
    try {
      await LeaveApplicationService.adminApply({
        employee_id: effectiveEmployeeId,
        leave_type_id: values.leave_type_id,
        academic_year_id: values.academic_year_id,
        start_date: values.start_date,
        end_date: values.end_date,
        reason: values.reason || undefined,
      });
      toast.success(LEAVE_APPLY_PAGE.toasts.submitSuccess);
      // Refresh recent applications
      const updated = await LeaveApplicationService.list({
        employee_id: effectiveEmployeeId,
        limit: 5,
      });
      setRecentApplications(updated.items);
      // Reset form fields except mode and employee
      form.reset({
        apply_mode: values.apply_mode,
        employee_id: values.employee_id,
        academic_year_id: values.academic_year_id,
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : LEAVE_APPLY_PAGE.toasts.submitError,
      );
    }
  }

  function resetForm() {
    form.reset();
    setSelectedEmployee(null);
    setEmployeeLeaves([]);
    setRecentApplications([]);
  }

  return {
    form,
    applyMode,
    effectiveEmployeeId,
    totalDays,
    currentLeaveBalance,
    employeeLeaves,
    isLoadingLeaves,

    // Staff picker
    staffSearch,
    setStaffSearch,
    staffList,
    isLoadingStaff,
    selectedEmployee,
    showEmployeePicker,
    setShowEmployeePicker,
    selectEmployee,
    clearEmployee,

    // Recent applications panel
    recentApplications,
    isLoadingRecent,

    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: form.formState.isSubmitting,
    resetForm,
  };
}