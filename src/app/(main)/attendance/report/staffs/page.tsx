'use client';

import { FileDown } from 'lucide-react';
import { useMemo } from 'react';
import { useStaffAttendanceReports } from '@/hooks/useStaffAttendanceReports';
import {
  Div,
  P,
  PageHeader,
  PageCol,
  Spinner,
  Badge,
  Button,
  MiniStat,
  DataTable,
  DatePicker,
  FilterToolbar,
  type FilterField,
  type ColumnDef,
} from '@/components/ui';
import { ATTENDANCE_STATUS_BADGE } from '@/constants/attendance.constants';
import { formatDate } from '@/lib/utils';
import type { AttendanceStatus } from '@/types';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const today = new Date().toISOString().split('T')[0];

function firstOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

export default function StaffAttendanceReportPage() {
  const {
    tab,
    setTab,
    date,
    setDate,
    month,
    setMonth,
    year,
    setYear,
    roleFilter,
    setRoleFilter,
    roles,
    staff,
    records,
    monthlyRecords,
    isLoading,
    isExporting,
    exportStartDate,
    setExportStartDate,
    exportEndDate,
    setExportEndDate,
    getRecordForStaff,
    getFilteredStaff,
    presentCount,
    absentCount,
    lateCount,
    totalStaff,
    exportAttendance,
    loadMonthlyReport,
  } = useStaffAttendanceReports();

  const columns: ColumnDef<{ id: string; first_name: string; last_name: string | null; employee_code: string | null; role: string }>[] = [
    {
      id: 'index',
      header: '#',
      size: 48,
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'first_name',
      header: 'Staff Member',
      cell: ({ row }) => `${row.original.first_name} ${row.original.last_name ?? ''}`.trim(),
    },
    {
      accessorKey: 'employee_code',
      header: 'Code',
      size: 100,
      cell: ({ row }) => row.original.employee_code ?? '—',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      id: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => {
        const record = getRecordForStaff(row.original.id);
        if (!record) return <P size="xs">Not Marked</P>;
        const badgeVariant = ATTENDANCE_STATUS_BADGE[record.status as AttendanceStatus];
        return <Badge variant={badgeVariant}>{record.status}</Badge>;
      },
    },
    {
      id: 'late',
      header: 'Late',
      size: 80,
      cell: ({ row }) => {
        const record = getRecordForStaff(row.original.id);
        return record?.is_late ? <Badge variant="warning">Late</Badge> : null;
      },
    },
  ];

  const tabButtons = [
    { key: 'daily' as const, label: 'Daily Report' },
    { key: 'monthly' as const, label: 'Monthly Summary' },
    { key: 'history' as const, label: 'Export' },
  ];

  const filteredStaff = getFilteredStaff();

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ('role' in next) setRoleFilter(next.role ?? '');
    if ('from' in next) {
      const val = next.from ?? '';
      setExportStartDate(val);
      if (val && val > exportEndDate) setExportEndDate(val);
    }
    if ('to' in next) {
      const val = next.to ?? '';
      setExportEndDate(val);
      if (val && val < exportStartDate) setExportStartDate(val);
    }
  }

  function handleClearFilters() {
    setRoleFilter('');
    setExportStartDate(firstOfMonthISO());
    setExportEndDate(today);
  }

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: 'select',
        key: 'role',
        label: 'Role',
        placeholder: 'All Roles',
        options: roles.map((r) => ({ value: r, label: r })),
      },
      {
        type: 'custom',
        key: 'from',
        label: 'From',
        chipLabel: exportStartDate ? formatDate(exportStartDate) : undefined,
        render: () => (
          <DatePicker
            value={exportStartDate}
            onChange={(val) => handleFilterChange({ from: val })}
            maxDate={new Date(today)}
            size="compact"
            className="w-36"
          />
        ),
      },
      {
        type: 'custom',
        key: 'to',
        label: 'To',
        chipLabel: exportEndDate ? formatDate(exportEndDate) : undefined,
        render: () => (
          <DatePicker
            value={exportEndDate}
            onChange={(val) => handleFilterChange({ to: val })}
            minDate={exportStartDate ? new Date(exportStartDate) : undefined}
            maxDate={new Date(today)}
            size="compact"
            className="w-36"
          />
        ),
      },
    ],
    [roles, exportStartDate, exportEndDate],
  );

  const filterValues: Record<string, string | undefined> = {
    role: roleFilter,
    from: exportStartDate,
    to: exportEndDate,
  };

  return (
    <PageCol>
      <PageHeader
        title="Staff Attendance Report"
        subtitle="View attendance records for all staff members"
      />

      {/* Filter Toolbar with Export Button */}
      <Div type="row" gap="sm" align="center" wrap>
        <Div className="min-w-0 flex-1">
          <FilterToolbar
            fields={filterFields}
            values={filterValues}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            sheetTitle="Filter Report"
          />
        </Div>
        <Button
          variant="outline"
          loading={isExporting}
          onClick={exportAttendance}
          className="shrink-0"
        >
          <FileDown size={16} className="mr-2" />
          Export
        </Button>
      </Div>

      {/* Tabs — single row, horizontally scrollable on mobile */}
      <Div
        type="row"
        gap="sm"
        className="flex-nowrap overflow-x-auto pb-1 -mx-1 px-1"
      >
        {tabButtons.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'default' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </Div>

      {/* Daily Tab */}
      {tab === 'daily' && (
        <Div type="col" gap="md">
          <Div type="row" gap="sm" align="center" className="flex-nowrap overflow-x-auto sm:flex-wrap">
            <DatePicker
              value={date}
              onChange={(val) => setDate(val)}
              maxDate={new Date(today)}
              size="compact"
              className="w-36 sm:w-40"
            />
            <Div type="row" align="center" gap="sm" className="shrink-0">
              <P size="sm" color="muted" noWrap>Role:</P>
              <Div className="w-32">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="">All Roles</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Div>
            </Div>
          </Div>

          {(() => {
            const totalPct = filteredStaff.length > 0
              ? Math.round((presentCount / filteredStaff.length) * 100)
              : 0;
            const pctColor = filteredStaff.length > 0 && totalPct >= 75 ? 'green' : 'red';
            return (
              <>
                {/* Mobile: compact single-line stats */}
                <Div
                  type="row"
                  align="center"
                  gap="xs"
                  className="min-w-0 overflow-x-auto sm:hidden"
                >
                  <P size="xs" weight="semibold" noWrap className="shrink-0">
                    T:{filteredStaff.length}
                  </P>
                  <P size="xs" weight="semibold" color="green" noWrap className="shrink-0">
                    P:{presentCount}
                  </P>
                  <P size="xs" weight="semibold" color="red" noWrap className="shrink-0">
                    A:{absentCount}
                  </P>
                  <P size="xs" weight="semibold" color="yellow" noWrap className="shrink-0">
                    L:{lateCount}
                  </P>
                  <P size="xs" weight="semibold" color={pctColor} noWrap className="shrink-0">
                    Attendance:{totalPct}%
                  </P>
                </Div>

                {/* sm+: labeled stat tiles */}
                <Div type="row" gap="sm" className="hidden sm:flex">
                  <MiniStat label="Total Staff" value={filteredStaff.length} />
                  <MiniStat label="Present" value={presentCount} color="green" />
                  <MiniStat label="Absent" value={absentCount} color="red" />
                  <MiniStat label="Late" value={lateCount} color="yellow" />
                  <MiniStat label="Attendance" value={`${totalPct}%`} color={pctColor} />
                </Div>
              </>
            );
          })()}

          {isLoading ? (
            <Div type="row" justify="center" padding="p-12">
              <Spinner />
            </Div>
          ) : (
            <DataTable columns={columns} data={filteredStaff} isLoading={isLoading} />
          )}
        </Div>
      )}

      {/* Monthly Tab */}
      {tab === 'monthly' && (
        <Div type="col" gap="md">
          <Div type="row" gap="sm" align="center" className="flex-nowrap overflow-x-auto sm:flex-wrap">
            <select
              value={String(month)}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-9 w-28 shrink-0 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 sm:w-32"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={String(m.value)}>{m.label}</option>
              ))}
            </select>
            <select
              value={String(year)}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-9 w-24 shrink-0 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 sm:w-32"
            >
              {YEARS.map((y) => (
                <option key={y} value={String(y)}>{String(y)}</option>
              ))}
            </select>
            <Div type="row" align="center" gap="sm" className="shrink-0">
              <P size="sm" color="muted" noWrap>Role:</P>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 w-28 rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Div>
            <Button onClick={loadMonthlyReport} loading={isLoading} className="shrink-0 ml-auto">
              Load
            </Button>
          </Div>

          {isLoading ? (
            <Div type="row" justify="center" padding="p-12">
              <Spinner />
            </Div>
          ) : monthlyRecords.length === 0 ? (
            <P color="muted">No records found for this period.</P>
          ) : (
            <DataTable
              columns={columns}
              data={filteredStaff.filter((s) => monthlyRecords.some((r) => r.staff_id === s.id))}
              isLoading={isLoading}
            />
          )}
        </Div>
      )}

      {/* Export Tab */}
      {tab === 'history' && (
        <Div type="col" gap="md">
          <Div variant="card" padding="p-4">
            <P size="sm" color="muted">Use the filter bar above to set date range and role, then click &quot;Export Excel&quot; to download staff attendance data.</P>
          </Div>
        </Div>
      )}
    </PageCol>
  );
}
