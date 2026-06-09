import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { UploadResult } from '@/types';

export interface UploadMeta {
  reference_id: string;
  reference_type: string;
  document_type: string;
}

export const UploadsService = {
  async uploadImage(file: File, meta: UploadMeta): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reference_id', meta.reference_id);
    formData.append('reference_type', meta.reference_type);
    formData.append('document_type', meta.document_type);
    const res = await apiGateway.upload<UploadResult>(ENDPOINTS.uploads.image, formData);
    return res.data;
  },

  async uploadDocument(file: File, meta: UploadMeta): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reference_id', meta.reference_id);
    formData.append('reference_type', meta.reference_type);
    formData.append('document_type', meta.document_type);
    const res = await apiGateway.upload<UploadResult>(ENDPOINTS.uploads.document, formData);
    return res.data;
  },

  async deleteFile(s3Key: string): Promise<void> {
    await apiGateway.post(ENDPOINTS.uploads.delete, { s3Key });
  },
};
