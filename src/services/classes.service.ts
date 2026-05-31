import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { Class, Section, PaginationMeta } from '@/types';

export interface ClassFilters {
  page?: number;
  limit?: number;
  academic_year_id?: string;
}

export interface CreateClassPayload {
  name: string;
  academic_year_id: string;
  numeric_value?: number;
  description?: string;
}

export interface UpdateClassPayload extends Partial<CreateClassPayload> {}

export interface SectionFilters {
  page?: number;
  limit?: number;
  class_id?: string;
}

export interface CreateSectionPayload {
  name: string;
  class_id: string;
  room_number?: string;
  max_strength?: number;
  class_teacher_id?: string;
}

export interface UpdateSectionPayload extends Partial<CreateSectionPayload> {}

export const ClassesService = {
  async list(filters: ClassFilters = {}): Promise<{ items: Class[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<Class[]>(ENDPOINTS.classes.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Class> {
    const res = await apiGateway.get<Class>(ENDPOINTS.classes.byId(id));
    return res.data;
  },

  async create(payload: CreateClassPayload): Promise<Class> {
    const res = await apiGateway.post<Class>(ENDPOINTS.classes.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateClassPayload): Promise<Class> {
    const res = await apiGateway.patch<Class>(ENDPOINTS.classes.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.classes.byId(id));
  },
};

export const SectionsService = {
  async list(filters: SectionFilters = {}): Promise<{ items: Section[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<Section[]>(ENDPOINTS.sections.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Section> {
    const res = await apiGateway.get<Section>(ENDPOINTS.sections.byId(id));
    return res.data;
  },

  async create(payload: CreateSectionPayload): Promise<Section> {
    const res = await apiGateway.post<Section>(ENDPOINTS.sections.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSectionPayload): Promise<Section> {
    const res = await apiGateway.patch<Section>(ENDPOINTS.sections.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.sections.byId(id));
  },
};
