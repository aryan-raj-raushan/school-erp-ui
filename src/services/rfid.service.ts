import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export type RfidScanEvent = {
  r: string;
  d: string;
  t1: number;
  receivedAt: string;
};

export const RfidService = {
  webhookUrl(): string {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}${ENDPOINTS.rfid.webhook}`;
  },

  async getEvents(): Promise<RfidScanEvent[]> {
    const res = await apiGateway.get<{ events: RfidScanEvent[] }>(ENDPOINTS.rfid.events);
    return res.data.events ?? [];
  },
};
