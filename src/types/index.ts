import type { AxiosRequestConfig } from 'axios';

// ─── Role ─────────────────────────────────────────────────────────────────────

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

// ─── AuthContext ───────────────────────────────────────────────────────────────

export const AuthContext = {
  COMPANY: 'COMPANY',
  SCHOOL: 'SCHOOL',
} as const;

export type AuthContext = (typeof AuthContext)[keyof typeof AuthContext];

// ─── AuthLoginTab ──────────────────────────────────────────────────────────────

export const AuthLoginTab = {
  COMPANY: 'company',
  SCHOOL: 'school',
} as const;

export type AuthLoginTab = (typeof AuthLoginTab)[keyof typeof AuthLoginTab];

// ─── Domain models ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  email?: string;
  phone_number?: string;
  role: Role;
  school_id?: string;
  profile_image?: string | null;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  code?: string;
  contact_number?: string | null;
  dial_code?: string;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  pincode?: string | null;
  logo_url?: string | null;
  board_type?: string | null;
  marking_system?: string | null;
  lat?: number | null;
  lng?: number | null;
  is_active: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: string;
}

// ─── Academic Year ─────────────────────────────────────────────────────────────

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string;
  session_code?: string | null;
  description?: string | null;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
  is_enabled: boolean;
  timetable_session_id?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
}

// ─── Class ────────────────────────────────────────────────────────────────────

