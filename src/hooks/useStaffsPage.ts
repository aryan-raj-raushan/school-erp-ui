'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StaffService, type StaffFilters } from '@/services/staff.service';
import { ROUTES } from '@/constants';
import type { Staff, PaginationMeta, BulkImportJob } from '@/types';

export function useStaffsPage(initialFilters: StaffFilters = {}) {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<StaffFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJob, setBulkJob] = useState<BulkImportJob | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const bulkFileRef = useRef<HTMLInputElement>(null);

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

  async function removeStaff(id: string) {
    try {
      await StaffService.remove(id);
      toast.success('Staff member deleted');
      await fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function offboardStaff(id: string) {
    try {
      await StaffService.offboard(id);
      toast.success('Staff member offboarded');
      await fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to offboard');
    }
  }

  async function reonboardStaff(id: string) {
    try {
      await StaffService.reonboard(id);
      toast.success('Staff member re-onboarded');
      await fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to re-onboard');
    }
  }

  async function resendInvite(id: string) {
    try {
      await StaffService.resendInvite(id);
      toast.success('Invite resent');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend invite');
    }
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

  function navigateToNew() { router.push(ROUTES.staffNew); }
  function navigateToView(id: string) { router.push(ROUTES.staffView(id)); }
  function navigateToEdit(id: string) { router.push(ROUTES.staffEdit(id)); }

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  return {
    staffList, pagination, filters, isLoading,
    removeStaff, offboardStaff, reonboardStaff, resendInvite,
    updateFilters, refetch: fetchStaff,
    navigateToNew, navigateToView, navigateToEdit,
    showBulkModal,
    openBulkModal: () => setShowBulkModal(true),
    closeBulkModal: () => { setShowBulkModal(false); setBulkJob(null); },
    bulkJob, bulkFileRef, isImporting, bulkImport, checkBulkStatus,
    downloadTemplate,
  };
}
