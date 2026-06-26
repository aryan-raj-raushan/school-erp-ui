'use client';

import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { RESULT_ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  ExamResultRow,
  ExamResultFilters,
  ReportCardItem,
  ReportCardFilters,
  BulkUpsertResultPayload,
  PublishResultPayload,
  GenerateReportCardPayload,
  PublishReportCardPayload,
  ExamScheduleItem,
} from '@/types/result.types';
import type { PaginationMeta } from '@/types';

// ─── Exam Results ─────────────────────────────────────────────────────────────

export const ExamResultsService = {
  async list(
    filters: ExamResultFilters = {},
  ): Promise<{ items: ExamResultRow[] }> {
    const res = await apiGateway.get<ExamResultRow[]>(
      RESULT_ENDPOINTS.examResults.list,
      { params: filters },
    );
    return { items: res.data };
  },

  async bulkUpsert(
    payload: BulkUpsertResultPayload,
  ): Promise<{ upserted: number }> {
    const res = await apiGateway.post<{ upserted: number }>(
      RESULT_ENDPOINTS.examResults.bulk,
      payload,
    );
    return res.data;
  },

  async publish(payload: PublishResultPayload): Promise<void> {
    await apiGateway.patch(RESULT_ENDPOINTS.examResults.publish, payload);
  },

  async getSchedules(examId: string): Promise<ExamScheduleItem[]> {
    const res = await apiGateway.get<ExamScheduleItem[]>(
      RESULT_ENDPOINTS.examSchedules.byExam(examId),
    );
    return res.data;
  },
};

// ─── Report Cards ─────────────────────────────────────────────────────────────

export const ReportCardsService = {
  async list(
    filters: ReportCardFilters = {},
  ): Promise<{ items: ReportCardItem[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<ReportCardItem[]>(
      RESULT_ENDPOINTS.reportCards.list,
      { params: filters },
    );
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<ReportCardItem> {
    const res = await apiGateway.get<ReportCardItem>(
      RESULT_ENDPOINTS.reportCards.byId(id),
    );
    return res.data;
  },

  async generate(
    payload: GenerateReportCardPayload,
  ): Promise<{ generated: number; results: { student_id: string; student_name: string; report_card_id: string; pdf_url: string | null; status: string }[] }> {
    const res = await apiGateway.post(
      RESULT_ENDPOINTS.reportCards.generate,
      payload,
    );
    return res.data as any;
  },

  async publish(payload: PublishReportCardPayload): Promise<void> {
    await apiGateway.patch(RESULT_ENDPOINTS.reportCards.publish, payload);
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(RESULT_ENDPOINTS.reportCards.byId(id));
  },
};
