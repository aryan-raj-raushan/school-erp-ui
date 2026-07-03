import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { SchoolEvent, SchoolEventFilters } from '@/types/setting/school-events.types';

export interface CreateSchoolEventPayload {
  name: string;
  type: 'EVENT' | 'HOLIDAY';
  academic_year_id: string;
  description?: string;
  from_date: string;
  from_time?: string;
  to_date: string;
  to_time?: string;
  applies_to?: 'STUDENTS' | 'STAFF' | 'BOTH';
  exempt_role_ids?: string[];
}

export interface UpdateSchoolEventPayload extends Partial<CreateSchoolEventPayload> {}

export const SchoolEventsService = {
  async list(filters: SchoolEventFilters = {}): Promise<{ items: SchoolEvent[]; pagination: any }> {
    const res = await apiGateway.get<SchoolEvent[]>(ENDPOINTS.schoolEvents.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<SchoolEvent> {
    const res = await apiGateway.get<SchoolEvent>(ENDPOINTS.schoolEvents.byId(id));
    return res.data;
  },

  async create(payload: CreateSchoolEventPayload): Promise<SchoolEvent> {
    const res = await apiGateway.post<SchoolEvent>(ENDPOINTS.schoolEvents.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSchoolEventPayload): Promise<SchoolEvent> {
    const res = await apiGateway.patch<SchoolEvent>(ENDPOINTS.schoolEvents.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.schoolEvents.byId(id));
  },
};