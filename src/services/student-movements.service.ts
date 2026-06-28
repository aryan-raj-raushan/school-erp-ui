import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { StudentMovement } from '@/types';

export interface CreateMovementPayload {
  student_id: string;
  date: string;
  tapped_at: string;
  location: StudentMovement['location'];
  device_id?: string;
}

export const StudentMovementsService = {
  async list(filters: { student_id?: string; date?: string } = {}): Promise<StudentMovement[]> {
    const res = await apiGateway.get<StudentMovement[]>(ENDPOINTS.leave.studentMovements, { params: filters });
    return res.data;
  },

  async byStudent(studentId: string, date?: string): Promise<StudentMovement[]> {
    const res = await apiGateway.get<StudentMovement[]>(
      `/student-movements/student/${studentId}`,
      { params: date ? { date } : {} },
    );
    return res.data;
  },

  async create(payload: CreateMovementPayload): Promise<StudentMovement> {
    const res = await apiGateway.post<StudentMovement>(ENDPOINTS.leave.studentMovements, payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(`/student-movements/${id}`);
  },
};
