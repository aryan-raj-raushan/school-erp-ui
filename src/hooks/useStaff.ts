'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { StaffService, type CreateStaffPayload, type UpdateStaffPayload, type StaffFilters } from '@/services/staff.service';
import type { Staff, StaffStatus, PaginationMeta, BulkImportJob } from '@/types';

const staffSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone_number: z.string().optional(),
  dial_code: z.string().optional(),
  employee_id: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  staff_role: z.enum(['TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'COUNSELOR', 'COORDINATOR', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN_STAFF', 'OTHER']).optional(),
  date_of_joining: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

const offboardSchema = z.object({
  reason: z.string().optional(),
  offboard_date: z.string().optional(),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
export type OffboardFormValues = z.infer<typeof offboardSchema>;

export function useStaff(initialFilters: StaffFilters = {}) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<StaffFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showOffboardModal, setShowOffboardModal] = useState(false);
  const [offboardingStaff, setOffboardingStaff] = useState<Staff | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJob, setBulkJob] = useState<BulkImportJob | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { dial_code: '+91' },
  });

  const editForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
  });

  const offboardForm = useForm<OffboardFormValues>({
    resolver: zodResolver(offboardSchema),
  });

  const fetchStaff = useCallback(async (overrideFilters?: StaffFilters) => {
    setIsLoading(true);
    try {
      const result = await StaffService.list(overrideFilters ?? filters);
      setStaffList(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load staff');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function createStaff(values: StaffFormValues) {
    const payload: CreateStaffPayload = {
      first_name: values.first_name,
      ...(values.last_name && { last_name: values.last_name }),
      ...(values.email && { email: values.email }),
      ...(values.phone_number && { phone_number: values.phone_number, dial_code: values.dial_code ?? '+91' }),
      ...(values.employee_id && { employee_id: values.employee_id }),
      ...(values.designation && { designation: values.designation }),
      ...(values.department && { department: values.department }),
      ...(values.staff_role && { staff_role: values.staff_role }),
      ...(values.date_of_joining && { date_of_joining: values.date_of_joining }),
      ...(values.date_of_birth && { date_of_birth: values.date_of_birth }),
      ...(values.gender && { gender: values.gender }),
    };
    const staff = await StaffService.create(payload);
    toast.success(`${staff.first_name} added`);
    await fetchStaff();
    setShowModal(false);
    form.reset();
  }

  async function updateStaff(values: StaffFormValues) {
    if (!editingStaff) return;
    const payload: UpdateStaffPayload = {
      first_name: values.first_name,
      ...(values.last_name && { last_name: values.last_name }),
      ...(values.email && { email: values.email }),
      ...(values.phone_number && { phone_number: values.phone_number, dial_code: values.dial_code ?? '+91' }),
      ...(values.employee_id && { employee_id: values.employee_id }),
      ...(values.designation && { designation: values.designation }),
      ...(values.department && { department: values.department }),
      ...(values.staff_role && { staff_role: values.staff_role }),
      ...(values.date_of_joining && { date_of_joining: values.date_of_joining }),
      ...(values.date_of_birth && { date_of_birth: values.date_of_birth }),
      ...(values.gender && { gender: values.gender }),
    };
    const staff = await StaffService.update(editingStaff.id, payload);
    toast.success(`${staff.first_name} updated`);
    await fetchStaff();
    setShowEditModal(false);
    setEditingStaff(null);
    editForm.reset();
  }

  async function deleteStaff(id: string) {
    try {
      await StaffService.remove(id);
      toast.success('Staff member deleted');
      await fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function offboardStaff(values: OffboardFormValues) {
    if (!offboardingStaff) return;
    try {
      await StaffService.offboard(offboardingStaff.id, {
        ...(values.reason && { reason: values.reason }),
        ...(values.offboard_date && { offboard_date: values.offboard_date }),
      });
      toast.success(`${offboardingStaff.first_name} offboarded`);
      await fetchStaff();
      setShowOffboardModal(false);
      setOffboardingStaff(null);
      offboardForm.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to offboard');
    }
  }

  async function reonboardStaff(id: string) {
    try {
      const staff = await StaffService.reonboard(id);
      toast.success(`${staff.first_name} re-onboarded`);
      await fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to re-onboard');
    }
  }

  async function resendInvite(userId: string) {
    try {
      await StaffService.resendInvite(userId);
      toast.success('Invite resent');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend invite');
    }
  }

  function openEditModal(staff: Staff) {
    setEditingStaff(staff);
    editForm.reset({
      first_name: staff.first_name,
      last_name: staff.last_name ?? '',
      email: staff.email ?? '',
      phone_number: staff.phone_number ?? '',
      dial_code: staff.dial_code ?? '+91',
      employee_id: staff.employee_id ?? '',
      designation: staff.designation ?? '',
      department: staff.department ?? '',
      staff_role: staff.staff_role ?? undefined,
      date_of_joining: staff.date_of_joining ?? '',
      date_of_birth: staff.date_of_birth ?? '',
      gender: staff.gender ?? undefined,
    });
    setShowEditModal(true);
  }

  function openOffboardModal(staff: Staff) {
    setOffboardingStaff(staff);
    offboardForm.reset();
    setShowOffboardModal(true);
  }

  async function downloadTemplate() {
    try {
      const blob = await StaffService.downloadBulkTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'staff-import-template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to download template');
    }
  }

  async function bulkImport() {
    const file = bulkFileRef.current?.files?.[0];
    if (!file) { toast.error('Select a file first'); return; }
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { jobId } = await StaffService.bulkImport(formData);
      toast.success(`Import started — Job ID: ${jobId}`);
      setBulkJob({ jobId, status: 'PENDING' });
      if (bulkFileRef.current) bulkFileRef.current.value = '';
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk import failed');
    } finally {
      setIsImporting(false);
    }
  }

  async function checkBulkStatus() {
    if (!bulkJob?.jobId) return;
    try {
      const job = await StaffService.getBulkStatus(bulkJob.jobId);
      setBulkJob(job);
      if (job.status === 'COMPLETED') {
        toast.success(`Import complete — ${job.processed ?? 0} processed`);
        await fetchStaff();
        setShowBulkModal(false);
        setBulkJob(null);
      } else if (job.status === 'FAILED') {
        toast.error('Import failed');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to check status');
    }
  }

  function updateFilters(next: Partial<StaffFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  return {
    staffList, pagination, filters, isLoading,
    showModal,
    openModal: () => setShowModal(true),
    closeModal: () => { setShowModal(false); form.reset(); },
    form,
    handleSubmit: form.handleSubmit(createStaff),
    isSubmitting: form.formState.isSubmitting,
    showEditModal,
    editingStaff,
    openEditModal,
    closeEditModal: () => { setShowEditModal(false); setEditingStaff(null); editForm.reset(); },
    editForm,
    handleEditSubmit: editForm.handleSubmit(updateStaff),
    isEditSubmitting: editForm.formState.isSubmitting,
    deleteStaff,
    showOffboardModal,
    offboardingStaff,
    openOffboardModal,
    closeOffboardModal: () => { setShowOffboardModal(false); setOffboardingStaff(null); offboardForm.reset(); },
    offboardForm,
    handleOffboardSubmit: offboardForm.handleSubmit(offboardStaff),
    reonboardStaff,
    resendInvite,
    showBulkModal,
    openBulkModal: () => setShowBulkModal(true),
    closeBulkModal: () => { setShowBulkModal(false); setBulkJob(null); },
    bulkJob,
    bulkFileRef,
    isImporting,
    bulkImport,
    checkBulkStatus,
    downloadTemplate,
    updateFilters,
    refetch: fetchStaff,
  };
}
