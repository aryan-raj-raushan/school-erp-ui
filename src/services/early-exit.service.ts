import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { EarlyExitRecord, CreateEarlyExitPayload } from '@/types';

export const EarlyExitService = {
  async list(date?: string): Promise<EarlyExitRecord[]> {
    const res = await apiGateway.get<EarlyExitRecord[]>(ENDPOINTS.earlyExits.base, {
      params: date ? { date } : {},
    });
    return res.data;
  },

  async create(payload: CreateEarlyExitPayload): Promise<EarlyExitRecord> {
    const res = await apiGateway.post<EarlyExitRecord>(ENDPOINTS.earlyExits.base, payload);
    return res.data;
  },

  async approve(id: string): Promise<EarlyExitRecord> {
    const res = await apiGateway.put<EarlyExitRecord>(ENDPOINTS.earlyExits.approve(id));
    return res.data;
  },

  async reject(id: string): Promise<EarlyExitRecord> {
    const res = await apiGateway.put<EarlyExitRecord>(ENDPOINTS.earlyExits.reject(id));
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.earlyExits.byId(id));
  },
};
