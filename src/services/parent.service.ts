import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { SchoolParent, PaginationMeta, BulkImportJob, Student } from '@/types';

export interface ParentFilters {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

export interface CreateParentPayload {
  first_name: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  dial_code?: string;
  occupation?: string;
}

export interface UpdateParentPayload extends Partial<CreateParentPayload> {}

export const ParentService = {
  async list(filters: ParentFilters = {}): Promise<{ items: SchoolParent[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<SchoolParent[]>(ENDPOINTS.parent.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<SchoolParent> {
    const res = await apiGateway.get<SchoolParent>(ENDPOINTS.parent.byId(id));
    return res.data;
  },

  async create(payload: CreateParentPayload): Promise<SchoolParent> {
    const res = await apiGateway.post<SchoolParent>(ENDPOINTS.parent.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateParentPayload): Promise<SchoolParent> {
    const res = await apiGateway.put<SchoolParent>(ENDPOINTS.parent.byId(id), payload);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.parent.byId(id));
  },

  async getStudentDetail(parentId: string): Promise<Student> {
    const res = await apiGateway.get<Student>(ENDPOINTS.parent.studentDetail(parentId));
    return res.data;
  },

  async linkStudent(parentId: string, studentId: string): Promise<void> {
    await apiGateway.post(ENDPOINTS.parent.linkStudent(parentId, studentId), {});
  },

  async downloadBulkTemplate(): Promise<Blob> {
    const res = await apiGateway.axiosInstance.get(ENDPOINTS.parent.bulkTemplate, {
      responseType: 'blob',
    });
    return res.data;
  },

  async bulkImport(formData: FormData): Promise<{ jobId: string }> {
    const res = await apiGateway.upload<{ jobId: string }>(ENDPOINTS.parent.bulkImport, formData);
    return res.data;
  },

  async getBulkStatus(jobId: string): Promise<BulkImportJob> {
    const res = await apiGateway.get<BulkImportJob>(ENDPOINTS.parent.bulkStatus(jobId));
    return res.data;
  },
};
