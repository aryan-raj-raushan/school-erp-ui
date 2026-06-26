// ─── Exam Result ─────────────────────────────────────────────────────────────

export interface ExamResultRow {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string | null;
  subject_id: string;
  subject_name: string;
  subject_type: string;
  exam_schedule_id: string;
  marks_obtained: string | null;
  max_marks: number;
  is_absent: boolean;
  is_published: boolean;
}

export interface ExamScheduleItem {
  id: string;
  subject_id: string;
  subject_name: string;
  subject_type: string;
  exam_marks: number;
  passing_marks: number;
  exam_date: string;
  parent_schedule_id: string | null;
}

export interface ExamResultFilters {
  exam_id?: string;
  class_id?: string;
  section_id?: string;
  academic_year_id?: string;
  student_id?: string;
  search?: string;
}

// Per-student entry used in the bulk mark-entry table
export interface StudentMarkEntry {
  student_id: string;
  student_name: string;
  roll_number: string | null;
  admission_number: string;
  // keyed by exam_schedule_id
  marks: Record<string, { marks_obtained: number | null; is_absent: boolean }>;
}

// ─── Report Cards ─────────────────────────────────────────────────────────────

export interface ReportCardItem {
  id: string;
  student_id: string;
  exam_id: string | null;
  student_name: string;
  roll_number: string | null;
  class_name: string | null;
  section_name: string | null;
  academic_year_name: string | null;
  exam_name: string | null;
  exam_term: string | null;
  total_marks: number | null;
  marks_obtained: string | null;
  percentage: string | null;
  grade: string | null;
  rank: number | null;
  status: 'PENDING' | 'GENERATED' | 'FAILED';
  is_published: boolean;
  pdf_url: string | null;
  created_at: string;
}

export interface ReportCardFilters {
  exam_id?: string;
  class_id?: string;
  section_id?: string;
  academic_year_id?: string;
  student_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GenerateReportCardPayload {
  exam_id: string;
  class_id: string;
  section_id?: string;
  student_id?: string;
  remarks?: string;
}

export interface PublishReportCardPayload {
  exam_id: string;
  class_id?: string;
  section_id?: string;
  student_id?: string;
  is_published: boolean;
}

export interface BulkUpsertResultPayload {
  exam_id: string;
  class_id: string;
  section_id?: string;
  academic_year_id: string;
  results: {
    student_id: string;
    exam_schedule_id: string;
    subject_id: string;
    marks_obtained: number | null;
    is_absent: boolean;
  }[];
}

export interface PublishResultPayload {
  exam_id: string;
  class_id?: string;
  section_id?: string;
  is_published: boolean;
}
