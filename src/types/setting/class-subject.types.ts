import { PaginationMeta } from "..";

// Add this to your existing @/types file (e.g. types/index.ts or types/models.ts)
export interface ClassSectionSubject {
  id: string;
  class_section_id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  academic_year_id: string;
  is_teaching_subject: boolean;
  created_at: string;
}

export interface ClassSectionSubjectsData {
  items: ClassSectionSubject[];
  meta: PaginationMeta;
}

export interface ClassSectionSubjectsResponse {
  success: boolean;
  message: string;
  data: ClassSectionSubjectsData;
}
