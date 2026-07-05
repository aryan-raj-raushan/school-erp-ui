import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { EXAM_ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  ExamGrading,
  CreateExamGradingPayload,
  UpdateExamGradingPayload,
  Exam,
  ExamFilters,
  CreateExamPayload,
  UpdateExamPayload,
  AutoGenerateExamPayload,
  AutoGenerateExamResult,
  RegenerateApplyPayload,
  RegeneratePreviewResult,
  ExamStatus,
  ExamTemplate,
  CreateExamTemplatePayload,
  UpdateExamTemplatePayload,
  CopyExamPayload,
  ExamSchedule,
  BulkCreateSchedulePayload,
  BulkCreateScheduleMultiClassPayload,
  BulkLockSchedulePayload,
  BulkUpdateSchedulePayload,
  BulkUpdateScheduleResult,
  // UpdateExamSchedulePayload,
  ScheduleFilters,
  ExamAttendance,
  BulkMarkAttendancePayload,
  AttendanceFilters,
  ExamHallDetail,
  CreateHallDetailPayload,
  UpdateHallDetailPayload,
  ExamSittingPlan,
  BulkCreateSittingPayload,
  SittingFilters,
  AutoShuffleSittingPayload,
  AutoShuffleSittingResult,
  AdmitCardData,
  PaginatedResult,
  SittingPlanEntry,
} from '@/types/exam.types';

// ── Grading ───────────────────────────────────────────────────────────────────

