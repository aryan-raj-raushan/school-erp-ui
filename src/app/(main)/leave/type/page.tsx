'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useLeaveTypes } from '@/hooks/leave/useLeaveTypes';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div,
  P,
  Button,
  Select,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  TablePagination,
  Badge,
  Spinner,
} from '@/components/ui';
import {
  LEAVE_TYPE_PAGE,
  LEAVE_VALIDITY_OPTIONS,
  LEAVE_PAY_TYPE_OPTIONS,
  LEAVE_VALIDITY_LABEL,
  LEAVE_PAY_TYPE_LABEL,
} from '@/constants/emp-leave.constants';
import type { LeaveTypeFilters } from '@/types/leave.types';

function LeaveTypeContent() {
  const router = useRouter();

  const { leaveTypes, pagination, filters, isLoading, updateFilters, deleteLeaveType } =
    useLeaveTypes({ is_enabled: undefined });

  function handleFilterChange(next: Partial<LeaveTypeFilters>) {
    updateFilters(next);
  }

  return (
    <Div type="col" gap="lg">
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

      {/* Filters */}
      <Div type="row" gap="md" align="center" wrap>
        <Select
          width="sm"
          value={filters.leave_validity ?? ''}
          onChange={(e) =>
            handleFilterChange({
              leave_validity: (e.target.value as any) || undefined,
            })
          }
        >
          {LEAVE_VALIDITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.leave_pay_type ?? ''}
          onChange={(e) =>
            handleFilterChange({
              leave_pay_type: (e.target.value as any) || undefined,
            })
          }
        >
          {LEAVE_PAY_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={
            filters.is_enabled === undefined ? '' : String(filters.is_enabled)
          }
          onChange={(e) =>
            handleFilterChange({
              is_enabled:
                e.target.value === '' ? undefined : e.target.value === 'true',
            })
          }
        >
          <option value="">All Status</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </Select>
      </Div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{LEAVE_TYPE_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_TYPE_PAGE.table.leaveName}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_TYPE_PAGE.table.validity}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_TYPE_PAGE.table.payType}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_TYPE_PAGE.table.days}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_TYPE_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_TYPE_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={7}>
              <Spinner />
            </TableEmptyRow>
          ) : leaveTypes.length === 0 ? (
            <TableEmptyRow colSpan={7}>
              {LEAVE_TYPE_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            leaveTypes.map((lt, i) => (
              <TableRow key={lt.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{lt.leave_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {LEAVE_VALIDITY_LABEL[lt.leave_validity]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={lt.leave_pay_type === 'PAID' ? 'success' : 'warning'}
                  >
                    {LEAVE_PAY_TYPE_LABEL[lt.leave_pay_type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <P className="font-medium">{lt.leave_count_days} days</P>
                </TableCell>
                <TableCell>
                  <Badge variant={lt.is_enabled ? 'success' : 'secondary'}>
                    {lt.is_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="sm">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/leave/type/view?id=${lt.id}`)
                      }
                      title={LEAVE_TYPE_PAGE.buttons.edit}
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/leave/type/view?id=${lt.id}&edit=true`)
                      }
                      title={LEAVE_TYPE_PAGE.buttons.edit}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => deleteLeaveType(lt.id)}
                      title={LEAVE_TYPE_PAGE.buttons.delete}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}
    </Div>
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