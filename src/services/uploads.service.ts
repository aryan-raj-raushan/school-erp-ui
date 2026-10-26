import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { UploadResult } from '@/types';

export interface UploadMeta {
  reference_id: string;
  reference_type: string;
  document_type: string;
}

export const MAX_UPLOAD_MB = 10;
const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const STORAGE_KEY_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/(images|documents)\/[^?#]+/i;

export function documentFileError(file: File): string | null {
  if (!DOCUMENT_TYPES.includes(file.type)) {
    return `"${file.name}" is not supported. Please upload a PDF, JPG or PNG file.`;
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `"${file.name}" is ${sizeMb} MB. Maximum allowed size is ${MAX_UPLOAD_MB} MB.`;
  }
  return null;
}

export function storageKeyFromLink(link: string): string | null {
  return link.match(STORAGE_KEY_PATTERN)?.[0] ?? null;
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

  async fetchFile(link: string): Promise<Blob> {
    const key = storageKeyFromLink(link);
    if (!key) throw new Error('This file is not available for preview');
    const res = await apiGateway.axiosInstance.get(ENDPOINTS.uploads.file, {
      params: { key },
      responseType: 'blob',
    });
    return res.data;
  },

  async deleteFile(s3Key: string): Promise<void> {
    await apiGateway.post(ENDPOINTS.uploads.delete, { s3Key });
  },
};
