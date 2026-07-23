'use client';

import { useEffect, useMemo, useCallback, Suspense } from 'react';
import { useAuditLog, type AuditLogFilterState } from '@/hooks/useAuditLog';
import { useStorageFilter } from '@/hooks/useStorageFilter';
import { STORAGE_FILTER_KEYS } from '@/constants/storage-filter-keys.constants';
import {
  PageCol,
  PageHeader,
  FilterToolbar,
  type FilterField,
  Div,
  Badge,
  DataTable,
  Spinner,
  P,
  DatePicker,
  type ColumnDef,
  type BadgeVariant,
} from '@/components/ui';
import type { AuditLogRecord, AuditEntity, AuditAction } from '@/types';

const ENTITY_OPTIONS: AuditEntity[] = ['ATTENDANCE', 'LEAVE', 'HOLIDAY', 'TIMING', 'SETTINGS', 'GATE_PASS', 'EARLY_EXIT', 'USER'];
const ACTION_OPTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE'];

const ACTION_BADGE: Record<AuditAction, BadgeVariant> = {
  CREATE: 'success',
  UPDATE: 'warning',
  DELETE: 'danger',
};

type PersistedAuditLogFilters = Pick<AuditLogFilterState, 'entity' | 'action' | 'from' | 'to'>;

function AuditLogContent() {
  const {
    items,
    total,
    isLoading,
    filters,
    updateFilters,
    fetch,
  } = useAuditLog();

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedAuditLogFilters>({
    key: STORAGE_FILTER_KEYS.AUDIT_LOG,
    defaultValue: {},
  });

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) {
      updateFilters(storedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const handleFilterChange = useCallback((next: Partial<AuditLogFilterState>) => {
    updateFilters(next);

    const persisted: Partial<PersistedAuditLogFilters> = {};
    (['entity', 'action', 'from', 'to'] as const).forEach((field) => {
      if (field in next) persisted[field] = next[field] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }, [updateFilters, persistFilters]);

  const handleClearFilters = useCallback(() => {
    handleFilterChange({
      entity: undefined,
      action: undefined,
      from: undefined,
      to: undefined,
    });
    clearStoredFilters();
  }, [handleFilterChange, clearStoredFilters]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: 'select',
        key: 'entity',
        label: 'Entity',
        placeholder: 'All Entities',
        options: ENTITY_OPTIONS.map((e) => ({ value: e, label: e })),
      },
      {
        type: 'select',
        key: 'action',
        label: 'Action',
        placeholder: 'All Actions',
        options: ACTION_OPTIONS.map((a) => ({ value: a, label: a })),
      },
      {
        type: 'custom',
        key: 'from',
        label: 'From',
        chipLabel: filters.from,
        render: () => (
          <DatePicker
            value={filters.from}
            onChange={(val) => handleFilterChange({ from: val })}
            size="compact"
            placeholder="From date"
            className="w-36"
          />
        ),
      },
      {
        type: 'custom',
        key: 'to',
        label: 'To',
        chipLabel: filters.to,
        render: () => (
          <DatePicker
            value={filters.to}
            onChange={(val) => handleFilterChange({ to: val })}
            size="compact"
            placeholder="To date"
            className="w-36"
          />
        ),
      },
    ],
    [filters.from, filters.to, handleFilterChange],
  );

  const filterValues: Record<string, string | undefined> = {
    entity: filters.entity,
    action: filters.action,
    from: filters.from,
    to: filters.to,
  };

  const columns: ColumnDef<AuditLogRecord>[] = [
    { header: 'Time', accessorKey: 'created_at' },
    { header: 'Entity', accessorKey: 'entity' },
    { header: 'Entity ID', accessorKey: 'entity_id', cell: ({ row }) => <span>{row.original.entity_id.slice(0, 8)}…</span> },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ row }) => (
        <Badge variant={ACTION_BADGE[row.original.action] ?? 'default'}>{row.original.action}</Badge>
      ),
    },
    { header: 'Changed By', accessorKey: 'changed_by' },
    { header: 'IP', accessorKey: 'ip_address' },
    {
      header: 'Changes',
      id: 'changes',
      cell: ({ row }) => (
        <Div type="col" gap="xs">
          {row.original.old_value && (
            <P>Old: {JSON.stringify(row.original.old_value).slice(0, 60)}</P>
          )}
          {row.original.new_value && (
            <P>New: {JSON.stringify(row.original.new_value).slice(0, 60)}</P>
          )}
        </Div>
      ),
    },
  ];

  return (
    <PageCol>
      <PageHeader title="Audit Log" subtitle={`${total} total records`} />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={(next) => handleFilterChange(next as Partial<AuditLogFilterState>)}
        onClear={handleClearFilters}
        sheetTitle="Filter Audit Log"
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <DataTable columns={columns} data={items} />
      )}
    </PageCol>
  );
}

export default function AuditLogPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <AuditLogContent />
    </Suspense>
  );
}
