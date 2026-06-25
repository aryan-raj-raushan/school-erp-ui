import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import {  EMP_LEAVE_ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  LeaveType,
  LeaveAssigned,
  EmployeeLeaveView,
  LeaveApplication,
  LeaveTypeFilters,
  AssignedLeaveFilters,
  LeaveApplicationFilters,
  LeaveValidity,
  LeavePayType,
  LeaveApplicationStatus,
} from '@/types/leave.types';
import type { PaginationMeta } from '@/types';

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateLeaveTypePayload {
  leave_name: string;
  leave_validity: LeaveValidity;
  leave_pay_type: LeavePayType;
  leave_count_days: number;
  is_enabled?: boolean;
}
export type UpdateLeaveTypePayload = Partial<CreateLeaveTypePayload>;

export interface AssignLeavePayload {
  leave_type_id: string;
  academic_year_id: string;
}

export interface ApplyLeavePayload {
  leave_type_id: string;
  academic_year_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface ReviewLeavePayload {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

// ─── Leave Types Service ──────────────────────────────────────────────────────

export const LeaveTypeService = {
  async list(
    filters: LeaveTypeFilters = {},
  ): Promise<{ items: LeaveType[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<LeaveType[]>(EMP_LEAVE_ENDPOINTS.leaveTypes.list, {
      params: filters,
    });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<LeaveType> {
    const res = await apiGateway.get<LeaveType>(EMP_LEAVE_ENDPOINTS.leaveTypes.byId(id));
    return res.data;
  },

  async create(payload: CreateLeaveTypePayload): Promise<LeaveType> {
    const res = await apiGateway.post<LeaveType>(EMP_LEAVE_ENDPOINTS.leaveTypes.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateLeaveTypePayload): Promise<LeaveType> {
    const res = await apiGateway.patch<LeaveType>(EMP_LEAVE_ENDPOINTS.leaveTypes.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(EMP_LEAVE_ENDPOINTS.leaveTypes.byId(id));
  },
};

// ─── Leave Assigned Service ───────────────────────────────────────────────────

export const LeaveAssignedService = {
  async listByEmployee(
    employeeId: string,
    filters: AssignedLeaveFilters = {},
  ): Promise<{ items: EmployeeLeaveView[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<EmployeeLeaveView[]>(
      EMP_LEAVE_ENDPOINTS.leaveAssigned.byEmployee(employeeId),
      { params: filters },
    );
    return { items: res.data, pagination: res.pagination! };
  },

  async assign(
    employeeId: string,
    payload: AssignLeavePayload,
  ): Promise<LeaveAssigned> {
    const res = await apiGateway.post<LeaveAssigned>(
      EMP_LEAVE_ENDPOINTS.leaveAssigned.byEmployee(employeeId),
      payload,
    );
    return res.data;
  },

  async revoke(employeeId: string, assignmentId: string): Promise<void> {
    await apiGateway.delete(
      EMP_LEAVE_ENDPOINTS.leaveAssigned.byAssignment(employeeId, assignmentId),
    );
  },
};

// ─── Leave Applications Service ───────────────────────────────────────────────

export const LeaveApplicationService = {
  async list(
    filters: LeaveApplicationFilters = {},
  ): Promise<{ items: LeaveApplication[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<LeaveApplication[]>(
      EMP_LEAVE_ENDPOINTS.leaveApplications.list,
      { params: filters },
    );
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<LeaveApplication> {
    const res = await apiGateway.get<LeaveApplication>(
      EMP_LEAVE_ENDPOINTS.leaveApplications.byId(id),
    );
    return res.data;
  },

  async apply(payload: ApplyLeavePayload): Promise<LeaveApplication> {
    const res = await apiGateway.post<LeaveApplication>(
      EMP_LEAVE_ENDPOINTS.leaveApplications.list,
      payload,
    );
    return res.data;
  },

  async review(id: string, payload: ReviewLeavePayload): Promise<LeaveApplication> {
    const res = await apiGateway.patch<LeaveApplication>(
      EMP_LEAVE_ENDPOINTS.leaveApplications.review(id),
      payload,
    );
    return res.data;
  },

  async cancel(id: string): Promise<LeaveApplication> {
    const res = await apiGateway.patch<LeaveApplication>(
      EMP_LEAVE_ENDPOINTS.leaveApplications.cancel(id),
      {},
    );
    return res.data;
  },
};