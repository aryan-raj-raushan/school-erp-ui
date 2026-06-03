import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  LeavePolicy,
  LeaveType,
  LeaveBalance,
  TeacherLeaveRequest,
  StudentLeaveRequest,
  LeaveRequestStatus,
} from '@/types';

// ─── Leave Policies ───────────────────────────────────────────────────────────

export interface CreateLeaveTypePayload {
  name: string;
  max_days: number;
  is_paid?: boolean;
  description?: string;
}

export interface CreateLeavePolicyPayload {
  name: string;
  academic_year_id: string;
  description?: string;
  leave_types: CreateLeaveTypePayload[];
}

export const LeavePoliciesService = {
  async list(): Promise<LeavePolicy[]> {
    const res = await apiGateway.get<LeavePolicy[]>(ENDPOINTS.leave.policies);
    return res.data;
  },

  async getById(policyId: string): Promise<LeavePolicy> {
    const res = await apiGateway.get<LeavePolicy>(ENDPOINTS.leave.policyById(policyId));
    return res.data;
  },

  async create(payload: CreateLeavePolicyPayload): Promise<LeavePolicy> {
    const res = await apiGateway.post<LeavePolicy>(ENDPOINTS.leave.policies, payload);
    return res.data;
  },

  async update(policyId: string, payload: Partial<CreateLeavePolicyPayload>): Promise<LeavePolicy> {
    const res = await apiGateway.put<LeavePolicy>(ENDPOINTS.leave.policyById(policyId), payload);
    return res.data;
  },

  async updateLeaveType(leaveTypeId: string, payload: Partial<CreateLeaveTypePayload>): Promise<LeaveType> {
    const res = await apiGateway.put<LeaveType>(ENDPOINTS.leave.policyTypes(leaveTypeId), payload);
    return res.data;
  },

  async provision(policyId: string, staff_ids: string[], academic_year_id: string): Promise<LeaveBalance[]> {
    const res = await apiGateway.post<LeaveBalance[]>(ENDPOINTS.leave.provision(policyId), {
      staff_ids,
      academic_year_id,
    });
    return res.data;
  },
};

// ─── Teacher Leave ────────────────────────────────────────────────────────────

export interface ApplyTeacherLeavePayload {
  leave_type_id: string;
  from_date: string;
  to_date: string;
  reason: string;
}

export interface ReviewLeavePayload {
  status: 'APPROVED' | 'REJECTED';
  reviewer_remarks?: string;
}

export const TeacherLeaveService = {
  async apply(payload: ApplyTeacherLeavePayload): Promise<TeacherLeaveRequest> {
    const res = await apiGateway.post<TeacherLeaveRequest>(ENDPOINTS.leave.teacherApply, payload);
    return res.data;
  },

  async myRequests(): Promise<TeacherLeaveRequest[]> {
    const res = await apiGateway.get<TeacherLeaveRequest[]>(ENDPOINTS.leave.teacherMyRequests);
    return res.data;
  },

  async mySummary(academic_year_id: string): Promise<LeaveBalance[]> {
    const res = await apiGateway.get<LeaveBalance[]>(ENDPOINTS.leave.teacherMySummary, {
      params: { academic_year_id },
    });
    return res.data;
  },

  async allRequests(): Promise<TeacherLeaveRequest[]> {
    const res = await apiGateway.get<TeacherLeaveRequest[]>(ENDPOINTS.leave.teacherAll);
    return res.data;
  },

  async staffSummary(academic_year_id: string): Promise<LeaveBalance[]> {
    const res = await apiGateway.get<LeaveBalance[]>(ENDPOINTS.leave.teacherStaffSummary, {
      params: { academic_year_id },
    });
    return res.data;
  },

  async review(requestId: string, payload: ReviewLeavePayload): Promise<TeacherLeaveRequest> {
    const res = await apiGateway.put<TeacherLeaveRequest>(
      ENDPOINTS.leave.teacherReview(requestId),
      payload,
    );
    return res.data;
  },

  async getById(requestId: string): Promise<TeacherLeaveRequest> {
    const res = await apiGateway.get<TeacherLeaveRequest>(ENDPOINTS.leave.teacherById(requestId));
    return res.data;
  },
};

// ─── Student Leave ────────────────────────────────────────────────────────────

export const StudentLeaveService = {
  async allRequests(): Promise<StudentLeaveRequest[]> {
    const res = await apiGateway.get<StudentLeaveRequest[]>(ENDPOINTS.leave.studentAll);
    return res.data;
  },

  async review(requestId: string, payload: ReviewLeavePayload): Promise<StudentLeaveRequest> {
    const res = await apiGateway.put<StudentLeaveRequest>(
      ENDPOINTS.leave.studentReview(requestId),
      payload,
    );
    return res.data;
  },

  async getById(requestId: string): Promise<StudentLeaveRequest> {
    const res = await apiGateway.get<StudentLeaveRequest>(ENDPOINTS.leave.studentById(requestId));
    return res.data;
  },
};

// ─── Parent / Student Leave (applied by admin/class teacher on behalf of parent) ─

export interface ApplyStudentLeavePayload {
  student_id: string;
  from_date: string;
  to_date: string;
  reason: string;
}

export const ParentLeaveService = {
  async apply(payload: ApplyStudentLeavePayload): Promise<StudentLeaveRequest> {
    const res = await apiGateway.post<StudentLeaveRequest>(ENDPOINTS.leave.parentApply, payload);
    return res.data;
  },

  async myRequests(): Promise<StudentLeaveRequest[]> {
    const res = await apiGateway.get<StudentLeaveRequest[]>(ENDPOINTS.leave.parentMyRequests);
    return res.data;
  },

  async studentSummary(studentId: string): Promise<LeaveBalance[]> {
    const res = await apiGateway.get<LeaveBalance[]>(ENDPOINTS.leave.parentStudentSummary(studentId));
    return res.data;
  },
};
