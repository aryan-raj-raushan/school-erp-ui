import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { Staff, StaffRole, Gender, BloodGroup, StaffStatus, PaginationMeta, BulkImportJob } from '@/types';

export interface StaffFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: StaffStatus;
  role?: StaffRole;
  [key: string]: unknown;
}

export interface CreateStaffPayload {
  first_name: string;
  last_name?: string;
  dial_code: string;
  phone_number: string;
  email?: string;
  role: StaffRole;
  gender?: Gender;
  date_of_birth?: string;
  blood_group?: BloodGroup;
  address?: string;
  permanent_address?: string;
  city?: string;
  joining_date?: string;
  employee_code?: string;
  custom_role_id?: string;
  father_name?: string;
  husband_name?: string;
  reporting_to_id?: string;
  rfid_card_number?: string;
  qualification?: string;
  previous_employer?: string;
  previous_role?: string;
  total_experience?: string;
  profile_image?: string;
  password?: string;
  is_active?: boolean;
}

export interface UpdateStaffPayload {
  first_name?: string;
  last_name?: string;
  dial_code?: string;
  phone_number?: string;
  email?: string;
  gender?: Gender;
  date_of_birth?: string;
  blood_group?: BloodGroup;
  address?: string;
  permanent_address?: string;
  city?: string;
  joining_date?: string;
  employee_code?: string;
  custom_role_id?: string;
  father_name?: string;
  husband_name?: string;
  reporting_to_id?: string;
  rfid_card_number?: string;
  qualification?: string;
  previous_employer?: string;
  previous_role?: string;
  total_experience?: string;
  profile_image?: string;
}

export interface OffboardPayload {
  reason?: string;
  offboard_date?: string;
}

export const StaffService = {
  async list(filters: StaffFilters = {}): Promise<{ items: Staff[]; pagination: PaginationMeta }> {
    const { status, ...rest } = filters;
    const params: Record<string, unknown> = { ...rest };
    if (status === 'ACTIVE') params.is_active = true;
    else if (status === 'OFFBOARDED' || status === 'INACTIVE') params.is_active = false;
    const res = await apiGateway.get<Staff[]>(ENDPOINTS.staff.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<Staff> {
    const res = await apiGateway.get<Staff>(ENDPOINTS.staff.byId(id));
    return res.data;
  },

  async create(payload: CreateStaffPayload): Promise<{ staff: Staff; inviteToken: string }> {
    const res = await apiGateway.post<{ staff: Staff; inviteToken: string }>(ENDPOINTS.staff.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateStaffPayload): Promise<Staff> {
    const res = await apiGateway.put<Staff>(ENDPOINTS.staff.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.staff.byId(id));
  },

  async offboard(id: string, payload?: OffboardPayload): Promise<Staff> {
    const res = await apiGateway.patch<Staff>(ENDPOINTS.staff.offboard(id), payload ?? {});
    return res.data;
  },

  async reonboard(id: string): Promise<Staff> {
    const res = await apiGateway.patch<Staff>(ENDPOINTS.staff.reonboard(id), {});
    return res.data;
  },

  async downloadBulkTemplate(): Promise<Blob> {
    const res = await apiGateway.axiosInstance.get(ENDPOINTS.staff.bulkTemplate, {
      responseType: 'blob',
    });
    return res.data;
  },

  async bulkImport(formData: FormData): Promise<{ jobId: string }> {
    const res = await apiGateway.upload<{ jobId: string }>(ENDPOINTS.staff.bulkImport, formData);
    return res.data;
  },

  async getBulkStatus(jobId: string): Promise<BulkImportJob> {
    const res = await apiGateway.get<BulkImportJob>(ENDPOINTS.staff.bulkStatus(jobId));
    return res.data;
  },

  async resendInvite(userId: string): Promise<void> {
    await apiGateway.post(ENDPOINTS.invite.resend(userId), {});
  },

  async uploadProfileImage(file: File, staffId: string): Promise<{ url: string; s3Key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reference_id', staffId);
    formData.append('reference_type', 'staff');
    formData.append('document_type', 'profile_image');
    const res = await apiGateway.upload<{ url: string; s3Key: string }>(ENDPOINTS.uploads.image, formData);
    return res.data;
  },
};
