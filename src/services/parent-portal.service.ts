import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { StudentStatus, AttendanceRecord, Homework, HomeworkSubmission } from '@/types';

export interface ChildSummary {
  student_id: string;
  school_id: string;
  relation: string;
  student_name: string;
  class_label: string | null;
  student_status: StudentStatus;
  is_login_active: boolean;
  is_current: boolean;
}

export interface ParentAttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalDays: number;
  attendancePercent: number;
  monthlyBreakdown?: { month: string; present: number; absent: number }[];
}

export interface ParentFeeBill {
  id: string;
  status: string;
  total_amount: string;
  paid_amount: string;
  discount_amount?: string;
  late_fine_amount?: string;
  due_date: string | null;
  bill_month?: string | null;
  fee_type_name?: string;
}

export type OnlinePaymentMode = 'DISABLED' | 'UPI_DIRECT';

export interface FeePaymentOptions {
  mode: OnlinePaymentMode;
  upi_id: string | null;
  payee_name: string | null;
}

export interface UpiIntent {
  reference: string;
  amount: number;
  upi_id: string;
  payee_name: string;
  upi_uri: string;
}

export interface UpiPaymentClaim {
  id: string;
  reference: string;
  utr: string | null;
  amount: string;
  status: 'PENDING_VERIFICATION' | 'PAID' | 'REJECTED';
  bill_id: string;
  student_name: string;
  fee_type_name: string | null;
  bill_month: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ParentHomeworkItem {
  id: string;
  title: string;
  description?: string;
  due_date: string | null;
  subject_name?: string;
  submission: HomeworkSubmission | null;
}

export interface TimetablePeriod {
  period_number: number;
  subject_name: string;
  teacher_name?: string;
  start_time: string;
  end_time: string;
}

export interface ParentExamScheduleEntry {
  id: string;
  exam_name?: string;
  subject_name?: string;
  exam_date: string;
  start_time?: string;
  end_time?: string;
}

export interface ParentReportCard {
  id: string;
  exam_id: string;
  exam_name?: string;
  is_published: boolean;
  total_marks?: number;
  obtained_marks?: number;
  grade?: string;
}

export interface ParentGatePass {
  id: string;
  status: string;
  reason?: string;
  requested_at: string;
}

export interface ParentMovement {
  id: string;
  direction: 'IN' | 'OUT';
  recorded_at: string;
  remarks?: string;
}

export interface ParentProfile {
  student: Record<string, unknown>;
  parents?: Record<string, unknown>[];
  guardians: Record<string, unknown>[];
}

export const ParentPortalService = {
  async getChildren(): Promise<ChildSummary[]> {
    const res = await apiGateway.get<ChildSummary[]>(ENDPOINTS.auth.parentChildren);
    return res.data;
  },

  async getAttendanceSummary(): Promise<ParentAttendanceSummary> {
    const res = await apiGateway.get<ParentAttendanceSummary>(ENDPOINTS.parentPortal.attendanceSummary);
    return res.data;
  },

  async getAttendanceHistory(params?: {
    from_date?: string;
    to_date?: string;
  }): Promise<{ items: AttendanceRecord[] }> {
    const res = await apiGateway.get<{ items: AttendanceRecord[] }>(
      ENDPOINTS.parentPortal.attendanceHistory,
      { params },
    );
    return res.data;
  },

  async getFeeBills(): Promise<ParentFeeBill[]> {
    const res = await apiGateway.get<ParentFeeBill[]>(ENDPOINTS.parentPortal.feeBills);
    return res.data;
  },

  async getFeePaymentOptions(): Promise<FeePaymentOptions> {
    const res = await apiGateway.get<FeePaymentOptions>(ENDPOINTS.parentPortal.feePaymentOptions);
    return res.data;
  },

  async getUpiPayments(): Promise<UpiPaymentClaim[]> {
    const res = await apiGateway.get<UpiPaymentClaim[]>(ENDPOINTS.parentPortal.feeUpiPayments);
    return res.data;
  },

  async createUpiIntent(billId: string): Promise<UpiIntent> {
    const res = await apiGateway.post<UpiIntent>(ENDPOINTS.parentPortal.feeUpiIntent(billId), {});
    return res.data;
  },

  async confirmUpiPayment(billId: string, reference: string, utr: string): Promise<{ status: string }> {
    const res = await apiGateway.post<{ status: string }>(ENDPOINTS.parentPortal.feeUpiConfirm(billId), { reference, utr });
    return res.data;
  },

  async getHomework(): Promise<ParentHomeworkItem[] | Homework[]> {
    const res = await apiGateway.get<ParentHomeworkItem[] | Homework[]>(ENDPOINTS.parentPortal.homework);
    return res.data;
  },

  async getTimetableToday(): Promise<TimetablePeriod[]> {
    const res = await apiGateway.get<TimetablePeriod[]>(ENDPOINTS.parentPortal.timetableToday);
    return res.data;
  },

  async getTimetableWeek(): Promise<TimetablePeriod[]> {
    const res = await apiGateway.get<TimetablePeriod[]>(ENDPOINTS.parentPortal.timetableWeek);
    return res.data;
  },

  async getExamSchedule(): Promise<ParentExamScheduleEntry[]> {
    const res = await apiGateway.get<ParentExamScheduleEntry[]>(ENDPOINTS.parentPortal.examSchedule);
    return res.data;
  },

  async getReportCards(): Promise<ParentReportCard[]> {
    const res = await apiGateway.get<ParentReportCard[]>(ENDPOINTS.parentPortal.reportCards);
    return res.data;
  },

  async getGatePasses(): Promise<ParentGatePass[]> {
    const res = await apiGateway.get<ParentGatePass[]>(ENDPOINTS.parentPortal.gatePasses);
    return res.data;
  },

  async getMovements(): Promise<ParentMovement[]> {
    const res = await apiGateway.get<ParentMovement[]>(ENDPOINTS.parentPortal.movements);
    return res.data;
  },

  async getProfile(): Promise<ParentProfile> {
    const res = await apiGateway.get<ParentProfile>(ENDPOINTS.parentPortal.profile);
    return res.data;
  },
};
