'use client';

import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { RESULT_ENDPOINTS, EXAM_ENDPOINTS } from '@/lib/api-gateway/endpoints';
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

  // Uses the schedules LIST endpoint filtered by exam_id + class_id — NOT /schedules/:id.
  // class_id is required: an exam can span multiple classes, and without it every
  // class's subjects (including ones deleted only for this class) bleed into the grid.
  async getSchedules(examId: string, classId: string): Promise<ExamScheduleItem[]> {
    const res = await apiGateway.get<ExamScheduleItem[]>(
      EXAM_ENDPOINTS.schedules.list,
      { params: { exam_id: examId, class_id: classId } },
    );
    // res.data may be a paginated wrapper or a flat array depending on the gateway
    // The list endpoint returns items inside pagination so unwrap if needed
    const raw = res.data as any;
    return Array.isArray(raw) ? raw : (raw?.items ?? raw);
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
