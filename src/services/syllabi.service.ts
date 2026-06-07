import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

export interface SyllabusAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number | null;
}

export interface Syllabus {
  id: string;
  school_id: string;
  class_id: string;
  timetable_session_id?: string | null;
  class_detail_id?: string | null;
  title: string;
  content?: string | null;
  is_enabled: boolean;
  created_at: string;
  attachments?: SyllabusAttachment[];
}

export interface SyllabiFilters {
  page?: number;
  limit?: number;
  class_id?: string;
  timetable_session_id?: string;
}

export interface CreateSyllabusPayload {
  class_id: string;
  timetable_session_id?: string;
  class_detail_id?: string;
  title: string;
  content?: string;
  is_enabled?: boolean;
  attachments?: { file_name: string; file_url: string; file_type: string; file_size?: number }[];
}

export interface UpdateSyllabusPayload extends Partial<CreateSyllabusPayload> {}

export const SyllabiService = {
  async list(filters: SyllabiFilters = {}): Promise<{ items: Syllabus[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<Syllabus[]>(ENDPOINTS.syllabi.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Syllabus> {
    const res = await apiGateway.get<Syllabus>(ENDPOINTS.syllabi.byId(id));
    return res.data;
  },

  async create(payload: CreateSyllabusPayload): Promise<Syllabus> {
    const res = await apiGateway.post<Syllabus>(ENDPOINTS.syllabi.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSyllabusPayload): Promise<Syllabus> {
    const res = await apiGateway.patch<Syllabus>(ENDPOINTS.syllabi.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.syllabi.byId(id));
  },
};
