import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { Student, Parent, PaginationMeta, Gender, BloodGroup, StudentStatus, ParentRelation } from '@/types';

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  class_id?: string;
  section_id?: string;
  academic_year_id?: string;
  status?: StudentStatus;
}

export interface CreateStudentPayload {
  first_name: string;
  last_name?: string;
  admission_number: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string;
  roll_number?: string;
  gender?: Gender;
  date_of_birth?: string;
  blood_group?: BloodGroup;
  email?: string;
  phone_number?: string;
  dial_code?: string;
  aadhaar_number?: string;
  religion?: string;
  caste?: string;
  nationality?: string;
  admission_date?: string;
  status?: StudentStatus;
}

export interface UpdateStudentPayload extends Partial<CreateStudentPayload> {}

export interface CreateParentPayload {
  relation: ParentRelation;
  first_name: string;
  last_name?: string;
  dial_code: string;
  phone_number: string;
  email?: string;
  occupation?: string;
  annual_income?: number;
  aadhaar_number?: string;
  is_primary?: boolean;
  can_pickup?: boolean;
}

export interface UpdateParentPayload extends Partial<CreateParentPayload> {}

export const StudentsService = {
  async list(filters: StudentFilters = {}): Promise<{ items: Student[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<Student[]>(ENDPOINTS.students.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Student> {
    const res = await apiGateway.get<Student>(ENDPOINTS.students.byId(id));
    return res.data;
  },

  async create(payload: CreateStudentPayload): Promise<Student> {
    const res = await apiGateway.post<Student>(ENDPOINTS.students.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateStudentPayload): Promise<Student> {
    const res = await apiGateway.patch<Student>(ENDPOINTS.students.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.students.byId(id));
  },

  async getParents(studentId: string): Promise<Parent[]> {
    const res = await apiGateway.get<Parent[]>(ENDPOINTS.students.parents(studentId));
    return res.data;
  },

  async addParent(studentId: string, payload: CreateParentPayload): Promise<Parent> {
    const res = await apiGateway.post<Parent>(ENDPOINTS.students.parents(studentId), payload);
    return res.data;
  },

  async updateParent(studentId: string, parentId: string, payload: UpdateParentPayload): Promise<Parent> {
    const res = await apiGateway.patch<Parent>(ENDPOINTS.students.parentById(studentId, parentId), payload);
    return res.data;
  },

  async removeParent(studentId: string, parentId: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.students.parentById(studentId, parentId));
  },
};
