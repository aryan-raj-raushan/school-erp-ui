import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code?: string | null;
  display_order: number;
  total_marks: number;
  passing_marks: number;
  description?: string | null;
  is_elective: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SubjectFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateSubjectPayload {
  name: string;
  code?: string;
  display_order?: number;
  total_marks?: number;
  passing_marks?: number;
  description?: string;
  is_elective?: boolean;
  is_active?: boolean;
}

export interface UpdateSubjectPayload extends Partial<CreateSubjectPayload> {}

export const SubjectsService = {
  async list(filters: SubjectFilters = {}): Promise<{ items: Subject[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<Subject[]>(ENDPOINTS.subjects.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Subject> {
    const res = await apiGateway.get<Subject>(ENDPOINTS.subjects.byId(id));
    return res.data;
  },

  async create(payload: CreateSubjectPayload): Promise<Subject> {
    const res = await apiGateway.post<Subject>(ENDPOINTS.subjects.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSubjectPayload): Promise<Subject> {
    const res = await apiGateway.patch<Subject>(ENDPOINTS.subjects.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.subjects.byId(id));
  },
};
