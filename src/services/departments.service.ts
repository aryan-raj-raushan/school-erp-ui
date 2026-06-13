import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

export interface Department {
  id: string;
  school_id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DepartmentFilters {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export interface CreateDepartmentPayload {
  name: string;
  code?: string;
  address?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateDepartmentPayload extends Partial<CreateDepartmentPayload> {}

export const DepartmentsService = {
  async list(filters: DepartmentFilters = {}): Promise<{ items: Department[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<Department[]>(ENDPOINTS.departments.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Department> {
    const res = await apiGateway.get<Department>(ENDPOINTS.departments.byId(id));
    return res.data;
  },

  async create(payload: CreateDepartmentPayload): Promise<Department> {
    const res = await apiGateway.post<Department>(ENDPOINTS.departments.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateDepartmentPayload): Promise<Department> {
    const res = await apiGateway.patch<Department>(ENDPOINTS.departments.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.departments.byId(id));
  },
};
