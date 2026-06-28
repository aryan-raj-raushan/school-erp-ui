'use client';

import { useStaffAttendanceReports } from '@/hooks/useStaffAttendanceReports';
import {
  Div,
  P,
  PageHeader,
  PageCol,
  Spinner,
  Input,
  Badge,
  MiniStat,
  DataTable,
  Tabs,
  FilterLabel,
  type ColumnDef,
} from '@/components/ui';
import { ATTENDANCE_STATUS_BADGE, STAFF_REPORT_TAB_OPTIONS } from '@/constants/attendance.constants';
import type { AttendanceStatus } from '@/types';

export default function StaffAttendanceReportPage() {
  const {
    tab,
    setTab,
    date,
    setDate,
    staff,
    records,
    isLoading,
    getRecordForStaff,
    presentCount,
    absentCount,
    lateCount,
    totalStaff,
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

  return (
    <PageCol>
      <PageHeader
        title="Staff Attendance Report"
        subtitle="View daily attendance records for all staff members"
      />

      <Tabs
        options={STAFF_REPORT_TAB_OPTIONS}
        value={tab}
        onChange={(v) => setTab(v)}
      />

      {tab === 'daily' && (
        <Div type="col" gap="md">
          <Div variant="card" padding="p-4">
            <Div type="grid" cols={2} gap="md">
              <Div type="col" gap="xs">
                <FilterLabel>Date</FilterLabel>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Div>
            </Div>
          </Div>

          <Div type="row" gap="sm">
            <MiniStat label="Total Staff" value={totalStaff} />
            <MiniStat label="Present" value={presentCount} color="green" />
            <MiniStat label="Absent" value={absentCount} color="red" />
            <MiniStat label="Late" value={lateCount} color="yellow" />
          </Div>

          {isLoading ? (
            <Div type="row" justify="center" padding="p-12">
              <Spinner />
            </Div>
          ) : (
            <DataTable columns={columns} data={staff} isLoading={isLoading} />
          )}
        </Div>
      )}

      {tab === 'history' && (
        <Div type="col" gap="md">
          <Div variant="card" padding="p-4">
            <P>Select a staff member from the daily report to view their attendance history.</P>
          </Div>
        </Div>
      )}
    </PageCol>
  );
}
