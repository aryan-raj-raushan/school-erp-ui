import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  AttendanceRecord,
  MarkAttendancePayload,
  DailyAttendanceReport,
  MonthlyAttendanceSummary,
  AttendanceSummary,
  AttendanceDefaulter,
  AttendanceExportJob,
  AttendanceStatus,
  PaginationMeta,
  MonthlyAttendanceReport,
} from '@/types';

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

  async enqueueExport(filters: ExportFilters = {}): Promise<AttendanceExportJob> {
    const res = await apiGateway.get<AttendanceExportJob>(ENDPOINTS.attendance.export, { params: filters });
    return res.data;
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
};
