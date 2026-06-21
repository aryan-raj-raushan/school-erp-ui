import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import type {
  StudentListItem,
  StudentFull,
  StudentFilters,
  StudentIdCardData,
  PickupCardData,
  StudentDocument,
} from '@/types/students.types';
import type { PaginationMeta } from '@/types';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

// ─── Payload Types ─────────────────────────────────────────────────────────────

export interface StudentAcademicInfoPayload {
  academic_year_id: string;
  class_id: string;
  section_id?: string;
  admission_number: string;
  registration_number?: string;
  roll_number?: string;
  joining_date?: string;
}

export interface StudentPreviousAcademicsPayload {
  previous_school_name?: string;
  previous_class?: string;
  passing_year?: string;
  total_marks?: string;
  grade?: string;
  board?: string;
  tc_number?: string;
}

export interface StudentAddressPayload {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface StudentHostelInfoPayload {
  hostel_required?: boolean;
  hostel_name?: string;
  room_number?: string;
}

export interface StudentParentPayload {
  relation: string;
  first_name: string;
  last_name?: string;
  email?: string;
  dial_code?: string;
  phone_number: string;
  alternate_phone?: string;
  occupation?: string;
  qualification?: string;
  annual_income?: string;
  aadhaar_number?: string;
  profile_image?: string;
  is_primary?: boolean;
  can_pickup?: boolean;
}

export interface StudentDocumentPayload {
  document_name: string;
  file_type: string;
  document_link: string;
  original_filename?: string;
  remarks?: string;
}

export interface CreateStudentPayload {
  first_name: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  religion?: string;
  category?: string;
  caste?: string;
  nationality?: string;
  aadhaar_number?: string;
  id_card_number?: string;
  height_cm?: string;
  weight_kg?: string;
  profile_image?: string;
  dial_code?: string;
  phone_number?: string;
  email?: string;
  status?: string;
  is_enabled?: boolean;
  academic_info?: StudentAcademicInfoPayload;
  previous_academics?: StudentPreviousAcademicsPayload;
  address?: StudentAddressPayload;
  hostel_info?: StudentHostelInfoPayload;
  parents?: StudentParentPayload[];
  documents?: StudentDocumentPayload[];
}

export type UpdateStudentPayload = Partial<CreateStudentPayload>;



// ─── Service ───────────────────────────────────────────────────────────────────

export const StudentsService = {
  async list(filters: StudentFilters = {}): Promise<{ items: StudentListItem[]; pagination: PaginationMeta }> {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params[k] = String(v);
    });
    const res = await apiGateway.get<StudentListItem[]>(ENDPOINTS.student.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<StudentFull> {
    const res = await apiGateway.get<StudentFull>(ENDPOINTS.student.byId(id));
    return res.data;
  },

  async create(payload: CreateStudentPayload): Promise<StudentFull> {
    const res = await apiGateway.post<StudentFull>(ENDPOINTS.student.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateStudentPayload): Promise<StudentFull> {
    const res = await apiGateway.put<StudentFull>(ENDPOINTS.student.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.student.byId(id));
  },

  async enable(id: string): Promise<StudentFull> {
    const res = await apiGateway.patch<StudentFull>(ENDPOINTS.student.enable(id));
    return res.data;
  },

  async disable(id: string): Promise<StudentFull> {
    const res = await apiGateway.patch<StudentFull>(ENDPOINTS.student.disable(id));
    return res.data;
  },

  async addDocuments(id: string, documents: StudentDocumentPayload[]): Promise<StudentDocument[]> {
    const res = await apiGateway.post<StudentDocument[]>(ENDPOINTS.student.documents(id), { documents });
    return res.data;
  },

  async deleteDocument(studentId: string, docId: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.student.document(studentId, docId));
  },

  async getIdCardData(id: string): Promise<StudentIdCardData> {
    const res = await apiGateway.get<StudentIdCardData>(ENDPOINTS.student.idCard(id));
    return res.data;
  },

  async getPickupCardData(id: string): Promise<PickupCardData> {
    const res = await apiGateway.get<PickupCardData>(ENDPOINTS.student.pickupCard(id));
    return res.data;
  },

  async uploadProfileImage(file: File, studentId: string): Promise<{ url: string; s3Key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reference_id', studentId);
    formData.append('reference_type', 'student');
    formData.append('document_type', 'profile_image');
    const res = await apiGateway.upload<{ url: string; s3Key: string }>(ENDPOINTS.uploads.image, formData);
    return res.data;
  },
};

