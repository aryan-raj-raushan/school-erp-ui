'use client';

import { useSessionTimetable } from '@/hooks/useSessionTimetable';
import { SCHOOL_TIMETABLE_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Select, FilterLabel, Spinner, Badge, SectionLabel, P,
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

  return (
    <Div type="col" gap="lg">
      <PageHeader title={SCHOOL_TIMETABLE_PAGE.session.title} />

      {/* Filters */}
      <Div variant="glass-sm" padding="p-4">
        <Div type="row" gap="md" align="end" wrap>
          <Div type="col" gap="xs">
            <FilterLabel>Session</FilterLabel>
            <Select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              width="md"
              disabled={isLoadingMeta}
            >
              <option value="">All Sessions</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}{y.is_current ? ' (Current)' : ''}
                </option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <FilterLabel>Day Name</FilterLabel>
            <Select
              value={day}
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
              width="md"
            >
              {days.map((d) => (
                <option key={d} value={d}>{dayLabels[d]}</option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <FilterLabel>Timetable Session</FilterLabel>
            <Select
              value={timetableName}
              onChange={(e) => setTimetableName(e.target.value)}
              width="md"
              disabled={isLoadingMeta}
            >
              <option value="">All</option>
              {timetableNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
          </Div>
        </Div>
      </Div>

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

          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 border-b border-r border-border/50 bg-muted/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-36">
                    Class Name
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p}
                      className="border-b border-r border-border/50 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide min-w-[165px]"
                      style={{ background: 'var(--theme-glow-soft)', color: 'var(--theme-gradient-from)' }}
                    >
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const label = [row.class_name, row.class_detail_name].filter(Boolean).join(' / ')
                    || row.timetable_name;
                  return (
                    <tr key={row.timetable_id} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/10'}>
                      <td className="sticky left-0 z-10 border-b border-r border-border/50 bg-inherit px-4 py-3 align-middle">
                        <span className="text-sm font-semibold text-foreground">{label}</span>
                      </td>
                      {periods.map((p) => {
                        const cell = getCell(row.timetable_id, p);
                        const timeStr = cell?.start_time && cell?.end_time
                          ? `${fmt12(cell.start_time)} – ${fmt12(cell.end_time)}`
                          : null;
                        return (
                          <td
                            key={p}
                            className="border-b border-r border-border/50 px-3 py-2.5 align-top transition-colors hover:bg-muted/20"
                          >
                            {cell ? (
                              <Div type="col" gap="xs">
                                {timeStr && (
                                  <span className="text-[11px] font-medium text-muted-foreground leading-none">
                                    {timeStr}
                                  </span>
                                )}
                                <span className="text-sm font-semibold text-foreground leading-snug">
                                  {cell.subject_name ?? (
                                    <span className="text-muted-foreground/50 font-normal text-xs">No Subject</span>
                                  )}
                                </span>
                                <span className="text-xs text-muted-foreground leading-none">
                                  [{cell.teacher_name ?? 'Not Assigned'}]
                                </span>
                              </Div>
                            ) : (
                              <span className="text-muted-foreground/25 text-base select-none">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Div>
      )}
    </Div>
  );
}
