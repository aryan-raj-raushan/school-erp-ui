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
  ExamSchedule,
  BulkCreateSchedulePayload,
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

  async update(id: string, payload: Partial<ExamSchedule>): Promise<ExamSchedule> {
    const res = await apiGateway.patch<ExamSchedule>(EXAM_ENDPOINTS.schedules.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(EXAM_ENDPOINTS.schedules.byId(id));
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

  getAttendanceCardPdfUrl(params: {
    exam_id: string;
    class_id: string;
    academic_year_id: string;
    section_id?: string;
  }): string {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => !!v) as [string, string][],
    );
    return `${EXAM_ENDPOINTS.attendanceCard.pdf}?${q.toString()}`;
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

  async autoShuffle(payload: {
    exam_ids: string[];
    academic_year_id: string;
    hall_detail_ids: string[];
    clear_existing?: boolean;
  }): Promise<{ total_assigned: number; rooms: { room_name: string; assigned_count: number }[] }> {
    const res = await apiGateway.post<{ total_assigned: number; rooms: { room_name: string; assigned_count: number }[] }>(
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