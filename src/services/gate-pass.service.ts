import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { GatePassRecord, CreateGatePassPayload } from '@/types';

export const GatePassService = {
  async list(date?: string, status?: string): Promise<GatePassRecord[]> {
    const res = await apiGateway.get<GatePassRecord[]>(ENDPOINTS.gatePasses.base, {
      params: { ...(date && { date }), ...(status && { status }) },
    });
    return res.data;
  },

  async create(payload: CreateGatePassPayload): Promise<GatePassRecord> {
    const res = await apiGateway.post<GatePassRecord>(ENDPOINTS.gatePasses.base, payload);
    return res.data;
  },

  async approve(id: string): Promise<GatePassRecord> {
    const res = await apiGateway.put<GatePassRecord>(ENDPOINTS.gatePasses.approve(id));
    return res.data;
  },

  async reject(id: string): Promise<GatePassRecord> {
    const res = await apiGateway.put<GatePassRecord>(ENDPOINTS.gatePasses.reject(id));
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.gatePasses.byId(id));
  },
};
