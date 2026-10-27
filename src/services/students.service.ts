import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { Student, PaginationMeta, StudentStatus } from '@/types';

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  class_id?: string;
  section_id?: string;
  academic_year_id?: string;
  status?: StudentStatus;
}

export const StudentsService = {
  async list(filters: StudentFilters = {}): Promise<{ items: Student[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<Student[]>(ENDPOINTS.students.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },
};
