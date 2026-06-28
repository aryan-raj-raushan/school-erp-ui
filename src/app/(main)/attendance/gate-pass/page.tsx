'use client';

import { useEffect } from 'react';
import { useGatePass } from '@/hooks/useGatePass';
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
  Modal,
  ModalBody,
  ModalFooter,
  FilterLabel,
  Spinner,
  EmptyState,
  type ColumnDef,
} from '@/components/ui';
import type { GatePassRecord } from '@/types';

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'info' | 'danger' | 'secondary'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  USED: 'info',
  EXPIRED: 'secondary',
  REJECTED: 'danger',
};

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'USED', 'EXPIRED', 'REJECTED'];

export default function GatePassPage() {
  const {
    records, isLoading, date, setDate, statusFilter, setStatusFilter, actionId,
    isDialogOpen, setIsDialogOpen, fetch,
    studentId, setStudentId, reason, setReason,
    exitTime, setExitTime, returnTime, setReturnTime,
    handleSubmit, approve, reject,
  } = useGatePass();

  useEffect(() => { fetch(); }, [fetch]);

  const columns: ColumnDef<GatePassRecord>[] = [
    { header: 'Student', accessorKey: 'student_id' },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Reason', accessorKey: 'reason' },
    { header: 'Exit', accessorKey: 'exit_time' },
    { header: 'Return', accessorKey: 'return_time' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={STATUS_BADGE[row.original.status] ?? 'default'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      header: 'QR Code',
      accessorKey: 'qr_code',
      cell: ({ row }) => <span>{row.original.qr_code?.slice(0, 8)}…</span>,
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <Div type="row" gap="sm">
          {row.original.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="outline"
                loading={actionId === row.original.id}
                onClick={() => approve(row.original.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                loading={actionId === row.original.id}
                onClick={() => reject(row.original.id)}
              >
                Reject
              </Button>
            </>
          )}
        </Div>
      ),
    },
  ];

  return (
    <PageCol>
      <PageHeader
        title="Gate Passes"
        subtitle="Manage student gate pass requests"
        actions={<Button onClick={() => setIsDialogOpen(true)}>+ Create Gate Pass</Button>}
      />

      <FilterBar>
        <FilterLabel>Date</FilterLabel>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Button variant="outline" onClick={fetch}>Search</Button>
      </FilterBar>

      {isLoading ? (
        <Spinner />
      ) : records.length === 0 ? (
        <EmptyState title="No gate passes" description="No gate passes found for these filters." />
      ) : (
        <DataTable columns={columns} data={records} />
      )}

      {isDialogOpen && (
        <Modal title="Create Gate Pass" onClose={() => setIsDialogOpen(false)}>
          <ModalBody>
            <Div type="col" gap="md">
              <Input
                placeholder="Student ID"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
              />
              <Input
                placeholder="Reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
              <Input
                type="time"
                placeholder="Planned exit time"
                value={exitTime}
                onChange={e => setExitTime(e.target.value)}
              />
              <Input
                type="time"
                placeholder="Expected return time"
                value={returnTime}
                onChange={e => setReturnTime(e.target.value)}
              />
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create</Button>
          </ModalFooter>
        </Modal>
      )}
    </PageCol>
  );
}
