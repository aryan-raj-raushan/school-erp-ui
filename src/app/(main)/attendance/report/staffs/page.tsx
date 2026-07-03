'use client';

import { FileDown } from 'lucide-react';
import { useStaffAttendanceReports } from '@/hooks/useStaffAttendanceReports';
import {
  Div,
  P,
  PageHeader,
  PageCol,
  Spinner,
  Input,
  Badge,
  Button,
  MiniStat,
  DataTable,
  FilterLabel,
  ResponsiveSelect,
  type ColumnDef,
} from '@/components/ui';
import { ATTENDANCE_STATUS_BADGE } from '@/constants/attendance.constants';
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

  return (
    <PageCol>
      <PageHeader
        title="Staff Attendance Report"
        subtitle="View attendance records for all staff members"
      />

      {/* Export Card - Always visible */}
      <Div variant="card" padding="p-4" gap="md">
        <P size="sm" color="muted" className="font-semibold">Export Attendance</P>
        <Div type="row" gap="md" align="center" wrap>
          <Div type="col" gap="xs">
            <P size="xs" color="muted">From</P>
            <Input
              type="date"
              width="sm"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
            />
          </Div>
          <Div type="col" gap="xs">
            <P size="xs" color="muted">To</P>
            <Input
              type="date"
              width="sm"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
            />
          </Div>
          <Div type="col" gap="xs">
            <P size="xs" color="muted">Role</P>
            <ResponsiveSelect
              className="w-32 max-w-full"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              customPlaceholder="All Roles"
              options={roles.map((r) => ({ value: r, label: r }))}
            />
          </Div>
          <Button variant="outline" loading={isExporting} onClick={exportAttendance} className="mt-5">
            <FileDown size={16} className="mr-2" />
            Export Excel
          </Button>
        </Div>
      </Div>

      {/* Tabs */}
      <Div type="row" gap="sm" wrap>
        {tabButtons.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </Div>

      {/* Daily Tab */}
      {tab === 'daily' && (
        <Div type="col" gap="md">
          <Div type="row" gap="md" align="center" wrap>
            <Div type="col" gap="xs">
              <FilterLabel>Date</FilterLabel>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Div>
            <Div type="col" gap="xs">
              <FilterLabel>Role</FilterLabel>
              <ResponsiveSelect
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                customPlaceholder="All Roles"
                options={roles.map((r) => ({ value: r, label: r }))}
              />
            </Div>
          </Div>

          <Div type="row" gap="sm">
            <MiniStat label="Total Staff" value={filteredStaff.length} />
            <MiniStat label="Present" value={presentCount} color="green" />
            <MiniStat label="Absent" value={absentCount} color="red" />
            <MiniStat label="Late" value={lateCount} color="yellow" />
          </Div>

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
          <Div type="row" gap="md" align="center" wrap>
            <ResponsiveSelect
              className="w-32 max-w-full"
              value={String(month)}
              onChange={(e) => setMonth(Number(e.target.value))}
              options={MONTHS.map((m) => ({ value: String(m.value), label: m.label }))}
            />
            <ResponsiveSelect
              className="w-32 max-w-full"
              value={String(year)}
              onChange={(e) => setYear(Number(e.target.value))}
              options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
            />
            <Div type="col" gap="xs">
              <FilterLabel>Role</FilterLabel>
              <ResponsiveSelect
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                customPlaceholder="All Roles"
                options={roles.map((r) => ({ value: r, label: r }))}
              />
            </Div>
            <Button onClick={loadMonthlyReport} loading={isLoading}>
              Load Summary
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
            <P size="sm" color="muted">Use the Export section above to export staff attendance data in Excel format.</P>
            <P size="xs" color="muted" className="mt-2">You can filter by date range and role to customize your export.</P>
          </Div>
        </Div>
      )}
    </PageCol>
  );
}
