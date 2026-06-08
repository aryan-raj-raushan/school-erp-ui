import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { AcademicYear, PaginationMeta } from '@/types';

export interface AcademicYearFilters {
  page?: number;
  limit?: number;
}

export interface CreateAcademicYearPayload {
  name: string;
  start_date: string;
  end_date: string;
  session_code?: string;
  description?: string;
  is_current?: boolean;
  is_enabled?: boolean;
}

export interface UpdateAcademicYearPayload extends Partial<CreateAcademicYearPayload> {}

export const AcademicYearsService = {
  async list(filters: AcademicYearFilters = {}): Promise<{ items: AcademicYear[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<AcademicYear[]>(ENDPOINTS.academicYears.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getCurrent(): Promise<AcademicYear | null> {
    try {
      const res = await apiGateway.get<AcademicYear>(ENDPOINTS.academicYears.current);
      return res.data;
    } catch {
      return null;
    }
  },

  async getById(id: string): Promise<AcademicYear> {
    const res = await apiGateway.get<AcademicYear>(ENDPOINTS.academicYears.byId(id));
    return res.data;
  },

  async create(payload: CreateAcademicYearPayload): Promise<AcademicYear> {
    const res = await apiGateway.post<AcademicYear>(ENDPOINTS.academicYears.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateAcademicYearPayload): Promise<AcademicYear> {
    const res = await apiGateway.patch<AcademicYear>(ENDPOINTS.academicYears.byId(id), payload);
    return res.data;
  },

  async setCurrent(id: string): Promise<AcademicYear> {
    const res = await apiGateway.post<AcademicYear>(ENDPOINTS.academicYears.setCurrent(id), {});
    return res.data;
  },
};
