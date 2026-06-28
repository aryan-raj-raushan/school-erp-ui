'use client';

import { useEffect } from 'react';
import { useEarlyExit } from '@/hooks/useEarlyExit';
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
import type { EarlyExitRecord, EarlyExitReason } from '@/types';

const REASON_OPTIONS: { label: string; value: EarlyExitReason }[] = [
  { label: 'Medical', value: 'MEDICAL' },
  { label: 'Parent Pickup', value: 'PARENT_PICKUP' },
  { label: 'Emergency', value: 'EMERGENCY' },
  { label: 'Official', value: 'OFFICIAL' },
  { label: 'Other', value: 'OTHER' },
];

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

export default function EarlyExitPage() {
  const {
    records, isLoading, date, setDate, actionId,
    isDialogOpen, setIsDialogOpen, fetch,
    studentId, setStudentId, exitTime, setExitTime,
    reason, setReason, remarks, setRemarks,
    handleSubmit, approve, reject, remove,
  } = useEarlyExit();

  useEffect(() => { fetch(); }, [fetch]);

  const columns: ColumnDef<EarlyExitRecord>[] = [
    { header: 'Student', accessorKey: 'student_id' },
    { header: 'Exit Time', accessorKey: 'exit_time' },
    { header: 'Reason', accessorKey: 'reason' },
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => remove(row.original.id)}
          >
            Delete
          </Button>
        </Div>
      ),
    },
  ];

  return (
    <PageCol>
      <PageHeader
        title="Early Exits"
        subtitle="Log and manage student early departures"
        actions={<Button onClick={() => setIsDialogOpen(true)}>+ Log Early Exit</Button>}
      />

      <FilterBar>
        <FilterLabel>Date</FilterLabel>
        <Input type="date" value={date} onChange={e => { setDate(e.target.value); }} />
        <Button variant="outline" onClick={() => fetch(date)}>Refresh</Button>
      </FilterBar>

      {isLoading ? (
        <Spinner />
      ) : records.length === 0 ? (
        <EmptyState title="No early exits" description="No early exits logged for this date." />
      ) : (
        <DataTable columns={columns} data={records} />
      )}

      {isDialogOpen && (
        <Modal title="Log Early Exit" onClose={() => setIsDialogOpen(false)}>
          <ModalBody>
            <Div type="col" gap="md">
              <Input
                placeholder="Student ID"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
              />
              <Input
                type="time"
                value={exitTime}
                onChange={e => setExitTime(e.target.value)}
              />
              <Select
                value={reason}
                onChange={e => setReason(e.target.value as EarlyExitReason)}
              >
                {REASON_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
              <Input
                placeholder="Remarks (optional)"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </ModalFooter>
        </Modal>
      )}
    </PageCol>
  );
}
