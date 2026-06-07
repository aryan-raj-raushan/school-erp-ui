import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

export type TimetableSessionType = 'summer' | 'winter' | 'spring' | 'autumn' | 'annual' | 'quarterly';

export interface TimetableSession {
  id: string;
  school_id: string;
  academic_year_id?: string | null;
  name: string;
  session_code?: string | null;
  timetable_session: TimetableSessionType;
  start_date: string;
  end_date: string;
  description?: string | null;
  is_enabled: boolean;
  is_active_session: boolean;
  created_at: string;
}

export interface TimetableSessionFilters {
  page?: number;
  limit?: number;
}

export interface CreateTimetableSessionPayload {
  name: string;
  session_code?: string;
  timetable_session: TimetableSessionType;
  academic_year_id?: string;
  start_date: string;
  end_date: string;
  description?: string;
  is_enabled?: boolean;
}

export interface UpdateTimetableSessionPayload extends Partial<CreateTimetableSessionPayload> {}

export const TimetableSessionsService = {
  async list(filters: TimetableSessionFilters = {}): Promise<{ items: TimetableSession[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<TimetableSession[]>(ENDPOINTS.timetableSessions.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<TimetableSession> {
    const res = await apiGateway.get<TimetableSession>(ENDPOINTS.timetableSessions.byId(id));
    return res.data;
  },

  async create(payload: CreateTimetableSessionPayload): Promise<TimetableSession> {
    const res = await apiGateway.post<TimetableSession>(ENDPOINTS.timetableSessions.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateTimetableSessionPayload): Promise<TimetableSession> {
    const res = await apiGateway.patch<TimetableSession>(ENDPOINTS.timetableSessions.byId(id), payload);
    return res.data;
  },

  async setActive(id: string): Promise<TimetableSession> {
    const res = await apiGateway.post<TimetableSession>(ENDPOINTS.timetableSessions.setActive(id), {});
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.timetableSessions.byId(id));
  },
};
