import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { StaffShift, CreateStaffShiftPayload, UpdateStaffShiftPayload } from '@/types/staff-shifts.types';

export const StaffShiftsService = {
  async list(): Promise<StaffShift[]> {
    const res = await apiGateway.get<StaffShift[]>(ENDPOINTS.staffShifts.list);
    return res.data;
  },

  async listByStaff(staffId: string): Promise<StaffShift[]> {
    const res = await apiGateway.get<StaffShift[]>(ENDPOINTS.staffShifts.byStaff(staffId));
    return res.data;
  },

  async create(payload: CreateStaffShiftPayload): Promise<StaffShift> {
    const res = await apiGateway.post<StaffShift>(ENDPOINTS.staffShifts.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateStaffShiftPayload): Promise<StaffShift> {
    const res = await apiGateway.put<StaffShift>(ENDPOINTS.staffShifts.byId(id), payload);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.staffShifts.byId(id));
  },
};
