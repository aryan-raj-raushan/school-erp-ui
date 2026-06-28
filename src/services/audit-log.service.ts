import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { AuditLogRecord, AuditEntity, AuditAction } from '@/types';

export interface AuditLogFilters {
  entity?: AuditEntity;
  action?: AuditAction;
  changed_by?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const AuditLogService = {
  async list(filters: AuditLogFilters = {}): Promise<{ items: AuditLogRecord[]; total: number }> {
    const res = await apiGateway.get<{ items: AuditLogRecord[]; total: number }>(
      ENDPOINTS.auditLogs.base,
      { params: filters },
    );
    return res.data;
  },
};
