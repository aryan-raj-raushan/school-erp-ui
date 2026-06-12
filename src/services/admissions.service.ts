import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  AdmissionSource,
  AdmissionEnquiry,
  EnquiryHistory,
  AdmissionEnquiryFilters,
  AdmissionSourceFilters,
  EnquiryStatus,
} from '@/types/admissions.types';
import type { PaginationMeta } from '@/types';

// ---------- Sources ----------

export interface CreateAdmissionSourcePayload {
  name: string;
  start_date?: string;
  end_date?: string;
  is_enabled?: boolean;
}
export interface UpdateAdmissionSourcePayload extends Partial<CreateAdmissionSourcePayload> {}

// ---------- Enquiries ----------

export interface CreateAdmissionEnquiryPayload {
  academic_year_id: string;
  father_name?: string;
  mother_name?: string;
  phone: string;
  dial_code?: string;
  email?: string;
  father_occupation?: string;
  mother_occupation?: string;
  father_qualification?: string;
  mother_qualification?: string;
  city?: string;
  state?: string;
  country?: string;
  student_name: string;
  date_of_birth?: string;
  gender?: string;
  religion?: string;
  category?: string;
  student_current_address?: string;
  applying_academic_year_id: string;
  applying_class_id: string;
  previous_school_name?: string;
  previous_class?: string;
  registration_fee_required?: boolean;
  assigned_teacher_id?: string;
  next_followup_date?: string;
  next_followup_time?: string;
  enquiry_source_id?: string;
  remarks: string;
}
export interface UpdateAdmissionEnquiryPayload extends Partial<CreateAdmissionEnquiryPayload> {
  status?: EnquiryStatus;
}

// ---------- History ----------
export interface CreateEnquiryHistoryPayload {
  action: string;
  next_followup_date?: string;
  next_followup_time?: string;
  details?: string;
  remarks: string;
}

export const AdmissionSourcesService = {
  async list(filters: AdmissionSourceFilters = {}): Promise<{ items: AdmissionSource[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<AdmissionSource[]>(ENDPOINTS.admissionSources.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<AdmissionSource> {
    const res = await apiGateway.get<AdmissionSource>(ENDPOINTS.admissionSources.byId(id));
    return res.data;
  },

  async create(payload: CreateAdmissionSourcePayload): Promise<AdmissionSource> {
    const res = await apiGateway.post<AdmissionSource>(ENDPOINTS.admissionSources.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateAdmissionSourcePayload): Promise<AdmissionSource> {
    const res = await apiGateway.patch<AdmissionSource>(ENDPOINTS.admissionSources.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.admissionSources.byId(id));
  },
};

export const AdmissionEnquiriesService = {
  async list(filters: AdmissionEnquiryFilters = {}): Promise<{ items: AdmissionEnquiry[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<AdmissionEnquiry[]>(ENDPOINTS.admissionEnquiries.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<AdmissionEnquiry> {
    const res = await apiGateway.get<AdmissionEnquiry>(ENDPOINTS.admissionEnquiries.byId(id));
    return res.data;
  },

  async create(payload: CreateAdmissionEnquiryPayload): Promise<AdmissionEnquiry> {
    const res = await apiGateway.post<AdmissionEnquiry>(ENDPOINTS.admissionEnquiries.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateAdmissionEnquiryPayload): Promise<AdmissionEnquiry> {
    const res = await apiGateway.patch<AdmissionEnquiry>(ENDPOINTS.admissionEnquiries.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.admissionEnquiries.byId(id));
  },

  async getHistory(id: string): Promise<EnquiryHistory[]> {
    const res = await apiGateway.get<EnquiryHistory[]>(ENDPOINTS.admissionEnquiries.history(id));
    return res.data;
  },

  async addHistory(id: string, payload: CreateEnquiryHistoryPayload): Promise<EnquiryHistory> {
    const res = await apiGateway.post<EnquiryHistory>(ENDPOINTS.admissionEnquiries.history(id), payload);
    return res.data;
  },
};