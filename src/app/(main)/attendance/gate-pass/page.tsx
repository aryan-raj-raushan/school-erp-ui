'use client';

import { useEffect, useMemo } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { useGatePass } from '@/hooks/useGatePass';
import { useStudents } from '@/hooks/useStudentV2';
import { useStorageFilter } from '@/hooks/useStorageFilter';
import { STORAGE_FILTER_KEYS } from '@/constants/storage-filter-keys.constants';
import {
  PageCol,
  PageHeader,
  type PageHeaderConfig,
  Div,
  Button,
  Input,
  Badge,
  DataTable,
  RowActions,
  FilterToolbar,
  type FilterField,
  DatePicker,
  FormField,
  P,
  type ColumnDef,
  ResponsiveModalContainer,
  ResponsiveSelect,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { GatePassRecord } from '@/types';

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'info' | 'danger' | 'secondary'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  USED: 'info',
  EXPIRED: 'secondary',
  REJECTED: 'danger',
};

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'USED', 'EXPIRED', 'REJECTED'];

type PersistedGatePassFilters = Pick<{ status?: string }, 'status'>;

export default function GatePassPage() {
  const {
    records, isLoading, date, setDate, statusFilter, setStatusFilter, actionId,
    isDialogOpen, openDialog, closeDialog, fetch,
    studentId, setStudentId, reason, setReason,
    formDate, setFormDate, exitTime, setExitTime, returnTime, setReturnTime,
    handleSubmit, approve, reject, attemptedSubmit,
  } = useGatePass();

  const { students, isLoading: isLoadingStudents } = useStudents({ limit: 500 });

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedGatePassFilters>({
    key: STORAGE_FILTER_KEYS.GATE_PASS,
    defaultValue: {},
  });

  useEffect(() => { fetch(); }, [fetch]);

  // One-time: apply a previously persisted status filter once storage hydrates.
  useEffect(() => {
    if (!isStorageHydrated) return;
    if (storedFilters.status) setStatusFilter(storedFilters.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ('date' in next) setDate(next.date ?? '');
    if ('status' in next) {
      setStatusFilter(next.status ?? '');
      persistFilters({ status: next.status });
    }
  }

  function handleClearFilters() {
    setDate('');
    setStatusFilter('');
    clearStoredFilters();
  }

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: 'custom',
        key: 'date',
        label: 'Date',
        chipLabel: date ? formatDate(date) : undefined,
        render: () => (
          <DatePicker value={date} onChange={setDate} size="compact" placeholder="All dates" className="w-40" />
        ),
      },
      {
        type: 'select',
        key: 'status',
        label: 'Status',
        placeholder: 'All Statuses',
        options: STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
      },
    ],
    [date, setDate],
  );

  const filterValues: Record<string, string | undefined> = {
    date: date || undefined,
    status: statusFilter || undefined,
  };

  const pageHeaderConfig: PageHeaderConfig = {
    title: 'Gate Passes',
    subtitle: `${records.length} gate pass requests`,
    actions: [
      {
        label: 'Create Gate Pass',
        icon: <Plus size={14} />,
        onClick: openDialog,
      },
    ],
  };

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
      meta: { primary: true },
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
      cell: ({ row }) => {
        const isPending = row.original.status === 'PENDING';
        const studentLabel = studentNameMap[row.original.student_id] || row.original.student_name;
        return (
          <RowActions
            actions={[
              {
                label: 'Approve',
                icon: <Check size={14} />,
                hidden: !isPending,
                disabled: actionId === row.original.id,
                confirm: {
                  title: 'Approve Gate Pass',
                  description: `Approve the gate pass request for ${studentLabel}?`,
                  confirmLabel: 'Approve',
                },
                onClick: () => approve(row.original.id),
              },
              {
                label: 'Reject',
                icon: <X size={14} />,
                variant: 'destructive',
                hidden: !isPending,
                disabled: actionId === row.original.id,
                confirm: {
                  title: 'Reject Gate Pass',
                  description: `Reject the gate pass request for ${studentLabel}?`,
                  confirmLabel: 'Reject',
                },
                onClick: () => reject(row.original.id),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <PageCol>
      <PageHeader sticky {...pageHeaderConfig} />

      <Div className="rounded-xl border border-border/60 bg-white p-3 dark:bg-neutral-900">
        <FilterToolbar
          fields={filterFields}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          sheetTitle="Filter Gate Passes"
        />
      </Div>

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        emptyText="No gate passes found for these filters."
      />

      <ResponsiveModalContainer
        isOpen={isDialogOpen}
        onClose={closeDialog}
        title="Create Gate Pass"
      >
        <Div type="col" gap="sm" className="px-4 py-4">
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
              <FormField label="Student *" error={attemptedSubmit && !studentId ? 'Required' : ''} htmlFor="student">
                <ResponsiveSelect
                  id="student"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  disabled={isLoadingStudents}
                  customPlaceholder={isLoadingStudents ? 'Loading students...' : 'Select Student'}
                  options={studentOptions.map(s => ({ value: s.id, label: s.label }))}
                />
              </FormField>
            </Div>

            {/* Full width - Reason */}
            <Div className="md:col-span-2">
              <FormField label="Reason *" error={attemptedSubmit && !reason ? 'Required' : ''}>
                <Input
                  placeholder="e.g. Doctor appointment, Home emergency"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </FormField>
            </Div>

            {/* Half width - Date */}
            <Div>
              <FormField label="Date *">
                <DatePicker value={formDate} onChange={setFormDate} />
              </FormField>
            </Div>

            {/* Half width - Exit Time */}
            <Div>
              <FormField label="Exit Time *" error={attemptedSubmit && !exitTime ? 'Required' : ''}>
                <Input
                  type="time"
                  value={exitTime}
                  onChange={e => setExitTime(e.target.value)}
                />
              </FormField>
            </Div>

            {/* Half width - Return Time */}
            <Div>
              <FormField label="Return Time *" error={attemptedSubmit && !returnTime ? 'Required' : ''}>
                <Input
                  type="time"
                  value={returnTime}
                  onChange={e => setReturnTime(e.target.value)}
                />
              </FormField>
            </Div>
          </Div>

          {/* Validation Message */}
          {attemptedSubmit && !isFormValid && (
            <Div type="row" align="center" gap="sm" className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 -mt-1">
              <P size="xs" color="muted">⚠️ All fields are required</P>
            </Div>
          )}
        </Div>

        <Div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button variant="outline" onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Gate Pass</Button>
        </Div>
      </ResponsiveModalContainer>
    </PageCol>
  );
}
