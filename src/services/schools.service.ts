import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta, School } from '@/types';
import type { BoardType } from '@/constants';

export type { School };

export interface SchoolFilters {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

export interface PaginatedSchools {
  items: School[];
  pagination: PaginationMeta;
}

export interface CreateSchoolPayload {
  name: string;
  code?: string;
  email?: string;
  contact_number?: string;
  dial_code?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
  board_type?: BoardType;
  admin_first_name?: string;
  admin_last_name?: string;
  admin_dial_code?: string;
  admin_phone?: string;
  admin_email?: string;
  admin_password?: string;
}

export type UpdateSchoolPayload = Partial<
  Omit<CreateSchoolPayload, 'admin_first_name' | 'admin_last_name' | 'admin_dial_code' | 'admin_phone' | 'admin_email' | 'admin_password'>
>;

export const SchoolsService = {
  async list(filters: SchoolFilters = {}): Promise<PaginatedSchools> {
    const res = await apiGateway.get<School[]>(ENDPOINTS.schools.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<School> {
    const res = await apiGateway.get<School>(ENDPOINTS.schools.byId(id));
    return res.data;
  },

  async create(payload: CreateSchoolPayload): Promise<School> {
    const res = await apiGateway.post<School>(ENDPOINTS.schools.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSchoolPayload): Promise<School> {
    const res = await apiGateway.patch<School>(ENDPOINTS.schools.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.schools.byId(id));
  },
};