export interface Class {
  id: string;
  school_id: string;
  academic_year_id: string;
  timetable_session_id?: string | null;
  name: string;
  display_name: string;
  class_id: string;
  department?: string | null;
  class_type?: string | null;
  class_sequence?: number | null;
  no_of_sessions?: number | null;
  class_code?: string | null;
  default_sections?: string | null;
  numeric_value?: number | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface Section {
  id: string;
  school_id: string;
  class_id: string;
  name: string;
  room_number?: string | null;
  max_strength?: number | null;
  class_teacher_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ─── Subject ──────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  school_id: string;
  class_id?: string | null;
  name: string;
  code?: string | null;
  description?: string | null;
  created_at: string;
}

// ─── Student ──────────────────────────────────────────────────────────────────

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED' | 'DROPPED';

export interface Student {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string | null;
  admission_number: string;
  roll_number?: string | null;
  first_name: string;
  last_name?: string | null;
  gender?: Gender | null;
  date_of_birth?: string | null;
  blood_group?: BloodGroup | null;
  email?: string | null;
  phone_number?: string | null;
  dial_code?: string;
  aadhaar_number?: string | null;
  religion?: string | null;
  caste?: string | null;
  nationality?: string;
  admission_date?: string | null;
  status: StudentStatus;
  profile_image?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ─── Parent ───────────────────────────────────────────────────────────────────

export type ParentRelation = 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'GRANDPARENT' | 'SIBLING' | 'OTHER';

export interface Parent {
  id: string;
  student_id: string;
  relation: ParentRelation;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone_number: string;
  dial_code: string;
  occupation?: string | null;
  annual_income?: number | null;
  aadhaar_number?: string | null;
  is_primary: boolean;
  can_pickup: boolean;
  created_at: string;
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'OFFBOARDED';
export type StaffRole = 'SCHOOL_ADMIN' | 'PRINCIPAL' | 'VICE_PRINCIPAL' | 'TEACHER' | 'CLASS_TEACHER' | 'ACCOUNTANT' | 'LIBRARIAN';

export interface Staff {
  id: string;
  school_id: string;
  user_id?: string | null;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  dial_code?: string;
  employee_id?: string | null;
  designation?: string | null;
  department?: string | null;
  staff_role?: StaffRole | null;
  role?: StaffRole | null; // adding for fallback for staff_role
  date_of_joining?: string | null;
  date_of_birth?: string | null;
  gender?: Gender | null;
  status: StaffStatus;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

// ─── Standalone Parent ────────────────────────────────────────────────────────

export interface SchoolParent {
  id: string;
  school_id: string;
  user_id?: string | null;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  dial_code?: string;
  occupation?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

// ─── Bulk Import ──────────────────────────────────────────────────────────────

export type BulkImportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface BulkImportJob {
  jobId: string;
  status: BulkImportStatus;
  total?: number;
  processed?: number;
  failed?: number;
  errors?: string[];
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED' | 'HOLIDAY';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  roll_number: string;
  school_id: string;
  class_section_id?: string | null;
  date: string;
  status: AttendanceStatus;
  is_late: boolean;
  remarks?: string | null;
  marked_by?: string | null;
  marked_by_username?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface MarkAttendanceEntry {
  student_id: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface MarkAttendancePayload {
  date: string;
  academic_year_id: string;
  class_section_id: string;
  entries: MarkAttendanceEntry[];
}


export interface DailyAttendanceReport {
  date: string;
  class_section_id?: string;
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
  }
  records: AttendanceRecord[];
}

export interface MonthlyAttendanceSummary {
  student_id: string;
  student_name?: string;
  total_days: number;
  present: number;
  absent: number;
  late: number;
  half_day?: number;
  percentage: number;
  student_summaries: MonthlyStudentSummary[];
  records: AttendanceRecord[];
}

export interface MonthlyStudentSummary {
  student_id: string;
  student_name: string;
  roll_number: string;
  admission_number: string;
  present: number;
  absent: number;
  total: number;
  total_days: number;
  percentage: number;
}

export interface MonthlyAttendanceStats {
  total_students: number;
  total: number;
  present: number;
  absent: number;
  late: number;
}

export interface MonthlyAttendanceReport {
  class_section_id: string;
  class_section_name: string;
  year: number;
  month: number;
  stats: MonthlyAttendanceStats;
  student_summaries: MonthlyStudentSummary[];
}

export interface AttendanceSummary {
  student_id: string;
  total_days: number;
  present: number;
  absent: number;
  late: number;
  half_day?: number;
  percentage: number;
  monthly?: {
    month: number;
    year: number;
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  }[];
}

export interface AttendanceDefaulter {
  student_id: string;
  student_name?: string;
  admission_number?: string;
  class_name?: string;
  section_name?: string;
  percentage: number;
  total_days: number;
  present: number;
  absent: number;
  studentName?: string;
  admissionNo?: string;
  rollNo?: string;
  roll_number?:string;
  total_present?: string;
  total_absent?: string;
}

export interface AttendanceExportJob {
  jobId: string;
  status: string;
}

// ─── Student Document ─────────────────────────────────────────────────────────

export type DocumentType = 'BIRTH_CERTIFICATE' | 'TRANSFER_CERTIFICATE' | 'AADHAAR' | 'PHOTO' | 'MEDICAL_CERTIFICATE' | 'CASTE_CERTIFICATE' | 'INCOME_CERTIFICATE' | 'PREVIOUS_MARKSHEET' | 'OTHER';

export interface StudentDocument {
  id: string;
  student_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  file_size?: number | null;
  mime_type?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ─── Exam ─────────────────────────────────────────────────────────────────────

export interface Exam {
  id: string;
  school_id: string;
  academic_year_id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ExamPolicy {
  id: string;
  school_id: string;
  exam_id: string;
  name: string;
  passing_marks?: number | null;
  total_marks?: number | null;
  marking_system?: 'MARKS' | 'GRADES' | 'PERCENTAGE' | null;
  grace_marks?: number | null;
  created_at: string;
}

export interface ExamTimetableEntry {
  id: string;
  school_id: string;
  exam_id: string;
  class_section_id: string;
  subject_id: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  room_number?: string | null;
  created_at: string;
}

export interface ExamStudent {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  roll_number?: string | null;
  is_eligible: boolean;
  created_at: string;
}

export interface ExamRoom {
  id: string;
  school_id: string;
  exam_id: string;
  room_name: string;
  capacity: number;
  created_at: string;
}

export interface ExamSeat {
  id: string;
  school_id: string;
  exam_id: string;
  exam_room_id: string;
  student_id: string;
  seat_number: string;
  date: string;
  created_at: string;
}

export interface AdmitCard {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  admit_card_number?: string | null;
  is_issued: boolean;
  issued_at?: string | null;
  created_at: string;
}

export interface ExamMarkEntry {
  student_id: string;
  marks_obtained?: number;
  is_absent?: boolean;
  grade?: string;
}

export interface ExamMark {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  subject_id: string;
  class_section_id: string;
  marks_obtained?: number | null;
  total_marks: number;
  is_absent: boolean;
  grade?: string | null;
  entered_by?: string | null;
  created_at: string;
}

export interface TeacherRemark {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  remark: string;
  entered_by?: string | null;
  created_at: string;
}

// ─── Homework ─────────────────────────────────────────────────────────────────

export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';
export type HomeworkStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface HomeworkAttachment {
  id: string;
  homework_id: string;
  school_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: string | null;
  created_at: string;
}

export interface Homework {
  id: string;
  school_id: string;
  academic_year_id: string;
  timetable_session_id?: string | null;
  class_id?: string | null;
  class_detail_id?: string | null;
  subject_id?: string | null;
  title: string;
  description?: string | null;
  homework_date?: string | null;
  due_date: string;
  status: HomeworkStatus;
  send_notification: boolean;
  student_upload_allowed: boolean;
  assigned_by?: string | null;
  deleted: boolean;
  created_at: string;
  updated_at?: string | null;
  class_name?: string | null;
  class_detail_name?: string | null;
  subject_name?: string | null;
  session_name?: string | null;
  created_by_name?: string | null;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  school_id: string;
  status: SubmissionStatus;
  remarks?: string | null;
  submission_url?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ─── Study Materials ──────────────────────────────────────────────────────────

export interface StudyMaterial {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_section_id: string;
  subject_id: string;
  title: string;
  description?: string | null;
  file_url: string;
  file_type?: string | null;
  uploaded_by?: string | null;
  deleted: boolean;
  created_at: string;
  updated_at?: string | null;
}

// ─── Fees ─────────────────────────────────────────────────────────────────────

export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WAIVED';
export type PaymentMode = 'CASH' | 'ONLINE' | 'CHEQUE' | 'DD' | 'NEFT' | 'UPI';

export interface FeeMasterType {
  id: string;
  school_id: string;
  name: string;
  description?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface FeeItem {
  fee_type_id: string;
  fee_type_name: string;
  amount: number;
}

export interface FeeReceipt {
  id: string;
  school_id: string;
  student_id: string;
  academic_year_id: string;
  receipt_number?: string | null;
  fee_items: FeeItem[];
  total_amount: number;
  paid_amount: number;
  discount_amount: number;
  balance_amount: number;
  status: FeeStatus;
  due_date?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface FeePayment {
  id: string;
  receipt_id: string;
  school_id: string;
  amount: number;
  payment_mode: PaymentMode;
  transaction_id?: string | null;
  notes?: string | null;
  paid_by?: string | null;
  created_at: string;
}

// ─── Uploads ──────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string;
  s3Key: string;
}

// ─── Leave ────────────────────────────────────────────────────────────────────

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveType {
  id: string;
  policy_id: string;
  school_id: string;
  name: string;
  max_days: number;
  is_paid: boolean;
  description?: string | null;
  created_at: string;
}

export interface LeavePolicy {
  id: string;
  school_id: string;
  academic_year_id: string;
  name: string;
  description?: string | null;
  leave_types?: LeaveType[];
  created_at: string;
  updated_at?: string | null;
}

export interface LeaveBalance {
  id: string;
  school_id: string;
  staff_id: string;
  leave_type_id: string;
  academic_year_id: string;
  total_days: number;
  used_days: number;
  remaining_days: number;
  leave_type?: LeaveType;
}

export interface TeacherLeaveRequest {
  id: string;
  school_id: string;
  staff_id: string;
  leave_type_id: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  status: LeaveRequestStatus;
  reviewer_id?: string | null;
  reviewer_remarks?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  leave_type?: LeaveType;
}

export interface StudentLeaveRequest {
  id: string;
  school_id: string;
  student_id: string;
  applied_by?: string | null;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  status: LeaveRequestStatus;
  reviewer_id?: string | null;
  reviewer_remarks?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
export type PlanType = 'MONTHLY' | 'ANNUAL' | 'LIFETIME' | 'TRIAL';

export interface Subscription {
  id: string;
  school_id: string;
  plan_name: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  amount: string;
  currency: string;
  max_students?: number | null;
  max_staff?: number | null;
  features?: string[] | null;
  start_date?: string | null;
  end_date?: string | null;
  trial_end_date?: string | null;
  is_trial: boolean;
  auto_renew: boolean;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: string;
}

// ─── API Gateway types ─────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface ApiGatewayConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions<D = unknown> extends AxiosRequestConfig<D> {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export type GatewayResponse<T> = ApiEnvelope<T>;

export type RefreshTokenFn = () => Promise<{ accessToken: string; refreshToken: string }>;

export type { AxiosRequestConfig };
