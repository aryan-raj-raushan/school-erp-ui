'use client';

import { useEffect, useMemo } from 'react';
import { useGatePass } from '@/hooks/useGatePass';
import { useStudents } from '@/hooks/useStudentV2';
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
  FormField,
  P,
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

  const { students, isLoading: isLoadingStudents } = useStudents({ limit: 500 });

  useEffect(() => { fetch(); }, [fetch]);

  const studentOptions = useMemo(
    () => students.map(s => ({
      id: s.id,
      label: `${s.first_name} ${s.last_name || ''} (${s.admission_number || s.id.slice(0, 6)})`
    })),
    [students]
  );

  const studentNameMap = useMemo(
    () => Object.fromEntries(
      students.map(s => [s.id, `${s.first_name} ${s.last_name || ''}`.trim()])
    ),
    [students]
  );

  const isFormValid = studentId && reason && exitTime && returnTime;

  const columns: ColumnDef<GatePassRecord>[] = [
    {
      header: 'Student',
      accessorKey: 'student_id',
      cell: ({ row }) => studentNameMap[row.original.student_id] || row.original.student_name || '—',
    },
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
      cell: ({ row }) => <P size="sm">{row.original.qr_code?.slice(0, 8)}…</P>,
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
        <Modal title="Create Gate Pass" onClose={() => setIsDialogOpen(false)} size="md">
          <ModalBody>
            <Div type="col" gap="sm">
              {/* Header Info */}
              <Div type="col" gap="xs">
                <P size="sm" color="muted" className="uppercase tracking-wide font-semibold">
                  Gate Pass Details
                </P>
                <P size="xs" color="muted">
                  Fill in all required fields to create a new gate pass request
                </P>
              </Div>

              {/* Grid Layout - 2 columns */}
              <Div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Full width - Student */}
                <Div className="md:col-span-2">
                  <FormField label="Student *" error={!studentId ? 'Required' : ''}>
                    <Select
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      disabled={isLoadingStudents}
                    >
                      <option value="">
                        {isLoadingStudents ? 'Loading students...' : 'Select Student'}
                      </option>
                      {studentOptions.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </Select>
                  </FormField>
                </Div>

                {/* Full width - Reason */}
                <Div className="md:col-span-2">
                  <FormField label="Reason *" error={!reason ? 'Required' : ''}>
                    <Input
                      placeholder="e.g. Doctor appointment, Home emergency"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                  </FormField>
                </Div>

                {/* Half width - Exit Time */}
                <Div>
                  <FormField label="Exit Time *" error={!exitTime ? 'Required' : ''}>
                    <Input
                      type="time"
                      value={exitTime}
                      onChange={e => setExitTime(e.target.value)}
                    />
                  </FormField>
                </Div>

                {/* Half width - Return Time */}
                <Div>
                  <FormField label="Return Time *" error={!returnTime ? 'Required' : ''}>
                    <Input
                      type="time"
                      value={returnTime}
                      onChange={e => setReturnTime(e.target.value)}
                    />
                  </FormField>
                </Div>
              </Div>

              {/* Validation Message */}
              {!isFormValid && (
                <Div type="row" align="center" gap="sm" className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 -mt-1">
                  <P size="xs" color="muted">⚠️ All fields are required</P>
                </Div>
              )}
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!isFormValid}>Create Gate Pass</Button>
          </ModalFooter>
        </Modal>
      )}
    </PageCol>
  );
}
