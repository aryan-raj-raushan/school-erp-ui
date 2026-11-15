import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type {
  BulkEntity,
  ImportJob,
  ValidationReport,
  WorkbookJob,
  WorkbookReport,
} from '@/types/bulk-import.types';

const UPLOAD_TIMEOUT_MS = 120_000;
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function fileForm(file: File, fields: Record<string, string> = {}): FormData {
  const form = new FormData();
  form.append('file', file);
  Object.entries(fields).forEach(([key, value]) => form.append(key, value));
  return form;
}

function toBlob(data: unknown): Blob {
  return data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: XLSX_TYPE });
}

export const BulkImportService = {
  async downloadTemplate(entity: BulkEntity): Promise<Blob> {
    const res = await apiGateway.axiosInstance.get(ENDPOINTS.bulkImport.template(entity), {
      responseType: 'arraybuffer',
      timeout: UPLOAD_TIMEOUT_MS,
    });
    return toBlob(res.data);
  },

  async validate(entity: BulkEntity, file: File): Promise<ValidationReport> {
    const res = await apiGateway.upload<ValidationReport>(
      ENDPOINTS.bulkImport.validate(entity),
      fileForm(file),
      { timeout: UPLOAD_TIMEOUT_MS },
    );
    return res.data;
  },

  async downloadReport(entity: BulkEntity, file: File, errorsOnly: boolean): Promise<Blob> {
    const res = await apiGateway.axiosInstance.post(ENDPOINTS.bulkImport.report(entity), fileForm(file), {
      params: { errors_only: errorsOnly },
      responseType: 'arraybuffer',
      timeout: UPLOAD_TIMEOUT_MS,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toBlob(res.data);
  },

  async startImport(entity: BulkEntity, file: File, skipErrors: boolean): Promise<ImportJob> {
    const res = await apiGateway.upload<ImportJob>(
      ENDPOINTS.bulkImport.commit(entity),
      fileForm(file, { skip_errors: String(skipErrors) }),
      { timeout: UPLOAD_TIMEOUT_MS },
    );
    return res.data;
  },

  async getJob(entity: BulkEntity, jobId: string): Promise<ImportJob> {
    const res = await apiGateway.get<ImportJob>(ENDPOINTS.bulkImport.job(entity, jobId));
    return res.data;
  },
};

export const WorkbookImportService = {
  async downloadTemplate(): Promise<Blob> {
    const res = await apiGateway.axiosInstance.get(ENDPOINTS.bulkImport.workbook.template, {
      responseType: 'arraybuffer',
      timeout: UPLOAD_TIMEOUT_MS,
    });
    return toBlob(res.data);
  },

  async validate(file: File): Promise<WorkbookReport> {
    const res = await apiGateway.upload<WorkbookReport>(
      ENDPOINTS.bulkImport.workbook.validate,
      fileForm(file),
      { timeout: UPLOAD_TIMEOUT_MS },
    );
    return res.data;
  },

  async downloadReport(file: File, errorsOnly: boolean): Promise<Blob> {
    const res = await apiGateway.axiosInstance.post(ENDPOINTS.bulkImport.workbook.report, fileForm(file), {
      params: { errors_only: errorsOnly },
      responseType: 'arraybuffer',
      timeout: UPLOAD_TIMEOUT_MS,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return toBlob(res.data);
  },

  async startImport(file: File, skipErrors: boolean): Promise<WorkbookJob> {
    const res = await apiGateway.upload<WorkbookJob>(
      ENDPOINTS.bulkImport.workbook.commit,
      fileForm(file, { skip_errors: String(skipErrors) }),
      { timeout: UPLOAD_TIMEOUT_MS },
    );
    return res.data;
  },

  async getJob(jobId: string): Promise<WorkbookJob> {
    const res = await apiGateway.get<WorkbookJob>(ENDPOINTS.bulkImport.workbook.job(jobId));
    return res.data;
  },
};
