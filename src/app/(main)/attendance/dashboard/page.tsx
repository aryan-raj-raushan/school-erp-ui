'use client';

import { useAttendanceDashboard } from '@/hooks/useAttendanceDashboard';
import {
  PageCol,
  PageHeader,
  Div,
  MiniStat,
  Spinner,
  P,
} from '@/components/ui';

export default function AttendanceDashboardPage() {
  const { stats, isLoading } = useAttendanceDashboard();

  if (isLoading) return <PageCol><Spinner /></PageCol>;

  return (
    <PageCol>
      <PageHeader title="Attendance Dashboard" subtitle="Today's overview" />

      {stats ? (
        <Div type="row" wrap gap="md">
          <MiniStat label="Total Students" value={stats.total_students} />
          <MiniStat label="Present" value={stats.present} color="green" />
          <MiniStat label="Absent" value={stats.absent} color="red" />
          <MiniStat label="Late" value={stats.late} color="yellow" />
          <MiniStat label="Half Day" value={stats.half_day} />
          <MiniStat label="On Leave" value={stats.leave} />
          <MiniStat label="Missing Punch" value={stats.missing_punch} />
          <MiniStat label="Unresolved Conflicts" value={stats.pending_conflicts} />
          <MiniStat label="Pending Leave Requests" value={stats.pending_leave_requests} />
        </Div>
      ) : (
        <P>No data available for today.</P>
      )}
    </PageCol>
  );
}
