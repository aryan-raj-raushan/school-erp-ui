'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CertificatesService } from '@/services/certificates.service';
import type {
  TransferCertificateListRow,
  BonafideCertificateListRow,
  TransferCertificateDetail,
  BonafideCertificateDetail,
  CertificateFilters,
} from '../types/certificates.types';
import type { PaginationMeta } from '@/types';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const transferCertSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  academic_year_id: z.string().min(1, 'Academic year is required'),
  class_id: z.string().min(1, 'Class is required'),
  section_id: z.string().optional(),
  qualified_for_higher_class: z.string().min(1, 'This field is required'),
  leaving_date: z.string().min(1, 'Leaving date is required'),
  total_working_days: z.coerce.number().min(0, 'Must be 0 or more'),
  total_present: z.coerce.number().min(0, 'Must be 0 or more'),
  extra_activities: z.string().optional(),
  candidate_character: z.string().min(1, 'Character is required'),
  leaving_reason: z.string().min(1, 'Leaving reason is required'),
  fees_due: z.string().min(1, 'Fees due is required'),
});

export const bonafideCertSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  academic_year_id: z.string().min(1, 'Academic year is required'),
  class_id: z.string().min(1, 'Class is required'),
  section_id: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
});

export type TransferCertFormValues = z.infer<typeof transferCertSchema>;
export type BonafideCertFormValues = z.infer<typeof bonafideCertSchema>;

// ─── Transfer List Hook ───────────────────────────────────────────────────────

export function useTransferCertificates(initialFilters: CertificateFilters = {}) {
  const [certificates, setCertificates] = useState<TransferCertificateListRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<CertificateFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await CertificatesService.listTransfer(filters);
      console.log("result from hook : ", result);
      setCertificates(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load transfer certificates');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  function updateFilters(next: Partial<CertificateFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return { certificates, pagination, filters, isLoading, updateFilters, refetch: fetchCertificates };
}

// ─── Bonafide List Hook ───────────────────────────────────────────────────────

export function useBonafideCertificates(initialFilters: CertificateFilters = {}) {
  const [certificates, setCertificates] = useState<BonafideCertificateListRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<CertificateFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await CertificatesService.listBonafide(filters);
      setCertificates(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load bonafide certificates');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  function updateFilters(next: Partial<CertificateFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return { certificates, pagination, filters, isLoading, updateFilters, refetch: fetchCertificates };
}

// ─── Transfer Detail Hook ─────────────────────────────────────────────────────

export function useTransferCertificateDetail(id?: string) {
  const [certificate, setCertificate] = useState<TransferCertificateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCertificate = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await CertificatesService.getTransferById(id);
      setCertificate(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load certificate');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  return { certificate, isLoading, refetch: fetchCertificate };
}

// ─── Bonafide Detail Hook ─────────────────────────────────────────────────────

export function useBonafideCertificateDetail(id?: string) {
  const [certificate, setCertificate] = useState<BonafideCertificateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCertificate = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await CertificatesService.getBonafideById(id);
      setCertificate(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load certificate');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  return { certificate, isLoading, refetch: fetchCertificate };
}

// ─── Transfer Create Hook ─────────────────────────────────────────────────────

export function useCreateTransferCertificate() {
  const form = useForm<TransferCertFormValues>({
    resolver: zodResolver(transferCertSchema),
    defaultValues: {
      qualified_for_higher_class: 'YES',
      fees_due: 'NO',
    },
  });

  async function submit(
    values: TransferCertFormValues,
  ): Promise<TransferCertificateDetail | null> {
    try {
      const payload = {
        ...values,
        section_id: values.section_id || undefined,
        extra_activities: values.extra_activities || undefined,
      };
      const created = await CertificatesService.createTransfer(payload);
      toast.success(`Transfer certificate issued (Ref: ${created.reference_no})`);
      return created;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to issue certificate');
      return null;
    }
  }

  return {
    form,
    handleSubmit: form.handleSubmit(submit),
    isSubmitting: form.formState.isSubmitting,
  };
}

// ─── Bonafide Create Hook ─────────────────────────────────────────────────────

export function useCreateBonafideCertificate() {
  const form = useForm<BonafideCertFormValues>({
    resolver: zodResolver(bonafideCertSchema),
  });

  async function submit(
    values: BonafideCertFormValues,
  ): Promise<BonafideCertificateDetail | null> {
    try {
      const payload = {
        ...values,
        section_id: values.section_id || undefined,
      };
      const created = await CertificatesService.createBonafide(payload);
      toast.success(`Bonafide certificate issued (Ref: ${created.reference_no})`);
      return created;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to issue certificate');
      return null;
    }
  }

  return {
    form,
    handleSubmit: form.handleSubmit(submit),
    isSubmitting: form.formState.isSubmitting,
  };
}