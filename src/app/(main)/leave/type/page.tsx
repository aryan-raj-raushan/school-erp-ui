'use client';

import { Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useLeaveTypes } from '@/hooks/leave/useLeaveTypes';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div,
  P,
  Button,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  PageCol,
  FilterBar,
  ResponsiveSelect,
} from '@/components/ui';
import {
  LEAVE_TYPE_PAGE,
  LEAVE_VALIDITY_OPTIONS,
  LEAVE_PAY_TYPE_OPTIONS,
  LEAVE_VALIDITY_LABEL,
  LEAVE_PAY_TYPE_LABEL,
} from '@/constants/emp-leave.constants';
import type { LeaveTypeFilters, LeaveType } from '@/types/leave.types';

function LeaveTypeContent() {
  const router = useRouter();

  const { leaveTypes, pagination, filters, isLoading, updateFilters, deleteLeaveType } =
    useLeaveTypes({ is_enabled: undefined });

  function handleFilterChange(next: Partial<LeaveTypeFilters>) {
    updateFilters(next);
  }

  const columns = useMemo<ColumnDef<LeaveType>[]>(
    () => [
      {
        id: 'index',
        header: LEAVE_TYPE_PAGE.table.sno,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: 'leave_name',
        header: LEAVE_TYPE_PAGE.table.leaveName,
        meta: { primary: true },
      },
      {
        accessorKey: 'leave_validity',
        header: LEAVE_TYPE_PAGE.table.validity,
        cell: ({ row }) => (
          <Badge variant="secondary">
            {LEAVE_VALIDITY_LABEL[row.original.leave_validity]}
          </Badge>
        ),
      },
      {
        accessorKey: 'leave_pay_type',
        header: LEAVE_TYPE_PAGE.table.payType,
        cell: ({ row }) => (
          <Badge
            variant={row.original.leave_pay_type === 'PAID' ? 'success' : 'warning'}
          >
            {LEAVE_PAY_TYPE_LABEL[row.original.leave_pay_type]}
          </Badge>
        ),
      },
      {
        accessorKey: 'leave_count_days',
        header: LEAVE_TYPE_PAGE.table.days,
        cell: ({ row }) => (
          <P className="font-medium">{row.original.leave_count_days} days</P>
        ),
      },
      {
        accessorKey: 'is_enabled',
        header: LEAVE_TYPE_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? 'success' : 'secondary'}>
            {row.original.is_enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: LEAVE_TYPE_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="sm">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                router.push(`/leave/type/view?id=${row.original.id}`)
              }
              title={LEAVE_TYPE_PAGE.buttons.edit}
            >
              <Eye size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                router.push(`/leave/type/view?id=${row.original.id}&edit=true`)
              }
              title={LEAVE_TYPE_PAGE.buttons.edit}
            >
              <Pencil size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="destructive"
              onClick={() => deleteLeaveType(row.original.id)}
              title={LEAVE_TYPE_PAGE.buttons.delete}
            >
              <Trash2 size={14} />
            </Button>
          </Div>
        ),
      },
    ],
    [router, deleteLeaveType],
  );

  return (
    <PageCol>
      <PageHeader
        title={LEAVE_TYPE_PAGE.pageHeading.title}
        subtitle={pagination ? `${pagination.total} leave types` : ''}
        actions={
          <Button onClick={() => router.push('/leave/type/create-new')}>
            <Plus size={16} />
            {LEAVE_TYPE_PAGE.buttons.addLeaveType}
          </Button>
        }
      />

      <FilterBar>
        <ResponsiveSelect
          value={filters.leave_validity ?? ''}
          onChange={(e) =>
            handleFilterChange({
              leave_validity: (e.target.value as any) || undefined,
            })
          }
          customPlaceholder={LEAVE_VALIDITY_OPTIONS.find((o) => o.value === '')?.label}
          options={LEAVE_VALIDITY_OPTIONS.filter((o) => o.value !== '').map((o) => ({ value: o.value, label: o.label }))}
        />

        <ResponsiveSelect
          value={filters.leave_pay_type ?? ''}
          onChange={(e) =>
            handleFilterChange({
              leave_pay_type: (e.target.value as any) || undefined,
            })
          }
          customPlaceholder={LEAVE_PAY_TYPE_OPTIONS.find((o) => o.value === '')?.label}
          options={LEAVE_PAY_TYPE_OPTIONS.filter((o) => o.value !== '').map((o) => ({ value: o.value, label: o.label }))}
        />

        <ResponsiveSelect
          value={
            filters.is_enabled === undefined ? '' : String(filters.is_enabled)
          }
          onChange={(e) =>
            handleFilterChange({
              is_enabled:
                e.target.value === '' ? undefined : e.target.value === 'true',
            })
          }
          customPlaceholder="All Status"
          options={[
            { value: 'true', label: 'Enabled' },
            { value: 'false', label: 'Disabled' },
          ]}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={leaveTypes}
        isLoading={isLoading}
        emptyText={LEAVE_TYPE_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
      />
    </PageCol>
  );
}

export default function LeaveTypePage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <LeaveTypeContent />
    </Suspense>
  );
}