import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

export interface ClassTypeItem {
  id: string;
  school_id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateClassTypePayload {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateClassTypePayload extends Partial<CreateClassTypePayload> {}

export const ClassTypesService = {
  async list(filters: { page?: number; limit?: number; is_active?: boolean } = {}): Promise<{ items: ClassTypeItem[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<ClassTypeItem[]>(ENDPOINTS.classTypes.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async create(payload: CreateClassTypePayload): Promise<ClassTypeItem> {
    const res = await apiGateway.post<ClassTypeItem>(ENDPOINTS.classTypes.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateClassTypePayload): Promise<ClassTypeItem> {
    const res = await apiGateway.patch<ClassTypeItem>(ENDPOINTS.classTypes.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.classTypes.byId(id));
  },
};
