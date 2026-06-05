// Add this to your existing @/types file (e.g. types/index.ts or types/models.ts)

export interface ClassSectionSubject {
  id: string;
  school_id: string;
  class_section_id: string;
  subject_id: string;
  academic_year_id: string;
  is_teaching_subject: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
}