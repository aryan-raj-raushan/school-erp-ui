import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { CalendarEvent } from '@/types';

export const CalendarService = {
  async getUnified(from: string, to: string): Promise<CalendarEvent[]> {
    const res = await apiGateway.get<CalendarEvent[]>(ENDPOINTS.calendar.unified, {
      params: { from, to },
    });
    return res.data;
  },
};
