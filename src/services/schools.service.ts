import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta, School, SchoolApprovalStatus } from '@/types';
import type { BoardType } from '@/constants';

export type { School };

export interface SchoolFilters {
  page?: number;
  limit?: number;
  search?: string;
  approval_status?: SchoolApprovalStatus;
  [key: string]: unknown;
}

export interface PaginatedSchools {
  items: School[];
  pagination: PaginationMeta;
}

export interface CreateSchoolPayload {
  name: string;
  email?: string;
  contact_number?: string;
  dial_code?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
  board_type?: BoardType;
  marking_system?: string;
  support_name?: string | null;
  support_dial_code?: string;
  support_phone?: string | null;
  support_email?: string | null;
  admin_first_name?: string;
  admin_last_name?: string;
  admin_dial_code?: string;
  admin_phone?: string;
  admin_email?: string;
}

export type UpdateSchoolPayload = Partial<CreateSchoolPayload>;

export interface SchoolAdminCredentials {
  login_id: string;
  temporary_password: string;
}

export type SchoolWithCredentials = School & { admin_credentials?: SchoolAdminCredentials };

export interface SchoolAdmin {
  id: string;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  dial_code: string;
  phone_number: string | null;
}

export interface SchoolDeletionSummary {
  id: string;
  name: string;
  code: string | null;
  students: number;
  staff: number;
  parents: number;
  last_backup_at: string | null;
}

export interface SchoolDeletionResult {
  id: string;
  name: string;
  rows_deleted: number;
  files_deleted: number;
  files_failed: number;
}

export const SchoolsService = {
  async list(filters: SchoolFilters = {}): Promise<PaginatedSchools> {
    const res = await apiGateway.get<School[]>(ENDPOINTS.schools.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<School> {
    const res = await apiGateway.get<School>(ENDPOINTS.schools.byId(id));
    return res.data;
  },

  async getAdmin(id: string): Promise<SchoolAdmin | null> {
    const res = await apiGateway.get<SchoolAdmin | null>(ENDPOINTS.schools.admin(id));
    return res.data;
  },

  async create(payload: CreateSchoolPayload): Promise<SchoolWithCredentials> {
    const res = await apiGateway.post<SchoolWithCredentials>(ENDPOINTS.schools.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSchoolPayload): Promise<SchoolWithCredentials> {
    const res = await apiGateway.patch<SchoolWithCredentials>(ENDPOINTS.schools.byId(id), payload);
    return res.data;
  },

  async setApproval(id: string, status: Exclude<SchoolApprovalStatus, 'PENDING'>, note?: string): Promise<School> {
    const res = await apiGateway.patch<School>(ENDPOINTS.schools.approval(id), { status, ...(note && { note }) });
    return res.data;
  },

  async resetAdminPassword(id: string): Promise<SchoolAdminCredentials> {
    const res = await apiGateway.post<SchoolAdminCredentials>(ENDPOINTS.schools.resetAdminPassword(id), {});
    return res.data;
  },

  async deletionSummary(id: string): Promise<SchoolDeletionSummary> {
    const res = await apiGateway.get<SchoolDeletionSummary>(ENDPOINTS.schools.deletionSummary(id));
    return res.data;
  },

  async remove(id: string, confirmation: { confirm_name: string; backup_confirmed: boolean }): Promise<SchoolDeletionResult> {
    const res = await apiGateway.delete<SchoolDeletionResult>(ENDPOINTS.schools.byId(id), confirmation, { timeout: 300_000 });
    return res.data;
  },
};
