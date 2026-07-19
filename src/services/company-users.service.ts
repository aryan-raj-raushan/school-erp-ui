import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta, Role } from '@/types';

export interface CompanyUser {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  role: Role;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AssignedSchool {
  school_id: string;
  school_name: string;
  granted_by: string;
  created_at: string;
}

export interface CompanyUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface PaginatedCompanyUsers {
  items: CompanyUser[];
  pagination: PaginationMeta;
}

export interface CreateCompanyUserPayload {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  role: Role;
}

export type UpdateCompanyUserPayload = Partial<
  Pick<CreateCompanyUserPayload, 'first_name' | 'last_name' | 'role'> & { is_active: boolean }
>;

export const CompanyUsersService = {
  async list(filters: CompanyUserFilters = {}): Promise<PaginatedCompanyUsers> {
    const res = await apiGateway.get<CompanyUser[]>(ENDPOINTS.companyUsers.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<CompanyUser> {
    const res = await apiGateway.get<CompanyUser>(ENDPOINTS.companyUsers.byId(id));
    return res.data;
  },

  async create(payload: CreateCompanyUserPayload): Promise<CompanyUser> {
    const res = await apiGateway.post<CompanyUser>(ENDPOINTS.companyUsers.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateCompanyUserPayload): Promise<CompanyUser> {
    const res = await apiGateway.patch<CompanyUser>(ENDPOINTS.companyUsers.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.companyUsers.byId(id));
  },

  async listSchools(id: string): Promise<AssignedSchool[]> {
    const res = await apiGateway.get<AssignedSchool[]>(ENDPOINTS.companyUsers.schools(id));
    return res.data;
  },

  async assignSchool(id: string, schoolId: string): Promise<AssignedSchool[]> {
    const res = await apiGateway.post<AssignedSchool[]>(ENDPOINTS.companyUsers.schools(id), {
      school_id: schoolId,
    });
    return res.data;
  },

  async unassignSchool(id: string, schoolId: string): Promise<AssignedSchool[]> {
    const res = await apiGateway.delete<AssignedSchool[]>(ENDPOINTS.companyUsers.schoolById(id, schoolId));
    return res.data;
  },
};
