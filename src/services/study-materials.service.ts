import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { StudyMaterial } from '@/types';

export interface CreateStudyMaterialPayload {
  academic_year_id: string;
  class_section_id: string;
  subject_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type?: string;
}

export interface StudyMaterialFilters {
  class_section_id?: string;
  subject_id?: string;
  academic_year_id?: string;
}

export const StudyMaterialsService = {
  async list(filters: StudyMaterialFilters = {}): Promise<StudyMaterial[]> {
    const res = await apiGateway.get<StudyMaterial[]>(ENDPOINTS.studyMaterials.list, { params: filters });
    return res.data;
  },

  async getById(id: string): Promise<StudyMaterial> {
    const res = await apiGateway.get<StudyMaterial>(ENDPOINTS.studyMaterials.byId(id));
    return res.data;
  },

  async create(payload: CreateStudyMaterialPayload): Promise<StudyMaterial> {
    const res = await apiGateway.post<StudyMaterial>(ENDPOINTS.studyMaterials.list, payload);
    return res.data;
  },

  async update(id: string, payload: Partial<CreateStudyMaterialPayload>): Promise<StudyMaterial> {
    const res = await apiGateway.put<StudyMaterial>(ENDPOINTS.studyMaterials.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.studyMaterials.byId(id));
  },
};
