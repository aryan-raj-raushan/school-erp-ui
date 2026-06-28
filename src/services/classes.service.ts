import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { Class, Section, Subject, PaginationMeta } from '@/types';

export interface ClassFilters {
  page?: number;
  limit?: number;
  academic_year_id?: string;
}

export interface CreateClassPayload {
  name: string;
  academic_year_id: string;
  department?: string;
  class_type?: string;
  class_sequence?: number;
  no_of_sessions?: number;
  class_code?: string;
  default_sections?: string;
  numeric_value?: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateClassPayload extends Partial<CreateClassPayload> {}

export interface SectionFilters {
  page?: number;
  limit?: number;
  class_id?: string;
}

export interface CreateSectionPayload {
  name: string;
  class_id: string;
  room_number?: string;
  max_strength?: number;
  class_teacher_id?: string;
}

export interface UpdateSectionPayload extends Partial<CreateSectionPayload> {}

// Raw shape returned by backend /classes (section-class JOIN)
type RawClassSection = {
  id: string; class_id: string; class_name: string; section_name: string;
  school_id: string; academic_year_id: string;
  department?: string | null; class_type?: string | null; class_sequence?: number | null;
  no_of_sessions?: number | null; class_code?: string | null; default_sections?: string | null;
  numeric_value?: number | null; is_active: boolean;
  class_teacher_id?: string | null; room_number?: string | null;
  student_capacity?: number | null; created_at: string; updated_at?: string | null;
};

export const ClassesService = {
  async list(filters: ClassFilters = {}): Promise<{ items: Class[]; sections: Section[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<RawClassSection[]>(ENDPOINTS.classes.list, { params: filters });
    const raw = res.data;

    // Deduplicate classes by class_id; use class_id as id so student lookups match
    const seen = new Set<string>();
    const items: Class[] = [];
    for (const r of raw) {
      if (!seen.has(r.class_id)) {
        seen.add(r.class_id);
        items.push({
          id: r.class_id,
          class_id: r.class_id,
          name: r.class_name,
          display_name: r.class_name,
          school_id: r.school_id,
          academic_year_id: r.academic_year_id,
          department: r.department ?? null,
          class_type: r.class_type ?? null,
          class_sequence: r.class_sequence ?? null,
          no_of_sessions: r.no_of_sessions ?? null,
          class_code: r.class_code ?? null,
          default_sections: r.default_sections ?? null,
          numeric_value: r.numeric_value ?? null,
          description: null,
          is_active: r.is_active,
          created_at: r.created_at,
          updated_at: r.updated_at ?? null,
        });
      }
    }

    // Extract sections from the same JOIN response — deduplicate by section id
    const sectionSeen = new Set<string>();
    const sections: Section[] = [];
    for (const r of raw) {
      if (!sectionSeen.has(r.id)) {
        sectionSeen.add(r.id);
        sections.push({
          id: r.id,
          class_id: r.class_id,
          name: r.section_name,
          school_id: r.school_id,
          room_number: r.room_number ?? null,
          max_strength: r.student_capacity ?? null,
          class_teacher_id: r.class_teacher_id ?? null,
          created_at: r.created_at,
          updated_at: r.updated_at ?? null,
        });
      }
    }

    return { items, sections, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Class> {
    const res = await apiGateway.get<Class>(ENDPOINTS.classes.byId(id));
    return res.data;
  },

  async create(payload: CreateClassPayload): Promise<Class> {
    const res = await apiGateway.post<Class>(ENDPOINTS.classes.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateClassPayload): Promise<Class> {
    const res = await apiGateway.patch<Class>(ENDPOINTS.classes.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.classes.byId(id));
  },

  async listSubjects(class_id: string): Promise<Subject[]> {
    const res = await apiGateway.get<Subject[]>(ENDPOINTS.subjects.list, { params: { class_id } });
    return res.data;
  },
};

export const SectionsService = {
  async list(filters: SectionFilters = {}): Promise<{ items: Section[]; pagination: PaginationMeta }> {
    // Backend expects camelCase `classId`, not snake_case `class_id`
    const { class_id, ...rest } = filters;
    const params = { ...rest, ...(class_id ? { classId: class_id } : {}) };
    const res = await apiGateway.get<Section[]>(ENDPOINTS.sections.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Section> {
    const res = await apiGateway.get<Section>(ENDPOINTS.sections.byId(id));
    return res.data;
  },

  async create(payload: CreateSectionPayload): Promise<Section> {
    const res = await apiGateway.post<Section>(ENDPOINTS.sections.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSectionPayload): Promise<Section> {
    const res = await apiGateway.patch<Section>(ENDPOINTS.sections.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.sections.byId(id));
  },
};
