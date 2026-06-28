'use client';

import { useLeaveBalance } from '@/hooks/useLeaveBalance';
import {
  PageCol,
  PageHeader,
  Div,
  P,
  Badge,
  Spinner,
  DataTable,
  Input,
  FilterBar,
  FilterLabel,
  EmptyState,
  type ColumnDef,
} from '@/components/ui';
import type { LeaveBalance } from '@/types';

export default function LeaveBalancePage() {
  const { balances, isLoading, academicYearId, setAcademicYearId, load } = useLeaveBalance();

  const columns: ColumnDef<LeaveBalance>[] = [
    { header: 'Staff ID', accessorKey: 'staff_id', cell: ({ row }) => <span>{row.original.staff_id.slice(0, 8)}…</span> },
    { header: 'Leave Type', accessorKey: 'leave_type_id', cell: ({ row }) => <span>{row.original.leave_type?.name ?? row.original.leave_type_id.slice(0, 8)}</span> },
    { header: 'Allocated', accessorKey: 'allocated' },
    { header: 'Used', accessorKey: 'used' },
    {
      header: 'Available',
      id: 'available',
      cell: ({ row }) => {
        const available = (row.original.allocated + row.original.carried_forward) - row.original.used;
        return <P color={available < 0 ? 'danger' : 'default'}>{available}</P>;
      },
    },
    { header: 'Carried Forward', accessorKey: 'carried_forward' },
    {
      header: 'Expires',
      accessorKey: 'expires_at',
      cell: ({ row }) => row.original.expires_at ? <P>{row.original.expires_at}</P> : <P color="muted">—</P>,
    },
    {
      header: 'LWP Allowed',
      accessorKey: 'can_go_negative',
      cell: ({ row }) => (
        <Badge variant={row.original.can_go_negative ? 'warning' : 'default'}>
          {row.original.can_go_negative ? 'Yes' : 'No'}
        </Badge>
      ),
    },
  ];

  return (
    <PageCol>
      <PageHeader title="Leave Balances" subtitle="Staff leave balance summary with carry-forward and expiry" />

      <FilterBar>
        <FilterLabel>Academic Year ID</FilterLabel>
        <Input
          value={academicYearId}
          onChange={(e) => setAcademicYearId(e.target.value)}
          placeholder="Paste academic year ID"
        />
      </FilterBar>

      {!academicYearId ? (
        <EmptyState title="Select academic year" description="Enter an academic year ID above to load balances" />
      ) : isLoading ? (
        <Div type="row" justify="center" padding="p-12">
          <Spinner />
        </Div>
      ) : balances.length === 0 ? (
        <EmptyState title="No balances found" description="No leave balances provisioned for this academic year" action={{ label: 'Reload', onClick: load }} />
      ) : (
        <DataTable columns={columns} data={balances} isLoading={isLoading} />
      )}
    </PageCol>
  );
}
