'use client';

import { useSessionTimetable } from '@/hooks/useSessionTimetable';
import { SCHOOL_TIMETABLE_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Select, FilterLabel, Spinner,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
} from '@/components/ui';
import type { DayOfWeek } from '@/services/timetable.service';

export default function SessionTimetablePage() {
  const {
    day, setDay,
    entries, isLoading,
    days, dayLabels,
  } = useSessionTimetable();

  return (
    <Div type="col" gap="lg">
      <PageHeader title={SCHOOL_TIMETABLE_PAGE.session.title} />

      <Div type="row" gap="md" align="end">
        <Div type="col" gap="xs">
          <FilterLabel>{SCHOOL_TIMETABLE_PAGE.session.selectDay}</FilterLabel>
          <Select value={day} onChange={(e) => setDay(e.target.value as DayOfWeek)} width="md">
            {days.map((d) => <option key={d} value={d}>{dayLabels[d]}</option>)}
          </Select>
        </Div>
      </Div>

      {isLoading ? (
        <Div type="col" align="center" className="py-10"><Spinner /></Div>
      ) : (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>Period</TableHeaderCell>
              <TableHeaderCell>Timetable</TableHeaderCell>
              <TableHeaderCell>Class</TableHeaderCell>
              <TableHeaderCell>Subject</TableHeaderCell>
              <TableHeaderCell>Teacher</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableEmptyRow colSpan={5}>{SCHOOL_TIMETABLE_PAGE.session.empty}</TableEmptyRow>
            ) : (
              entries.map((e, idx) => (
                <TableRow key={`${e.timetable_id}-${e.period_number}-${idx}`}>
                  <TableCell>P{e.period_number}</TableCell>
                  <TableCell>{e.timetable_name}</TableCell>
                  <TableCell>{[e.class_name, e.class_detail_name].filter(Boolean).join(' / ')}</TableCell>
                  <TableCell>{e.subject_name ?? '—'}</TableCell>
                  <TableCell>{e.teacher_name ?? '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </Div>
  );
}
