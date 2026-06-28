'use client';

import { useEffect } from 'react';
import { useSchoolCalendar } from '@/hooks/useSchoolCalendar';
import {
  PageCol,
  PageHeader,
  FilterBar,
  Div,
  Button,
  Badge,
  P,
  H3,
  Spinner,
  type BadgeVariant,
} from '@/components/ui';
import type { CalendarEvent } from '@/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TYPE_VARIANT: Record<string, BadgeVariant> = {
  HOLIDAY: 'danger',
  EXAM: 'purple',
  EVENT: 'info',
  PTM: 'success',
  TIMING_CHANGE: 'warning',
};

function groupByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  return events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const key = e.date ?? e.start_date ?? e.from_date ?? '';
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});
}

export default function SchoolCalendarPage() {
  const { year, month, events, isLoading, fetch, prevMonth, nextMonth } = useSchoolCalendar();

  useEffect(() => { fetch(); }, [fetch]);

  const byDate = groupByDate(events);

  return (
    <PageCol>
      <PageHeader title="School Calendar" subtitle="Holidays, events, exams and announcements" />

      <FilterBar>
        <Button variant="outline" onClick={prevMonth}>&lt; Prev</Button>
        <H3>{MONTH_NAMES[month - 1]} {year}</H3>
        <Button variant="outline" onClick={nextMonth}>Next &gt;</Button>
        <Button variant="ghost" onClick={fetch}>Refresh</Button>
      </FilterBar>

      <Div type="row" wrap gap="sm">
        {(['HOLIDAY', 'EXAM', 'EVENT', 'PTM', 'TIMING_CHANGE'] as const).map(t => (
          <Badge key={t} variant={TYPE_VARIANT[t]}>{t}</Badge>
        ))}
      </Div>

      {isLoading ? (
        <Spinner />
      ) : events.length === 0 ? (
        <P>No events for {MONTH_NAMES[month - 1]} {year}.</P>
      ) : (
        <Div type="col" gap="md">
          {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, evts]) => (
            <Div key={date} type="col" gap="xs">
              <H3>{date}</H3>
              {evts.map((evt, i) => (
                <Div key={i} type="row" gap="sm" align="center">
                  <Badge variant={TYPE_VARIANT[evt.type] ?? 'default'}>{evt.type}</Badge>
                  <P>{evt.title ?? evt.name}</P>
                </Div>
              ))}
            </Div>
          ))}
        </Div>
      )}
    </PageCol>
  );
}
