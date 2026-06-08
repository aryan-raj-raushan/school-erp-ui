import { apiGateway } from "@/lib/api-gateway/api-gateway.instance";
import { ENDPOINTS } from "@/lib/api-gateway/endpoints";
import type { Subject, PaginationMeta } from "@/types";

export interface ClassSubjectFilters {
  page?: number;
  limit?: number;
  class_id?: string;
  academic_year_id?: string;
  search?: string;
}

export interface CreateSubjectPayload {
  name: string;
  class_id: string;
  code?: string;
  description?: string;
  is_elective?: boolean;
  is_active?: boolean;
}

export interface UpdateSubjectPayload extends Partial<CreateSubjectPayload> {}

export interface SubjectListResult {
  items: Subject[];
  pagination: PaginationMeta;
}

export const ClassSubjectsService = {
  async list(filters: ClassSubjectFilters = {}): Promise<SubjectListResult> {
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
