export type LeaveValidity = 'MONTHLY' | 'YEARLY' | 'ON_OCCASION';
export type LeavePayType = 'PAID' | 'UNPAID';
export type LeaveApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

// ─── Leave Type ───────────────────────────────────────────────────────────────
export interface LeaveType {
  id: string;
  school_id: string;
  leave_name: string;
  leave_validity: LeaveValidity;
  leave_pay_type: LeavePayType;
  leave_count_days: number;
  is_enabled: boolean;
  deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ─── Leave Assigned ───────────────────────────────────────────────────────────
export interface LeaveAssigned {
  id: string;
  school_id: string;
  academic_year_id: string;
  employee_id: string;
  leave_type_id: string;
  used_days: number;
  deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLeaveView extends LeaveAssigned {
  leave_type: LeaveType;
  remaining_days: number;
}

// ─── Leave Application ────────────────────────────────────────────────────────
export interface LeaveApplication {
  id: string;
  school_id: string;
  academic_year_id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: LeaveApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  remarks: string | null;
  deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface LeaveTypeFilters {
  leave_validity?: LeaveValidity;
  leave_pay_type?: LeavePayType;
  is_enabled?: boolean;
  page?: number;
  limit?: number;
}

export interface AssignedLeaveFilters {
  academic_year_id?: string;
  page?: number;
  limit?: number;
}

export interface LeaveApplicationFilters {
  employee_id?: string;
  academic_year_id?: string;
  leave_type_id?: string;
  status?: LeaveApplicationStatus;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}