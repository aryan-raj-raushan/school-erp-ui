'use client';

import { useEffect } from 'react';
import { useConflicts } from '@/hooks/useConflicts';
import {
  PageCol,
  PageHeader,
  FilterBar,
  Div,
  Button,
  Input,
  Badge,
  DataTable,
  FilterLabel,
  Spinner,
  EmptyState,
  type ColumnDef,
} from '@/components/ui';
import type { AttendanceConflict } from '@/types';

export default function ConflictsPage() {
  const { conflicts, isLoading, date, setDate, fetch, resolve, resolvingId } = useConflicts();

  useEffect(() => { fetch(); }, [fetch]);

  const columns: ColumnDef<AttendanceConflict>[] = [
    { header: 'Student', accessorKey: 'student_id' },
    { header: 'Date', accessorKey: 'date' },
    {
      header: 'RFID',
      id: 'rfid',
      cell: ({ row }) => (
        <Div type="col" gap="xs">
          <Badge variant="info">{row.original.rfid_status}</Badge>
          <span>{row.original.rfid_tap_time ?? '—'}</span>
        </Div>
      ),
    },
    {
      header: 'Manual',
      id: 'manual',
      cell: ({ row }) => (
        <Div type="col" gap="xs">
          <Badge variant="warning">{row.original.manual_status}</Badge>
          <span>{row.original.manual_marked_at ?? '—'}</span>
        </Div>
      ),
    },
    {
      header: 'Resolution',
      id: 'resolution',
      cell: ({ row }) => (
        <Div type="row" gap="sm">
          <Button
            size="sm"
            variant="outline"
            loading={resolvingId === row.original.id}
            onClick={() => resolve(row.original.id, 'RFID_WON')}
          >
            RFID Wins
          </Button>
          <Button
            size="sm"
            variant="outline"
            loading={resolvingId === row.original.id}
            onClick={() => resolve(row.original.id, 'MANUAL_WON')}
          >
            Manual Wins
          </Button>
          <Button
            size="sm"
            loading={resolvingId === row.original.id}
            onClick={() => resolve(row.original.id, 'ADMIN_SET')}
          >
            Admin Override
          </Button>
        </Div>
      ),
    },
  ];

  return (
    <PageCol>
      <PageHeader title="Attendance Conflicts" subtitle="Resolve discrepancies between RFID and manual records" />

      <FilterBar>
        <FilterLabel>Date</FilterLabel>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Button variant="outline" onClick={fetch}>Refresh</Button>
      </FilterBar>

      {isLoading ? (
        <Spinner />
      ) : conflicts.length === 0 ? (
        <EmptyState title="No conflicts" description="No unresolved conflicts for this date." />
      ) : (
        <DataTable columns={columns} data={conflicts} />
      )}
    </PageCol>
  );
}
