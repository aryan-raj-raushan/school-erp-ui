import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

export interface ClassDetail {
  id: string;
  school_id: string;
  class_id: string;
  timetable_session_id?: string | null;
  name: string;
  class_code?: string | null;
  year?: string | null;
  max_internal_exam: number;
  best_internal_exam_count: number;
  no_of_elective_subjects: number;
  is_enabled: boolean;
  created_at: string;
}

export interface ClassDetailFilters {
  page?: number;
  limit?: number;
  class_id?: string;
  timetable_session_id?: string;
}

export interface CreateClassDetailPayload {
  class_id: string;
  timetable_session_id?: string;
  name: string;
  class_code?: string;
  year?: string;
  max_internal_exam: number;
  best_internal_exam_count: number;
  no_of_elective_subjects: number;
  is_enabled?: boolean;
}

export interface UpdateClassDetailPayload extends Partial<CreateClassDetailPayload> {}

export const ClassDetailsService = {
  async list(filters: ClassDetailFilters = {}): Promise<{ items: ClassDetail[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<ClassDetail[]>(ENDPOINTS.classDetails.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<ClassDetail> {
    const res = await apiGateway.get<ClassDetail>(ENDPOINTS.classDetails.byId(id));
    return res.data;
  },

  async create(payload: CreateClassDetailPayload): Promise<ClassDetail> {
    const res = await apiGateway.post<ClassDetail>(ENDPOINTS.classDetails.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateClassDetailPayload): Promise<ClassDetail> {
    const res = await apiGateway.patch<ClassDetail>(ENDPOINTS.classDetails.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.classDetails.byId(id));
  },
};
