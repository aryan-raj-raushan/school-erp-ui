'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ReportCardsService } from '@/services/result.service';
import type { ReportCardItem, ReportCardFilters } from '@/types/result.types';
import type { PaginationMeta } from '@/types';
import {
  generateReportCardSchema,
  type GenerateReportCardFormValues,
} from '@/lib/validations/result.validations';
import { REPORT_CARD_PAGE } from '@/constants/result.constants';

// ─── List Hook ────────────────────────────────────────────────────────────────

export function useReportCards(initialFilters: ReportCardFilters = {}) {
  const [reportCards, setReportCards] = useState<ReportCardItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<ReportCardFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ReportCardsService.list(filters);
      setReportCards(result.items);
      setPagination(result.pagination);
    } catch {
      toast.error(REPORT_CARD_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  function updateFilters(next: Partial<ReportCardFilters>) {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }

  // ── Generate modal form ───────────────────────────────────────────────────────
  const generateForm = useForm<GenerateReportCardFormValues>({
    resolver: zodResolver(generateReportCardSchema),
    defaultValues: {
      exam_id: '',
      class_id: '',
      section_id: '',
      student_id: '',
      remarks: '',
      scope: 'class',
    },
  });

  const scope = generateForm.watch('scope');

  function openGenerateModal() {
    generateForm.reset();
    setShowGenerateModal(true);
  }
  function closeGenerateModal() {
    setShowGenerateModal(false);
  }

  const handleGenerate = generateForm.handleSubmit(async (values) => {
    setIsGenerating(true);
    try {
      const payload = {
        exam_id: values.exam_id,
        class_id: values.class_id,
        section_id: values.section_id || undefined,
        student_id: values.scope === 'student' ? values.student_id || undefined : undefined,
        remarks: values.remarks || undefined,
      };
      const result = await ReportCardsService.generate(payload);
      toast.success(`${result.generated} report card(s) generated`);
      closeGenerateModal();
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : REPORT_CARD_PAGE.toasts.generateError);
    } finally {
      setIsGenerating(false);
    }
  });

  // ── Publish ───────────────────────────────────────────────────────────────────
  async function publishReportCards(
    examId: string,
    isPublished: boolean,
    opts: { classId?: string; sectionId?: string; studentId?: string } = {},
  ) {
    setIsPublishing(true);
    try {
      await ReportCardsService.publish({
        exam_id: examId,
        class_id: opts.classId,
        section_id: opts.sectionId,
        student_id: opts.studentId,
        is_published: isPublished,
      });
      toast.success(
        isPublished
          ? REPORT_CARD_PAGE.toasts.publishSuccess
          : REPORT_CARD_PAGE.toasts.unpublishSuccess,
      );
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : REPORT_CARD_PAGE.toasts.publishError);
    } finally {
      setIsPublishing(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  async function removeReportCard(id: string) {
    try {
      await ReportCardsService.remove(id);
      toast.success(REPORT_CARD_PAGE.toasts.deleteSuccess);
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : REPORT_CARD_PAGE.toasts.deleteError);
    }
  }

  return {
    reportCards,
    pagination,
    filters,
    isLoading,
    isGenerating,
    isPublishing,
    showGenerateModal,
    generateForm,
    scope,
    updateFilters,
    openGenerateModal,
    closeGenerateModal,
    handleGenerate,
    publishReportCards,
    removeReportCard,
    refetch: fetch,
  };
}

// ─── Detail Hook ──────────────────────────────────────────────────────────────

export function useReportCardDetail(id: string) {
  const [reportCard, setReportCard] = useState<ReportCardItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    ReportCardsService.getById(id)
      .then(setReportCard)
      .catch(() => toast.error(REPORT_CARD_PAGE.toasts.fetchError))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { reportCard, isLoading };
}
