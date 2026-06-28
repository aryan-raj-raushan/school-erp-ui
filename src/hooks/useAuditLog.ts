'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AuditLogService, type AuditLogFilters } from '@/services/audit-log.service';
import type { AuditLogRecord, AuditEntity, AuditAction } from '@/types';

export function useAuditLog() {
  const [items, setItems] = useState<AuditLogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState<AuditEntity | ''>('');
  const [action, setAction] = useState<AuditAction | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const filters: AuditLogFilters = {
      page,
      limit: 50,
      ...(entity && { entity }),
      ...(action && { action }),
      ...(from && { from }),
      ...(to && { to }),
    };
    try {
      const data = await AuditLogService.list(filters);
      setItems(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  }, [page, entity, action, from, to]);

  return {
    items, total, isLoading, page, setPage,
    entity, setEntity, action, setAction,
    from, setFrom, to, setTo,
    fetch,
  };
}
