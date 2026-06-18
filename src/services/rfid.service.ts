import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export type RfidScanEvent = {
  r: string;
  d: string;
  t1: number;
  receivedAt: string;
  personName: string | null;
  personType: 'staff' | 'student' | null;
  personId: string | null;
};

export type PersonResult = {
  id: string;
  name: string;
  type: 'staff' | 'student';
  rfidCardNumber: string | null;
};

export const RfidService = {
  async getEvents(): Promise<RfidScanEvent[]> {
    const res = await apiGateway.get<{ events: RfidScanEvent[] }>(ENDPOINTS.rfid.events);
    return res.data.events ?? [];
  },

  async searchPersons(q: string, type: 'staff' | 'student' | 'all' = 'all'): Promise<PersonResult[]> {
    const res = await apiGateway.get<{ persons: PersonResult[] }>(ENDPOINTS.rfid.search, { params: { q, type } });
    return res.data.persons ?? [];
  },

  async assignCard(rfidCardId: string, personType: 'staff' | 'student', personId: string): Promise<void> {
    await apiGateway.post(ENDPOINTS.rfid.assign, { rfidCardId, personType, personId });
  },

  async unassignCard(personType: 'staff' | 'student', personId: string): Promise<void> {
    await apiGateway.post(ENDPOINTS.rfid.unassign, { personType, personId });
  },
};
