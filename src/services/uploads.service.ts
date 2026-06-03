import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { UploadResult } from '@/types';

export const UploadsService = {
  async uploadImage(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiGateway.upload<UploadResult>(ENDPOINTS.uploads.image, formData);
    return res.data;
  },

  async uploadDocument(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiGateway.upload<UploadResult>(ENDPOINTS.uploads.document, formData);
    return res.data;
  },

  async deleteFile(s3Key: string): Promise<void> {
    await apiGateway.post(ENDPOINTS.uploads.delete, { s3Key });
  },
};
