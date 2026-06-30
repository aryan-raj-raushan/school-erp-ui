import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  AttendanceRecord,
  AttendanceAuditEntry,
  MissingPunchRecord,
  MarkAttendancePayload,
  DailyAttendanceReport,
  MonthlyAttendanceSummary,
  AttendanceSummary,
  AttendanceDefaulter,
  AttendanceExportJob,
  AttendanceStatus,
  PaginationMeta,
  MonthlyAttendanceReport,
  AttendanceDashboardStats,
  HeatmapEntry,
  LateTrendEntry,
} from '@/types';

export type { AttendanceAuditEntry, MissingPunchRecord };

export interface AttendanceFilters {
  date?: string;
  class_section_id?: string;
  student_id?: string;
  [key: string]: unknown;
}

export interface DailyReportFilters {
  class_section_id: string;
  date: string;
}

export interface MonthlyReportFilters {
  class_section_id: string;
  month: number;
  year: number;
}

export interface DefaulterFilters {
  class_section_id?: string;
  threshold?: number;
  academic_year_id?: string;
}

export interface ExportFilters {
  class_section_id?: string;
  start_date?: string;
  end_date?: string;
  format?: 'xlsx' | 'csv';
}

export interface UpdateAttendancePayload {
  status: AttendanceStatus;
  remarks?: string;
}

export const AttendanceService = {
  async getAttendance(filters: AttendanceFilters = {}): Promise<AttendanceRecord[]> {
    const res = await apiGateway.get<AttendanceRecord[]>(ENDPOINTS.attendance.base, { params: filters });
    return res.data;
  },

  async mark(payload: MarkAttendancePayload): Promise<AttendanceRecord[]> {
    const res = await apiGateway.post<AttendanceRecord[]>(ENDPOINTS.attendance.base, payload);
    return res.data;
  },

  async getById(attendanceId: string): Promise<AttendanceRecord> {
    const res = await apiGateway.get<AttendanceRecord>(ENDPOINTS.attendance.byId(attendanceId));
    return res.data;
  },

  async update(attendanceId: string, payload: UpdateAttendancePayload): Promise<AttendanceRecord> {
    const res = await apiGateway.put<AttendanceRecord>(ENDPOINTS.attendance.byId(attendanceId), payload);
    return res.data;
  },

  async remove(attendanceId: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.attendance.byId(attendanceId));
  },

  async getDailyReport(filters: DailyReportFilters): Promise<DailyAttendanceReport> {
    const res = await apiGateway.get<DailyAttendanceReport>(ENDPOINTS.attendance.daily, { params: filters });
    return res.data;
  },

  async getMonthlyReport(filters: MonthlyReportFilters): Promise<MonthlyAttendanceReport> {
    const res = await apiGateway.get<MonthlyAttendanceReport>(ENDPOINTS.attendance.monthly, { params: filters });
    return res.data;
  },

  async getDefaulters(filters: DefaulterFilters = {}): Promise<AttendanceDefaulter[]> {
    const res = await apiGateway.get<AttendanceDefaulter[]>(ENDPOINTS.attendance.defaulters, { params: filters });
    return res.data;
  },

  async exportToFile(filters: ExportFilters = {}): Promise<ArrayBuffer> {
    const response = await apiGateway.axiosInstance.get(ENDPOINTS.attendance.export, { params: filters });
    return response.data as ArrayBuffer;
  },

  async getStudentHistory(
    studentId: string,
    params: { page?: number; limit?: number; start_date?: string; end_date?: string } = {},
  ): Promise<{ items: AttendanceRecord[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<{ records: AttendanceRecord[]; stats: unknown }>(
      ENDPOINTS.attendance.studentHistory(studentId),
      { params },
    );
    return { items: res.data.records ?? [], pagination: res.pagination! };
  },

  async getStudentSummary(studentId: string): Promise<AttendanceSummary> {
    const res = await apiGateway.get<AttendanceSummary>(ENDPOINTS.attendance.studentSummary(studentId));
    return res.data;
  },

  async getSectionOverview(
    sectionId: string,
    params: { start_date?: string; end_date?: string } = {},
  ): Promise<AttendanceRecord[]> {
    const res = await apiGateway.get<AttendanceRecord[]>(
      ENDPOINTS.attendance.bySection(sectionId),
      { params },
    );
    return res.data;
  },

  async getSectionDateAttendance(sectionId: string, date: string): Promise<AttendanceRecord[]> {
    const res = await apiGateway.get<AttendanceRecord[]>(
      ENDPOINTS.attendance.bySectionDate(sectionId, date),
    );
    return res.data;
  },

  async getAuditLog(attendanceId: string): Promise<AttendanceAuditEntry[]> {
    const res = await apiGateway.get<AttendanceAuditEntry[]>(
      ENDPOINTS.attendance.auditLog(attendanceId),
    );
    return res.data;
  },

  async getMissingPunches(date: string): Promise<MissingPunchRecord[]> {
    const res = await apiGateway.get<MissingPunchRecord[]>(ENDPOINTS.attendance.missingPunches, {
      params: { date },
    });
    return res.data;
  },

  async resolveMissingPunch(punchId: string, status: 'PRESENT' | 'HALF_DAY'): Promise<void> {
    await apiGateway.put(ENDPOINTS.attendance.resolvePunch(punchId), { status });
  },

  async getTodayDashboard(): Promise<AttendanceDashboardStats> {
    const res = await apiGateway.get<AttendanceDashboardStats>(ENDPOINTS.attendance.dashboard);
    return res.data;
  },

  async getHeatmap(studentId: string, year: number): Promise<HeatmapEntry[]> {
    const res = await apiGateway.get<HeatmapEntry[]>(ENDPOINTS.attendance.heatmap, {
      params: { studentId, year },
    });
    return res.data;
  },

  async getLateTrend(classSectionId: string, month: number, year: number): Promise<LateTrendEntry[]> {
    const res = await apiGateway.get<LateTrendEntry[]>(ENDPOINTS.attendance.lateTrend, {
      params: { class_section_id: classSectionId, month, year },
    });
    return res.data;
  },
};
