export type EnquiryStatus =
  | "NEW"
  | "FOLLOW_UP"
  | "ADMISSION_CONFIRMED"
  | "REJECTED";
export type EnquiryGender = "MALE" | "FEMALE" | "OTHER";
export type EnquiryReligion =
  | "HINDU"
  | "MUSLIM"
  | "CHRISTIAN"
  | "SIKH"
  | "JAIN"
  | "BUDDHIST"
  | "OTHER";
export type EnquiryCategory = "GENERAL" | "OBC" | "SC" | "ST" | "OTHER";
export type EnquiryAction =
  | "NEW_ENQUIRY"
  | "NEXT_FOLLOW_UP_UPDATE"
  | "ADMISSION_CONFIRMED"
  | "ENQUIRY_REJECTED";
// | 'REMARKS_UPDATED'
// | 'TEACHER_ASSIGNED';

export interface AdmissionSource {
  id: string;
  school_id: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  is_enabled: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
}

export interface AdmissionEnquiry {
  id: string;
  school_id: string;
  academic_year_id: string;
  father_name?: string | null;
  mother_name?: string | null;
  phone: string;
  dial_code: string;
  email?: string | null;
  father_occupation?: string | null;
  mother_occupation?: string | null;
  father_qualification?: string | null;
  mother_qualification?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  student_name: string;
  date_of_birth?: string | null;
  gender?: EnquiryGender | null;
  religion?: EnquiryReligion | null;
  category?: EnquiryCategory | null;
  student_current_address?: string | null;
  applying_academic_year_id: string;
  applying_class_id: string;
  previous_school_name?: string | null;
  previous_class?: string | null;
  registration_fee_required: boolean;
  assigned_teacher_id?: string | null;
  next_followup_date?: string | null;
  next_followup_time?: string | null;
  enquiry_source_id?: string | null;
  remarks: string;
  status: EnquiryStatus;
  is_active: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
}

export interface EnquiryHistory {
  id: string;
  school_id: string;
  enquiry_id: string;
  assigned_teacher_id?: string | null;
  action: EnquiryAction;
  details?: string | null;
  remarks?: string | null;
  next_followup_date?: string | null;
  next_followup_time?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
}

export interface AdmissionEnquiryFilters {
  page?: number;
  limit?: number;
  academic_year_id?: string;
  applying_class_id?: string;
  status?: EnquiryStatus;
  assigned_teacher_id?: string;
  enquiry_source_id?: string;
  next_followup_date?: string;
  search?: string;
}

export interface AdmissionSourceFilters {
  page?: number;
  limit?: number;
  is_enabled?: boolean;
}
