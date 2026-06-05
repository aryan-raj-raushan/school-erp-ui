import { apiGateway } from "@/lib/api-gateway/api-gateway.instance";
import { ENDPOINTS } from "@/lib/api-gateway/endpoints";
import type { PaginationMeta } from "@/types";
import type { ClassSectionSubject } from "@/types/setting/class-subject.types";
export interface ClassSubjectFilters {
  page?: number;
  limit?: number;
  class_section_id?: string;
  academic_year_id?: string;
}

export interface CreateClassSubjectPayload {
  class_section_id: string;
  subject_id: string;
  academic_year_id: string;
  is_teaching_subject?: boolean;
}

export interface UpdateClassSubjectPayload extends Partial<CreateClassSubjectPayload> {}

export const ClassSubjectsService = {
  async list(
    filters: ClassSubjectFilters = {},
  ): Promise<{ items: ClassSectionSubject[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<ClassSectionSubject[]>(
      ENDPOINTS.classSubjects.list,
      {
        params: filters,
      },
    );
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<ClassSectionSubject> {
    const res = await apiGateway.get<ClassSectionSubject>(
      ENDPOINTS.classSubjects.byId(id),
    );
    return res.data;
  },

  async create(
    payload: CreateClassSubjectPayload,
  ): Promise<ClassSectionSubject> {
    const res = await apiGateway.post<ClassSectionSubject>(
      ENDPOINTS.classSubjects.list,
      payload,
    );
    return res.data;
  },

  async update(
    id: string,
    payload: UpdateClassSubjectPayload,
  ): Promise<ClassSectionSubject> {
    const res = await apiGateway.put<ClassSectionSubject>(
      ENDPOINTS.classSubjects.byId(id),
      payload,
    );
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.classSubjects.byId(id));
  },
};
