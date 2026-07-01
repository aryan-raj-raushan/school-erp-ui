import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export interface ClassSubjectTeacherMapping {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  subject_name: string;
  teacher_name: string;
  is_active: boolean;
  created_at: string;
}

export interface ClassSubjectTeacherFilters {
  academic_year_id: string;
  class_id: string;
}

export interface ClassSubjectTeacherItem {
  subject_id: string;
  teacher_id: string;
}

export interface UpsertClassSubjectTeachersPayload {
  academic_year_id: string;
  class_id: string;
  mappings: ClassSubjectTeacherItem[];
}

export const ClassSubjectTeacherService = {
  async list(filters: ClassSubjectTeacherFilters): Promise<ClassSubjectTeacherMapping[]> {
    const res = await apiGateway.get<ClassSubjectTeacherMapping[]>(
      ENDPOINTS.classSubjectTeachers.list,
      { params: filters },
    );
    return res.data;
  },

  async replaceForClass(payload: UpsertClassSubjectTeachersPayload): Promise<void> {
    await apiGateway.put(ENDPOINTS.classSubjectTeachers.list, payload);
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.classSubjectTeachers.byId(id));
  },
};
