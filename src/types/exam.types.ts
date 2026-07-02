// ── Enums ─────────────────────────────────────────────────────────────────────

export type ExamTerm = 'TERM1' | 'TERM2' | 'TERM3' | 'ANNUAL';
export type SubjectType = 'MAIN_EXAM' | 'SECONDARY_EXAM' | 'PRACTICAL_EXAM' | 'ORAL_EXAM';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type ExamStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'PUBLISHED'
  | 'STARTED'
  | 'COMPLETED'
  | 'LOCKED'
  | 'ARCHIVED';

export const EXAM_STATUS_TRANSITIONS: Record<ExamStatus, ExamStatus[]> = {
  DRAFT: ['UNDER_REVIEW', 'PUBLISHED'],
  UNDER_REVIEW: ['DRAFT', 'PUBLISHED'],
  PUBLISHED: ['STARTED', 'UNDER_REVIEW'],
  STARTED: ['COMPLETED'],
  COMPLETED: ['LOCKED'],
  LOCKED: ['ARCHIVED'],
  ARCHIVED: [],
};

// ── Module 1 – Grading ────────────────────────────────────────────────────────

export interface ExamGrading {
  id: string;
  school_id: string;
  grade_name: string;
  from_percentage: string;
  to_percentage: string;
  sequence_index: number;
  description?: string;
  is_enabled: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface CreateExamGradingPayload {
  grade_name: string;
  from_percentage: string;
  to_percentage: string;
  sequence_index?: number;
  description?: string;
  is_enabled?: boolean;
}

export type UpdateExamGradingPayload = Partial<CreateExamGradingPayload>;

// ── Module 2 – Exam ───────────────────────────────────────────────────────────

export interface Exam {
  id: string;
  school_id: string;
  academic_year_id: string;
  /** Classes participating in this exam — one exam can span the whole school */
  class_ids: string[];
  code?: string;
  exam_name: string;
  exam_term: ExamTerm;
  start_date: string;
  end_date: string;
  include_in_marks: boolean;
  status: ExamStatus;
  is_published: boolean;
  is_enabled: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface ExamFilters {
  academic_year_id?: string;
  /** Filter to exams that include this class */
  class_id?: string;
  exam_term?: ExamTerm;
  is_published?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateExamPayload {
  academic_year_id: string;
  class_ids: string[];
  exam_name: string;
  exam_term: ExamTerm;
  start_date: string;
  end_date: string;
  include_in_marks?: boolean;
  is_enabled?: boolean;
}

export type UpdateExamPayload = Partial<CreateExamPayload>;

// ── Auto-generate ─────────────────────────────────────────────────────────────

export interface AutoGenerateExamPayload {
  academic_year_id: string;
  class_ids: string[];
  exam_name: string;
  exam_term: ExamTerm;
  start_date: string;
  end_date: string;
  daily_start_time?: string;
  daily_end_time?: string;
  default_exam_marks?: number;
  default_passing_marks?: number;
  include_in_marks?: boolean;
  template_id?: string;
}

export interface RegenerateApplyPayload extends AutoGenerateExamPayload {
  force?: boolean;
}

export interface RegeneratePreviewResult {
  to_create: ExamScheduleItem[];
  to_replace: { existing: ExamSchedule; proposed: ExamScheduleItem; has_downstream_data: boolean }[];
  unchanged: ExamSchedule[];
  locked: ExamSchedule[];
  conflicts: AutoGenerateConflict[];
}

export interface ExamTemplate {
  id: string;
  school_id: string;
  name: string;
  exam_term: ExamTerm;
  default_exam_marks: number;
  default_passing_marks: number;
  default_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateExamTemplatePayload {
  name: string;
  exam_term: ExamTerm;
  default_exam_marks?: number;
  default_passing_marks?: number;
  default_duration_minutes?: number;
  is_active?: boolean;
}

export type UpdateExamTemplatePayload = Partial<CreateExamTemplatePayload>;

export interface CopyExamPayload {
  target_academic_year_id: string;
  new_start_date: string;
}

export interface AutoGenerateConflict {
  class_id: string;
  class_name: string;
  subject_name: string;
  exam_date?: string;
  reason: 'NO_SUBJECT_MAPPING' | 'NOT_ENOUGH_WORKING_DAYS' | 'NO_INVIGILATOR_AVAILABLE';
}

export interface AutoGenerateExamResult {
  exam: Exam;
  schedules: ExamSchedule[];
  conflicts: AutoGenerateConflict[];
}

// ── Module 3 – Schedule ───────────────────────────────────────────────────────

export interface SubSchedule {
  subject_type: SubjectType;
  subject_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  exam_marks: number;
  passing_marks: number;
  exam_invigilator_id?: string;
  hall_detail_id?: string;
}

export interface ExamScheduleItem {
  subject_id: string;
  subject_name: string;
  subject_type?: SubjectType;
  exam_date: string;
  start_time: string;
  end_time: string;
  exam_marks: number;
  passing_marks: number;
  exam_invigilator_id?: string;
  hall_detail_id?: string;
  sub_subject_enabled?: boolean;
  sub_schedules?: SubSchedule[];
}

export interface ExamSchedule {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string;
  section_name?: string | null;
  exam_id: string;
  subject_id: string;
  subject_name: string;
  subject_type: SubjectType;
  exam_date: string;
  start_time: string;
  end_time: string;
  exam_marks: number;
  passing_marks: number;
  exam_invigilator_id?: string;
  hall_detail_id?: string;
  sub_subject_enabled: boolean;
  parent_schedule_id?: string;
  locked: boolean;
  is_enabled: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BulkCreateSchedulePayload {
  exam_id: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string;
  schedules: ExamScheduleItem[];
}

export interface ScheduleFilters {
  academic_year_id?: string;
  class_id?: string;
  section_id?: string;
  exam_id?: string;
  subject_id?: string;
  subject_type?: SubjectType;
  exam_date?: string;
  page?: number;
  limit?: number;
}

export interface BulkLockSchedulePayload {
  ids: string[];
  locked: boolean;
}

export interface BulkUpdateSchedulePayload {
  ids: string[];
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  exam_invigilator_id?: string;
  hall_detail_id?: string;
}

export interface BulkUpdateScheduleResult {
  updated: ExamSchedule[];
  conflicts: { id: string; reason: string }[];
}

// ── Module 4 – Attendance ─────────────────────────────────────────────────────

export interface AttendanceEntry {
  student_id: string;
  schedule_id: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BulkMarkAttendancePayload {
  exam_id: string;
  academic_year_id: string;
  entries: AttendanceEntry[];
}

export interface ExamAttendance {
  id: string;
  school_id: string;
  academic_year_id: string;
  exam_id: string;
  schedule_id: string;
  student_id: string;
  status: AttendanceStatus;
  remarks?: string;
  marked_by?: string;
  created_at: string;
  student_name: string;
  subject_name: string;
  exam_date: string;
}

export interface AttendanceFilters {
  academic_year_id?: string;
  exam_id?: string;
  schedule_id?: string;
  student_id?: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

// ── Module 7 – Hall Details ───────────────────────────────────────────────────

export interface ExamHallDetail {
  id: string;
  school_id: string;
  hall_plan_id?: string | null;
  room_name: string;
  sitting_capacity: number;
  grid_rows?: number | null;
  grid_cols?: number | null;
  is_enabled: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateHallDetailPayload {
  room_name: string;
  sitting_capacity?: number;
  grid_rows?: number;
  grid_cols?: number;
  is_enabled?: boolean;
}

export type UpdateHallDetailPayload = Partial<CreateHallDetailPayload>;

// ── Module 8 – Sitting Plan ───────────────────────────────────────────────────

export interface SittingPlanEntry {
  student_id: string;
  hall_detail_id: string;
  seat_number?: number;
  roll_number?: string;
}

export interface BulkCreateSittingPayload {
  exam_id: string;
  academic_year_id: string;
  entries: SittingPlanEntry[];
}

export interface ExamSittingPlan {
  id: string;
  school_id: string;
  academic_year_id: string;
  exam_id: string;
  hall_plan_id?: string | null;
  hall_detail_id: string;
  student_id: string;
  seat_number?: number;
  roll_number?: string;
  deleted: boolean;
  created_at: string;
}

export interface SittingFilters {
  academic_year_id?: string;
  exam_id?: string;
  hall_plan_id?: string;
  hall_detail_id?: string;
  student_id?: string;
  page?: number;
  limit?: number;
}

export interface AutoShuffleSittingPayload {
  exam_id: string;
  /** Classes to include (defaults to every class participating in the exam) */
  class_ids?: string[];
  academic_year_id: string;
  hall_detail_ids: string[];
  clear_existing?: boolean;
}

export interface AutoShuffleSittingResult {
  total_assigned: number;
  rooms: { room_name: string; assigned_count: number }[];
  unassigned_count: number;
  shortfall_warning?: string;
}

export interface MasterPdfRoomEntry {
  class_name: string;
  subject_name: string;
  invigilator_name: string;
  student_count: number;
}

export interface MasterPdfRoomSection {
  room_name: string;
  entries: MasterPdfRoomEntry[];
}

// ── Module 9 – Admit Card ─────────────────────────────────────────────────────

export interface AdmitCardData {
  school: { id: string; name: string };
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    rollNumber?: string;
    className: string;
    sectionName?: string;
    profileImage?: string;
  };
  exam: { name: string; term: string; startDate: string; endDate: string };
  schedules: {
    subjectName: string;
    subjectType: string;
    examDate: string;
    startTime: string;
    endTime: string;
    examMarks: number;
    passingMarks: number;
  }[];
}

// ── Shared ────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}