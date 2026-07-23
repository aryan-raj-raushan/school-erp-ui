'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AuditLogService, type AuditLogFilters } from '@/services/audit-log.service';
import type { AuditLogRecord, AuditEntity, AuditAction } from '@/types';

export interface AuditLogFilterState {
  entity?: AuditEntity | '';
  action?: AuditAction | '';
  from?: string;
  to?: string;
  page?: number;
}

export function useAuditLog() {
  const [items, setItems] = useState<AuditLogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilterState>({ page: 1 });

  const updateFilters = useCallback((next: Partial<AuditLogFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const apiFilters: AuditLogFilters = {
      page: filters.page ?? 1,
      limit: 50,
      ...(filters.entity && { entity: filters.entity as AuditEntity }),
      ...(filters.action && { action: filters.action as AuditAction }),
      ...(filters.from && { from: filters.from }),
      ...(filters.to && { to: filters.to }),
    };
    try {
      const data = await AuditLogService.list(apiFilters);
      setItems(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  return {
    items,
    total,
    isLoading,
    filters,
    updateFilters,
    fetch,
  };
}
