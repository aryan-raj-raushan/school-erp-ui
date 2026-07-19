import type { AxiosRequestConfig } from 'axios';

// ─── Role ─────────────────────────────────────────────────────────────────────

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT',
  SALES: 'SALES',
  OPERATOR: 'OPERATOR',
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
  custom_role_id?: string | null;
  /** Resolved permission slugs from /auth/me — populated for school users */
  permissions?: string[];
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
  // School Profile fields
  timezone?: string | null;
  udise_code?: string | null;
  affiliation_number?: string | null;
  established_year?: number | null;
  principal_name?: string | null;
  principal_email?: string | null;
  principal_phone?: string | null;
  is_active: boolean;
  deleted: boolean;
  restriction_level: RestrictionMode;
  restriction_applied_at?: string | null;
  restriction_reason?: string | null;
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
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
}

// ─── Class ────────────────────────────────────────────────────────────────────

export interface Class {
  id: string;
  school_id: string;
  academic_year_id: string;
  name: string;
  display_name: string;
  class_id: string;
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
export type BloodGroup = 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE';
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
  role: StaffRole;
  profile_image?: string | null;
  gender?: Gender | null;
  date_of_birth?: string | null;
  blood_group?: BloodGroup | null;
  address?: string | null;
  permanent_address?: string | null;
  city?: string | null;
  joining_date?: string | null;
  employee_code?: string | null;
  custom_role_id?: string | null;
  father_name?: string | null;
  husband_name?: string | null;
  reporting_to_id?: string | null;
  rfid_card_number?: string | null;
  qualification?: string | null;
  previous_employer?: string | null;
  previous_role?: string | null;
  total_experience?: string | null;
  is_active: boolean;
  status?: StaffStatus | null;
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

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'EXCUSED'
  | 'HOLIDAY'
  | 'LEAVE'
  | 'MISSING_PUNCH'
  | 'EARLY_EXIT';

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

export interface MissingPunchRecord {
  punch_id: string;
  student_id: string;
  student_name: string;
  admission_number: string | null;
  entry_tap: string;
  date: string;
}

export interface AttendanceAuditEntry {
  id: string;
  attendance_id: string;
  school_id: string;
  changed_by: string;
  changed_at: string;
  old_status: string | null;
  new_status: string | null;
  old_remarks: string | null;
  new_remarks: string | null;
  reason: string | null;
  ip_address: string | null;
}

export interface MarkAttendanceEntry {
  student_id: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface MarkAttendancePayload {
  date: string;
  session?: string;
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
  class_id?: string | null;
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
  class_id?: string | null;
  subject_id?: string | null;
  title: string;
  description?: string | null;
  content_type: 'text' | 'file' | 'youtube';
  content_text?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  youtube_url?: string | null;
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
  staff_name?: string | null;
  leave_type_id: string;
  academic_year_id: string;
  allocated: number;
  used: number;
  carried_forward: number;
  expires_at?: string | null;
  auto_credited_at?: string | null;
  can_go_negative: boolean;
  created_at: string;
  updated_at?: string | null;
  leave_type?: LeaveType;
}

export interface LeaveApprovalStep {
  id: string;
  school_id: string;
  leave_request_id: string;
  leave_type: 'TEACHER' | 'STUDENT';
  step_order: number;
  approver_id?: string | null;
  approver_role: 'HOD' | 'PRINCIPAL' | 'HR' | 'CLASS_TEACHER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string | null;
  decided_at?: string | null;
  created_at: string;
}

export interface LeaveWorkflow {
  id: string;
  school_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  steps?: { step_order: number; approver_role: string }[];
}

export interface StudentMovement {
  id: string;
  school_id: string;
  student_id: string;
  date: string;
  tapped_at: string;
  location: 'CAMPUS' | 'LIBRARY' | 'MEDICAL_ROOM' | 'SPORTS' | 'CANTEEN' | 'GATE' | 'HOSTEL' | 'LAB';
  device_id?: string | null;
}

export interface TeacherLeaveRequest {
  id: string;
  school_id: string;
  staff_id: string;
  staff_name?: string | null;
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
  student_name?: string | null;
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

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'TRIAL';
export type PlanType = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL' | 'CUSTOM';
export type BillingModel = 'PER_STUDENT' | 'FLAT';
export type RestrictionMode = 'NONE' | 'SOFT' | 'PARTIAL' | 'COMPLETE';
export type PaymentMethod = 'RAZORPAY' | 'STRIPE' | 'BANK_TRANSFER' | 'QR_CODE' | 'CHEQUE' | 'CASH' | 'OTHER';

export interface Subscription {
  id: string;
  school_id: string;
  plan_id?: string | null;
  plan_name: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  billing_model: BillingModel;
  amount?: string | null;
  price_per_student?: string | null;
  currency: string;
  max_students?: number | null;
  max_staff?: number | null;
  features?: string[] | null;
  start_date?: string | null;
  end_date?: string | null;
  next_billing_date?: string | null;
  trial_end_date?: string | null;
  is_trial: boolean;
  auto_renew: boolean;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  grace_period_days: number;
  restriction_mode: RestrictionMode;
  restricted_resources: string[];
  payment_methods_allowed: PaymentMethod[];
  created_at: string;
  updated_at?: string | null;
  created_by?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  billing_model: BillingModel;
  flat_amount?: string | null;
  price_per_student?: string | null;
  billing_cycle: PlanType;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ─── Invoices & one-time charges ────────────────────────────────────────────────

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID';
export type InvoiceLineType = 'SUBSCRIPTION' | 'ONE_TIME_CHARGE';
export type OneTimeChargeType = 'RFID_DEVICE' | 'RFID_INSTALLATION' | 'SETUP' | 'TRAINING' | 'SUPPORT' | 'OTHER';

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: string;
  amount: string;
  line_type: InvoiceLineType;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  school_id: string;
  subscription_id?: string | null;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  student_count_snapshot?: number | null;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  amount_paid: string;
  status: InvoiceStatus;
  due_date: string;
  issued_at: string;
  paid_at?: string | null;
  notes?: string | null;
  pdf_url?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface InvoiceWithLineItems extends Invoice {
  line_items: InvoiceLineItem[];
}

export type InvoicePaymentStatus = 'PENDING' | 'PENDING_VERIFICATION' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface InvoicePayment {
  id: string;
  school_id: string;
  subscription_id?: string | null;
  invoice_id?: string | null;
  amount: string;
  currency: string;
  status: InvoicePaymentStatus;
  payment_method?: PaymentMethod | null;
  gateway_payment_id?: string | null;
  gateway_order_id?: string | null;
  proof_url?: string | null;
  verified_by?: string | null;
  approved_at?: string | null;
  rejected_reason?: string | null;
  notes?: string | null;
  paid_at?: string | null;
  is_manual: boolean;
  created_by?: string | null;
  created_at: string;
}

export interface RazorpayOrder {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

// ─── RFID Inventory ─────────────────────────────────────────────────────────

export type RfidDeviceStatus = 'IN_STOCK' | 'ASSIGNED' | 'INSTALLED' | 'MAINTENANCE' | 'RETURNED' | 'RETIRED';

export interface RfidDevice {
  id: string;
  device_identifier: string;
  device_model?: string | null;
  purchase_date?: string | null;
  status: RfidDeviceStatus;
  assigned_school_id?: string | null;
  installation_date?: string | null;
  warranty_expiry?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface OneTimeCharge {
  id: string;
  school_id: string;
  subscription_id?: string | null;
  charge_type: OneTimeChargeType;
  description?: string | null;
  amount: string;
  status: 'PENDING' | 'INVOICED';
  created_by?: string | null;
  created_at: string;
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

// ─── Early Exit ──────────────────────────────────────────────────────────────
export type EarlyExitReason = 'MEDICAL' | 'PARENT_PICKUP' | 'EMERGENCY' | 'OFFICIAL' | 'OTHER';
export type EarlyExitStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface EarlyExitRecord {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  exit_time: string;
  reason: EarlyExitReason;
  remarks: string | null;
  status: EarlyExitStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}
export interface CreateEarlyExitPayload {
  student_id: string;
  date: string;
  exit_time: string;
  reason: EarlyExitReason;
  remarks?: string;
}

// ─── Gate Pass ───────────────────────────────────────────────────────────────
export type GatePassStatus = 'PENDING' | 'APPROVED' | 'USED' | 'EXPIRED' | 'REJECTED';
export interface GatePassRecord {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  reason: string;
  exit_time: string | null;
  return_time: string | null;
  qr_code: string | null;
  status: GatePassStatus;
  approved_by: string | null;
  approved_at: string | null;
  used_at: string | null;
  created_at: string;
}
export interface CreateGatePassPayload {
  student_id: string;
  date: string;
  reason: string;
  exit_time?: string;
  return_time?: string;
  parent_consent_required?: boolean;
}

// ─── Notification Rules ───────────────────────────────────────────────────────
export type NotificationEvent = 'ABSENT' | 'LATE' | 'HOLIDAY' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'EARLY_EXIT' | 'MISSING_PUNCH' | 'GATE_PASS_APPROVED';
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'ALL';
export interface NotificationRule {
  id: string;
  school_id: string;
  event_type: NotificationEvent;
  notify_parent: boolean;
  notify_student: boolean;
  notify_teacher: boolean;
  channel: NotificationChannel;
  delay_minutes: number;
  is_active: boolean;
}

// ─── Attendance Dashboard ─────────────────────────────────────────────────────
export interface AttendanceDashboardStats {
  date: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  half_day: number;
  leave: number;
  holiday: number;
  missing_punch: number;
  total: number;
  pending_conflicts: number;
  pending_leave_requests: number;
}

// ─── Attendance Conflict ──────────────────────────────────────────────────────
export interface AttendanceConflict {
  id: string;
  school_id: string;
  attendance_id: string | null;
  student_id: string;
  date: string;
  rfid_status: string | null;
  rfid_tap_time: string | null;
  manual_status: string | null;
  manual_marked_by: string | null;
  manual_marked_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution: 'RFID_WON' | 'MANUAL_WON' | 'ADMIN_SET' | null;
  notes: string | null;
}

// ─── Heatmap / Trend ─────────────────────────────────────────────────────────
export interface HeatmapEntry { date: string; status: string; }
export interface LateTrendEntry { date: string; late_count: number; }

// ─── Audit Log ───────────────────────────────────────────────────────────────
export type AuditEntity = 'ATTENDANCE' | 'LEAVE' | 'HOLIDAY' | 'TIMING' | 'SETTINGS' | 'GATE_PASS' | 'EARLY_EXIT' | 'USER';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLogRecord {
  id: string;
  school_id: string;
  entity: AuditEntity;
  entity_id: string;
  action: AuditAction;
  changed_by: string;
  ip_address: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

