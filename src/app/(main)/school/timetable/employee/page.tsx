'use client';

import { useEmployeeTimetable } from '@/hooks/useEmployeeTimetable';
import { SCHOOL_TIMETABLE_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Select, FilterLabel, Spinner,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
} from '@/components/ui';

export default function EmployeeTimetablePage() {
  const {
    teacherId, setTeacherId,
    staff, isLoadingStaff,
    entries, isLoading,
    days, dayLabels,
    getEntries,
  } = useEmployeeTimetable();

  return (
    <Div type="col" gap="lg">
      <PageHeader title={SCHOOL_TIMETABLE_PAGE.employee.title} />

      <Div type="row" gap="md" align="end">
        <Div type="col" gap="xs">
          <FilterLabel>{SCHOOL_TIMETABLE_PAGE.employee.selectTeacher}</FilterLabel>
          <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} width="md" disabled={isLoadingStaff}>
            <option value="">— Select Teacher —</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Div>
      </Div>

      {isLoading ? (
        <Div type="col" align="center" className="py-10"><Spinner /></Div>
      ) : !teacherId ? null : (
        <Div type="col" gap="lg">
          {days.map((day) => {
            const dayEntries = getEntries(day);
            return (
              <Div key={day} type="col" gap="sm">
                <p className="text-sm font-semibold">{dayLabels[day]}</p>
                <Table>
                  <TableHead>
                    <TableHeadRow>
                      <TableHeaderCell>Period</TableHeaderCell>
                      <TableHeaderCell>Timetable</TableHeaderCell>
                      <TableHeaderCell>Class</TableHeaderCell>
                      <TableHeaderCell>Subject</TableHeaderCell>
                    </TableHeadRow>
                  </TableHead>
                  <TableBody>
                    {dayEntries.length === 0 ? (
                      <TableEmptyRow colSpan={4}>No classes</TableEmptyRow>
                    ) : (
                      dayEntries.map((e) => (
                        <TableRow key={`${e.timetable_id}-${e.period_number}`}>
                          <TableCell>P{e.period_number}</TableCell>
                          <TableCell>{e.timetable_name}</TableCell>
                          <TableCell>{[e.class_name, e.class_detail_name].filter(Boolean).join(' / ')}</TableCell>
                          <TableCell>{e.subject_name ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Div>
            );
          })}
        </Div>
      )}
    </Div>
  );
}
