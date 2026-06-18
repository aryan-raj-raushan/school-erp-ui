import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export type StaffMember = {
  id: string;
  first_name: string;
  last_name: string | null;
  employee_code: string | null;
  role: string;
};

export type StaffAttendanceRecord = {
  id: string;
  staff_id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  is_late: boolean;
  remarks: string | null;
  marked_by: string;
};

export type MarkStaffAttendanceEntry = {
  staff_id: string;
  status: 'PRESENT' | 'ABSENT';
  is_late?: boolean;
  remarks?: string;
};

export const StaffAttendanceService = {
  async getStaff(): Promise<StaffMember[]> {
    const res = await apiGateway.get<StaffMember[]>(ENDPOINTS.staffAttendance.staff);
    return res.data ?? [];
  },

  async getByDate(date: string): Promise<StaffAttendanceRecord[]> {
    const res = await apiGateway.get<StaffAttendanceRecord[]>(ENDPOINTS.staffAttendance.daily, {
      params: { date },
    });
    return res.data ?? [];
  },

  async mark(date: string, entries: MarkStaffAttendanceEntry[]): Promise<void> {
    await apiGateway.post(ENDPOINTS.staffAttendance.base, { date, entries });
  },
};
