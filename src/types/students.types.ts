export type StudentStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "TRANSFERRED"
  | "GRADUATED"
  | "DROPPED";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type BloodGroup =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE";
export type Religion =
  | "HINDU"
  | "MUSLIM"
  | "CHRISTIAN"
  | "SIKH"
  | "JAIN"
  | "BUDDHIST"
  | "OTHER";
export type Category = "GENERAL" | "OBC" | "SC" | "ST" | "OTHER";
export type ParentRelation =
  | "FATHER"
  | "MOTHER"
  | "GUARDIAN"
  | "GRANDPARENT"
  | "SIBLING"
  | "OTHER";
export type Qualification =
  | "BELOW_10TH"
  | "CLASS_10TH"
  | "CLASS_12TH"
  | "UNDERGRADUATE"
  | "POSTGRADUATE"
  | "MASTERS"
  | "DOCTORATE"
  | "OTHER";
export type DocumentType =
  | "BIRTH_CERTIFICATE"
  | "TRANSFER_CERTIFICATE"
  | "AADHAAR"
  | "PHOTO"
  | "MEDICAL_CERTIFICATE"
  | "CASTE_CERTIFICATE"
  | "INCOME_CERTIFICATE"
  | "PREVIOUS_MARKSHEET"
  | "MERIT_CERTIFICATE"
  | "REPORT"
  | "OTHER";
export type DocumentFileType = "PDF" | "IMAGE";

// ─── Sub-entities ──────────────────────────────────────────────────────────────

export interface StudentAcademicInfo {
  id: string;
  student_id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string | null;
  admission_number: string;
  registration_number: string | null;
  roll_number: string | null;
  joining_date: string | null;
  is_current: boolean;
}

export interface StudentPreviousAcademics {
  id: string;
  student_id: string;
  previous_school_name: string | null;
  previous_class: string | null;
  passing_year: string | null;
  total_marks: string | null;
  grade: string | null;
  board: string | null;
  tc_number: string | null;
}

export interface StudentAddress {
  id: string;
  student_id: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
}

export interface StudentHostelInfo {
  id: string;
  student_id: string;
  hostel_required: boolean;
  hostel_name: string | null;
  room_number: string | null;
}

export interface StudentParent {
  id: string;
  student_id: string;
  relation: ParentRelation;
  first_name: string;
  last_name: string | null;
  email: string | null;
  dial_code: string;
  phone_number: string;
  alternate_phone: string | null;
  occupation: string | null;
  qualification: Qualification | null;
  annual_income: string | null;
  aadhaar_number: string | null;
  profile_image: string | null;
  is_primary: boolean;
  can_pickup: boolean;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  document_name: DocumentType;
  file_type: DocumentFileType;
  document_link: string;
  original_filename: string | null;
  remarks: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// ─── Full Student ──────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  school_id: string;
  system_number: number;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  blood_group: BloodGroup | null;
  religion: Religion | null;
  category: Category | null;
  caste: string | null;
  nationality: string | null;
  aadhaar_number: string | null;
  id_card_number: string | null;
  height_cm: string | null;
  weight_kg: string | null;
  profile_image: string | null;
  dial_code: string | null;
  phone_number: string | null;
  email: string | null;
  status: StudentStatus;
  is_enabled: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface StudentFull {
  student: Student;
  academicInfo: StudentAcademicInfo | null;
  previousAcademics: StudentPreviousAcademics | null;
  address: StudentAddress | null;
  hostelInfo: StudentHostelInfo | null;
  parents: StudentParent[];
  documents: StudentDocument[];
}

// ─── List item (from GET /students) ───────────────────────────────────────────

export interface StudentListItem {
  id: string;
  system_number: number;
  first_name: string;
  last_name: string | null;
  gender: Gender | null;
  date_of_birth: string | null;
  profile_image: string | null;
  status: StudentStatus;
  is_enabled: boolean;
  phone_number: string | null;
  email: string | null;
  academic_year_id: string | null;
  class_id: string | null;
  section_id: string | null;
  admission_number: string | null;
  roll_number: string | null;
  class_name: string | null;
  section_name: string | null;
  academic_year_name: string | null;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface StudentFilters {
  academic_year_id?: string;
  class_id?: string;
  section_id?: string;
  status?: StudentStatus;
  gender?: Gender;
  is_enabled?: boolean;
  search?: string;
  page?: number;
}

// ─── ID Card Data ──────────────────────────────────────────────────────────────

export interface StudentIdCardData {
  id: string;
  system_number: number;
  first_name: string;
  last_name: string | null;
  profile_image: string | null;
  gender: Gender | null;
  blood_group: BloodGroup | null;
  phone_number: string | null;
  admission_number: string | null;
  roll_number: string | null;
  class_name: string | null;
  section_name: string | null;
  school_name: string | null;
  school_address: string | null;
  school_city: string | null;
  school_logo: string | null;
  school_phone: string | null;
  school_email: string | null;
  school_website: string | null;
  address: StudentAddress | null;
}

export interface PickupCardData {
  student: StudentIdCardData;
  parents: StudentParent[];
}
