'use client';

import { useMemo } from 'react';
import { useSessionTimetable } from '@/hooks/useSessionTimetable';
import { SCHOOL_TIMETABLE_PAGE } from '@/constants';
import {
  Div, Spinner, Badge, SectionLabel, P,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell,
  TableBody, TableRow, TableCell, TableEmptyRow,
  FilterToolbar, type FilterField,
} from '@/components/ui';
import type { DayOfWeek } from '@/services/timetable.service';

function fmt12(time: string | null | undefined): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function SessionTimetablePage() {
  const {
    academicYearId, setAcademicYearId,
    day, setDay,
    timetableName, setTimetableName,
    years, timetableNames,
    rows, periods,
    isLoadingMeta, isLoading,
    days, dayLabels,
    getCell,
  } = useSessionTimetable();

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: 'select',
        key: 'academic_year_id',
        label: 'Session',
        placeholder: 'All Sessions',
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? ' (Current)' : ''}`,
        })),
        disabled: isLoadingMeta,
      },
      {
        type: 'select',
        key: 'day',
        label: 'Day Name',
        placeholder: 'Select Day',
        options: days.map((d) => ({ value: d, label: dayLabels[d] })),
      },
      {
        type: 'select',
        key: 'timetable_name',
        label: 'Timetable Session',
        placeholder: 'All',
        options: timetableNames.map((n) => ({ value: n, label: n })),
        disabled: isLoadingMeta,
      },
    ],
    [years, days, dayLabels, timetableNames, isLoadingMeta],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: academicYearId || undefined,
    day: day || undefined,
    timetable_name: timetableName || undefined,
  };

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ('academic_year_id' in next) setAcademicYearId(next.academic_year_id ?? '');
    if ('day' in next) setDay((next.day as DayOfWeek) ?? 'MONDAY');
    if ('timetable_name' in next) setTimetableName(next.timetable_name ?? '');
  }

  function handleClearFilters() {
    handleFilterChange({ academic_year_id: undefined, day: undefined, timetable_name: undefined });
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader title={SCHOOL_TIMETABLE_PAGE.session.title} />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        sheetTitle="Filter Schedule"
      />

      {/* Content */}
      {isLoading ? (
        <Div variant="glass" padding="py-20" type="col" align="center" gap="sm">
          <Spinner />
          <P size="sm" color="muted">Loading schedule…</P>
        </Div>
      ) : rows.length === 0 ? (
        <Div variant="glass" padding="py-20 px-8" type="col" align="center" gap="sm">
          <Div variant="theme-icon-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </Div>
          <P size="sm" color="muted">No timetable data for {dayLabels[day]}</P>
        </Div>
      ) : (
        <Div variant="glass" padding="p-5" type="col" gap="md">
          <Div type="row" align="center" justify="between">
            <SectionLabel>{dayLabels[day]} — Class Schedule</SectionLabel>
            {timetableName && (
              <Badge variant="primary" className="text-xs px-2.5 py-1">{timetableName}</Badge>
            )}
          </Div>

          <Div className="overflow-x-auto rounded-xl border border-border/50">
            <Table>
              <TableHead>
                <TableHeadRow>
                  <TableHeaderCell>Class Name</TableHeaderCell>
                  {periods.map((p) => (
                    <TableHeaderCell key={p} className="text-center">
                      Period {p}
                    </TableHeaderCell>
                  ))}
                </TableHeadRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => {
                  const label = row.class_name || row.timetable_name;
                  return (
                    <TableRow key={row.timetable_id}>
                      <TableCell primary>{label}</TableCell>
                      {periods.map((p) => {
                        const cell = getCell(row.timetable_id, p);
                        const timeStr = cell?.start_time && cell?.end_time
                          ? `${fmt12(cell.start_time)} – ${fmt12(cell.end_time)}`
                          : null;
                        return (
                          <TableCell key={p} className="align-top">
                            {cell ? (
                              <Div type="col" gap="xs">
                                {timeStr && (
                                  <P size="xs" color="muted" className="leading-none">
                                    {timeStr}
                                  </P>
                                )}
                                <P size="sm" weight="semibold" className="leading-snug">
                                  {cell.subject_name ?? (
                                    <P size="xs" color="muted" weight="normal">No Subject</P>
                                  )}
                                </P>
                                <P size="xs" color="muted" className="leading-none">
                                  [{cell.teacher_name ?? 'Not Assigned'}]
                                </P>
                              </Div>
                            ) : (
                              <P size="sm" color="muted" className="text-muted-foreground/25 select-none">—</P>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Div>
        </Div>
      )}
    </Div>
  );
}
