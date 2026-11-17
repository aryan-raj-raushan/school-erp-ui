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

export type AssignableClass = {
  id: string;
  name: string;
  unassigned: number;
  sections: { id: string; name: string; unassigned: number }[];
};

export type AssignableStaff = {
  id: string;
  salutation: string | null;
  first_name: string;
  last_name: string | null;
  employee_code: string | null;
  role: string;
};

export type AssignableStudent = {
  id: string;
  first_name: string;
  last_name: string | null;
  roll_number: string | null;
  admission_number: string | null;
};

export type AssignableOverview = {
  academic_year: { id: string; name: string };
  classes: AssignableClass[];
  staff: AssignableStaff[];
};

export const RfidService = {
  async getAssignable(): Promise<AssignableOverview> {
    const res = await apiGateway.get<AssignableOverview>(ENDPOINTS.rfid.assignable);
    return res.data;
  },

  async getAssignableStudents(classId: string, sectionId?: string): Promise<AssignableStudent[]> {
    const res = await apiGateway.get<{ students: AssignableStudent[] }>(ENDPOINTS.rfid.assignableStudents, {
      params: { class_id: classId, ...(sectionId ? { section_id: sectionId } : {}) },
    });
    return res.data.students ?? [];
  },

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
