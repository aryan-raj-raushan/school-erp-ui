'use client';

import { useEffect } from 'react';
import { useAuditLog } from '@/hooks/useAuditLog';
import {
  PageCol,
  PageHeader,
  FilterBar,
  Div,
  Button,
  Input,
  Select,
  Badge,
  DataTable,
  FilterLabel,
  Spinner,
  P,
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

export default function AuditLogPage() {
  const {
    items, total, isLoading, page, setPage,
    entity, setEntity, action, setAction,
    from, setFrom, to, setTo, fetch,
  } = useAuditLog();

  useEffect(() => { fetch(); }, [fetch]);

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

      <FilterBar>
        <FilterLabel>Entity</FilterLabel>
        <Select value={entity} onChange={e => setEntity(e.target.value as AuditEntity | '')}>
          <option value="">All Entities</option>
          {ENTITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
        </Select>

        <FilterLabel>Action</FilterLabel>
        <Select value={action} onChange={e => setAction(e.target.value as AuditAction | '')}>
          <option value="">All Actions</option>
          {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </Select>

        <FilterLabel>From</FilterLabel>
        <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <FilterLabel>To</FilterLabel>
        <Input type="date" value={to} onChange={e => setTo(e.target.value)} />

        <Button variant="outline" onClick={fetch}>Search</Button>
      </FilterBar>

      {isLoading ? (
        <Spinner />
      ) : (
        <DataTable columns={columns} data={items} />
      )}

      <Div type="row" gap="md" align="center">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
        <P>Page {page}</P>
        <Button variant="outline" onClick={() => setPage(p => p + 1)}>Next</Button>
      </Div>
    </PageCol>
  );
}