export const ExamGradingService = {
  async list(): Promise<ExamGrading[]> {
    const res = await apiGateway.get<ExamGrading[]>(EXAM_ENDPOINTS.grading.list);
    return res.data;
  },

  async getById(id: string): Promise<ExamGrading> {
    const res = await apiGateway.get<ExamGrading>(EXAM_ENDPOINTS.grading.byId(id));
    return res.data;
  },

  async create(payload: CreateExamGradingPayload): Promise<ExamGrading> {
    const res = await apiGateway.post<ExamGrading>(EXAM_ENDPOINTS.grading.list, payload);
    return res.data;
  },

  async bulkCreate(grades: CreateExamGradingPayload[]): Promise<ExamGrading[]> {
    const res = await apiGateway.post<ExamGrading[]>(EXAM_ENDPOINTS.grading.bulk, { grades });
    return res.data;
  },

  async update(id: string, payload: UpdateExamGradingPayload): Promise<ExamGrading> {
    const res = await apiGateway.patch<ExamGrading>(EXAM_ENDPOINTS.grading.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(EXAM_ENDPOINTS.grading.byId(id));
  },
};

// ── Exams ─────────────────────────────────────────────────────────────────────

export const ExamsService = {
  async list(filters: ExamFilters = {}): Promise<PaginatedResult<Exam>> {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params[k] = String(v);
    });
    const res = await apiGateway.get<Exam[]>(EXAM_ENDPOINTS.exams.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Exam> {
    const res = await apiGateway.get<Exam>(EXAM_ENDPOINTS.exams.byId(id));
    return res.data;
  },

  async create(payload: CreateExamPayload): Promise<Exam> {
    const res = await apiGateway.post<Exam>(EXAM_ENDPOINTS.exams.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateExamPayload): Promise<Exam> {
    const res = await apiGateway.patch<Exam>(EXAM_ENDPOINTS.exams.byId(id), payload);
    return res.data;
  },

  async publish(id: string, isPublished: boolean): Promise<Exam> {
    const res = await apiGateway.patch<Exam>(EXAM_ENDPOINTS.exams.publish(id), {
      is_published: isPublished,
    });
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(EXAM_ENDPOINTS.exams.byId(id));
  },

  async autoGenerate(payload: AutoGenerateExamPayload): Promise<AutoGenerateExamResult> {
    const res = await apiGateway.post<AutoGenerateExamResult>(
      EXAM_ENDPOINTS.exams.autoGenerate,
      payload,
    );
    return res.data;
  },

  async changeStatus(id: string, status: ExamStatus): Promise<Exam> {
    const res = await apiGateway.patch<Exam>(EXAM_ENDPOINTS.exams.status(id), { status });
    return res.data;
  },

  async copy(id: string, payload: CopyExamPayload): Promise<Exam> {
    const res = await apiGateway.post<Exam>(EXAM_ENDPOINTS.exams.copy(id), payload);
    return res.data;
  },

  async restore(id: string): Promise<Exam> {
    const res = await apiGateway.patch<Exam>(EXAM_ENDPOINTS.exams.restore(id), {});
    return res.data;
  },

  async regeneratePreview(
    id: string,
    payload: AutoGenerateExamPayload,
  ): Promise<RegeneratePreviewResult> {
    const res = await apiGateway.post<RegeneratePreviewResult>(
      EXAM_ENDPOINTS.exams.regeneratePreview(id),
      payload,
    );
    return res.data;
  },

  async regenerateApply(id: string, payload: RegenerateApplyPayload): Promise<AutoGenerateExamResult> {
    const res = await apiGateway.post<AutoGenerateExamResult>(
      EXAM_ENDPOINTS.exams.regenerateApply(id),
      payload,
    );
    return res.data;
  },
};

// ── Templates ─────────────────────────────────────────────────────────────────

export const ExamTemplateService = {
  async list(): Promise<ExamTemplate[]> {
    const res = await apiGateway.get<ExamTemplate[]>(EXAM_ENDPOINTS.templates.list);
    return res.data;
  },

  async create(payload: CreateExamTemplatePayload): Promise<ExamTemplate> {
    const res = await apiGateway.post<ExamTemplate>(EXAM_ENDPOINTS.templates.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateExamTemplatePayload): Promise<ExamTemplate> {
    const res = await apiGateway.patch<ExamTemplate>(EXAM_ENDPOINTS.templates.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(EXAM_ENDPOINTS.templates.byId(id));
  },
};

// ── Schedule ──────────────────────────────────────────────────────────────────

export const ExamScheduleService = {
  async list(filters: ScheduleFilters = {}): Promise<PaginatedResult<ExamSchedule>> {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params[k] = String(v);
    });
    const res = await apiGateway.get<ExamSchedule[]>(EXAM_ENDPOINTS.schedules.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<{ schedule: ExamSchedule; subSchedules: ExamSchedule[] }> {
    const res = await apiGateway.get<{ schedule: ExamSchedule; subSchedules: ExamSchedule[] }>(
      EXAM_ENDPOINTS.schedules.byId(id),
    );
    return res.data;
  },

  async bulkCreate(payload: BulkCreateSchedulePayload): Promise<ExamSchedule[]> {
    const res = await apiGateway.post<ExamSchedule[]>(EXAM_ENDPOINTS.schedules.bulk, payload);
    return res.data;
  },

  async bulkCreateMultiClass(
    payload: BulkCreateScheduleMultiClassPayload,
  ): Promise<ExamSchedule[]> {
    const res = await apiGateway.post<ExamSchedule[]>(
      EXAM_ENDPOINTS.schedules.bulkMultiClass,
      payload,
    );
    return res.data;
  },

  async update(id: string, payload: Partial<ExamSchedule>): Promise<ExamSchedule> {
    const res = await apiGateway.patch<ExamSchedule>(EXAM_ENDPOINTS.schedules.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(EXAM_ENDPOINTS.schedules.byId(id));
  },

  async bulkLock(payload: BulkLockSchedulePayload): Promise<void> {
    await apiGateway.patch(EXAM_ENDPOINTS.schedules.bulkLock, payload);
  },

  async bulkUpdate(payload: BulkUpdateSchedulePayload): Promise<BulkUpdateScheduleResult> {
    const res = await apiGateway.patch<BulkUpdateScheduleResult>(
      EXAM_ENDPOINTS.schedules.bulkUpdate,
      payload,
    );
    return res.data;
  },

  async bulkRemove(ids: string[]): Promise<void> {
    await apiGateway.delete(EXAM_ENDPOINTS.schedules.bulk, { ids });
  },
};

// ── Attendance ────────────────────────────────────────────────────────────────

export const ExamAttendanceService = {
  async list(filters: AttendanceFilters = {}): Promise<PaginatedResult<ExamAttendance>> {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params[k] = String(v);
    });
    const res = await apiGateway.get<ExamAttendance[]>(EXAM_ENDPOINTS.attendance.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },

  async bySchedule(scheduleId: string): Promise<ExamAttendance[]> {
    const res = await apiGateway.get<ExamAttendance[]>(
      EXAM_ENDPOINTS.attendance.bySchedule(scheduleId),
    );
    return res.data;
  },

  async bulkMark(payload: BulkMarkAttendancePayload): Promise<ExamAttendance[]> {
    const res = await apiGateway.post<ExamAttendance[]>(EXAM_ENDPOINTS.attendance.bulk, payload);
    return res.data;
  },

  /**
   * The PDF endpoint requires the same Bearer auth as every other API call,
   * so it can't be opened as a plain URL (window.open sends no auth header
   * and would hit the frontend's own origin besides) — fetch the bytes
   * through apiGateway instead and hand the caller a Blob to download.
   */
  async downloadAttendanceCardPdf(params: {
    exam_id: string;
    class_id: string;
    academic_year_id: string;
    section_id?: string;
  }): Promise<Blob> {
    const query: Record<string, string> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v) query[k] = v;
    });
    const response = await apiGateway.axiosInstance.get(EXAM_ENDPOINTS.attendanceCard.pdf, {
      params: query,
    });
    return new Blob([response.data as ArrayBuffer], { type: 'application/pdf' });
  },
};

// ── Hall Details ──────────────────────────────────────────────────────────────

export const HallDetailService = {
  async list(filters: { is_enabled?: boolean; page?: number; limit?: number } = {}): Promise<PaginatedResult<ExamHallDetail>> {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params[k] = String(v);
    });
    const res = await apiGateway.get<ExamHallDetail[]>(EXAM_ENDPOINTS.hallDetails.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<ExamHallDetail> {
    const res = await apiGateway.get<ExamHallDetail>(EXAM_ENDPOINTS.hallDetails.byId(id));
    return res.data;
  },

  async create(payload: CreateHallDetailPayload): Promise<ExamHallDetail> {
    const res = await apiGateway.post<ExamHallDetail>(EXAM_ENDPOINTS.hallDetails.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateHallDetailPayload): Promise<ExamHallDetail> {
    const res = await apiGateway.patch<ExamHallDetail>(EXAM_ENDPOINTS.hallDetails.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(EXAM_ENDPOINTS.hallDetails.byId(id));
  },
};

// ── Sitting Plans ─────────────────────────────────────────────────────────────

export const SittingPlanService = {
  async list(filters: SittingFilters = {}): Promise<PaginatedResult<ExamSittingPlan>> {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params[k] = String(v);
    });
    const res = await apiGateway.get<ExamSittingPlan[]>(EXAM_ENDPOINTS.sittingPlans.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },

  async bulkCreate(payload: BulkCreateSittingPayload): Promise<ExamSittingPlan[]> {
    const res = await apiGateway.post<ExamSittingPlan[]>(EXAM_ENDPOINTS.sittingPlans.bulk, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<SittingPlanEntry>): Promise<ExamSittingPlan> {
    const res = await apiGateway.patch<ExamSittingPlan>(EXAM_ENDPOINTS.sittingPlans.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(EXAM_ENDPOINTS.sittingPlans.byId(id));
  },

  async autoShuffle(payload: AutoShuffleSittingPayload): Promise<AutoShuffleSittingResult> {
    const res = await apiGateway.post<AutoShuffleSittingResult>(
      EXAM_ENDPOINTS.sittingPlans.autoShuffle,
      payload,
    );
    return res.data;
  },

  getRoomPdfUrl(params: { hall_detail_id: string; exam_ids: string[]; academic_year_id: string }): string {
    const q = new URLSearchParams();
    q.set('hall_detail_id', params.hall_detail_id);
    q.set('academic_year_id', params.academic_year_id);
    params.exam_ids.forEach((id) => q.append('exam_ids', id));
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
    return `${base}${EXAM_ENDPOINTS.sittingPlans.roomPdf}?${q.toString()}`;
  },

  async downloadRoomPdf(params: { hall_detail_id: string; exam_ids: string[]; academic_year_id: string; room_name?: string }): Promise<void> {
    const q = new URLSearchParams();
    q.set('hall_detail_id', params.hall_detail_id);
    q.set('academic_year_id', params.academic_year_id);
    params.exam_ids.forEach((id) => q.append('exam_ids', id));
    const res = await apiGateway.get<ArrayBuffer>(`${EXAM_ENDPOINTS.sittingPlans.roomPdf}?${q.toString()}`, {
      responseType: 'blob',
    } as any);
    const blob = new Blob([res as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seating-${(params.room_name ?? 'room').replace(/\s+/g, '-').toLowerCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async downloadMasterPdf(params: { exam_id: string; date?: string; exam_name?: string }): Promise<void> {
    const q = new URLSearchParams();
    q.set('exam_id', params.exam_id);
    if (params.date) q.set('date', params.date);
    const res = await apiGateway.get<ArrayBuffer>(
      `${EXAM_ENDPOINTS.sittingPlans.masterPdf}?${q.toString()}`,
      { responseType: 'blob' } as any,
    );
    const blob = new Blob([res as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-seating-${(params.exam_name ?? 'exam').replace(/\s+/g, '-').toLowerCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ── Admit Card ────────────────────────────────────────────────────────────────

export const AdmitCardService = {
  async getData(params: {
    student_id: string;
    exam_id: string;
    academic_year_id: string;
  }): Promise<AdmitCardData> {
    const res = await apiGateway.get<AdmitCardData>(EXAM_ENDPOINTS.admitCard.data, { params });
    return res.data;
  },

  getPdfUrl(params: { student_id: string; exam_id: string; academic_year_id: string }): string {
    const q = new URLSearchParams(params);
    return `${EXAM_ENDPOINTS.admitCard.pdf}?${q.toString()}`;
  },
};