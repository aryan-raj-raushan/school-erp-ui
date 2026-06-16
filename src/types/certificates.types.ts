// ─── Transfer Certificate ─────────────────────────────────────────────────────

export type CertificateStatus = 'DRAFT' | 'GENERATED' | 'CANCELLED';

export interface TransferCertificateListRow {
  id: string;
  reference_no: string;
  leaving_reason: string;
  status: CertificateStatus;
  pdf_url: string | null;
  created_at: string;
  student_name: string;
  class_name: string | null;
  section_name: string | null;
  academic_year_name: string | null;
}

export interface TransferCertificateDetail {
  id: string;
  school_id: string;
  student_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string | null;
  reference_no: string;
  qualified_for_higher_class: string;
  leaving_date: string;
  total_working_days: number;
  total_present: number;
  extra_activities: string | null;
  candidate_character: string;
  leaving_reason: string;
  fees_due: string;
  pdf_url: string | null;
  pdf_s3_key: string | null;
  status: CertificateStatus;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  student: {
    id: string;
    first_name: string;
    last_name: string | null;
    date_of_birth: string | null;
    aadhaar_number: string | null;
    profile_image: string | null;
  };
  class: { id: string; name: string } | null;
  section: { id: string; name: string } | null;
  academic_year: { id: string; name: string } | null;
  parents: Array<{
    id: string;
    relation: string;
    first_name: string;
    last_name: string | null;
    phone_number: string;
    is_primary: boolean;
  }>;
}

// ─── Bonafide Certificate ─────────────────────────────────────────────────────

export interface BonafideCertificateListRow {
  id: string;
  reference_no: string;
  purpose: string;
  status: CertificateStatus;
  pdf_url: string | null;
  created_at: string;
  student_name: string;
  class_name: string | null;
  section_name: string | null;
  academic_year_name: string | null;
}

export interface BonafideCertificateDetail {
  id: string;
  school_id: string;
  student_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string | null;
  reference_no: string;
  purpose: string;
  pdf_url: string | null;
  pdf_s3_key: string | null;
  status: CertificateStatus;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  student: {
    id: string;
    first_name: string;
    last_name: string | null;
    date_of_birth: string | null;
    aadhaar_number: string | null;
    profile_image: string | null;
  };
  class: { id: string; name: string } | null;
  section: { id: string; name: string } | null;
  academic_year: { id: string; name: string } | null;
  parents: Array<{
    id: string;
    relation: string;
    first_name: string;
    last_name: string | null;
    phone_number: string;
    is_primary: boolean;
  }>;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface CertificateFilters {
  search?: string;
  academic_year_id?: string;
  class_id?: string;
  section_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateTransferCertificatePayload {
  student_id: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string;
  qualified_for_higher_class: string;
  leaving_date: string;
  total_working_days: number;
  total_present: number;
  extra_activities?: string;
  candidate_character: string;
  leaving_reason: string;
  fees_due: string;
}

export interface CreateBonafideCertificatePayload {
  student_id: string;
  academic_year_id: string;
  class_id: string;
  section_id?: string;
  purpose: string;
}