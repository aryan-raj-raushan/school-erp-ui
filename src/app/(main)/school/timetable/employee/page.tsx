'use client';

import { useEmployeeTimetable } from '@/hooks/useEmployeeTimetable';
import { SCHOOL_TIMETABLE_PAGE } from '@/constants';
import {
  Div, Select, FilterLabel, Spinner, Badge, SectionLabel, P,
  PageHeader, PageCol,
} from '@/components/ui';

export default function EmployeeTimetablePage() {
  const {
    teacherId, setTeacherId,
    staff, isLoadingStaff,
    entries, isLoading,
    days, dayLabels,
    periods,
    getCell,
  } = useEmployeeTimetable();

  const selectedTeacher = staff.find((s) => s.id === teacherId);

  return (
    <Div type="col" gap="lg">
      <PageHeader title={SCHOOL_TIMETABLE_PAGE.employee.title} />

      {/* Filter */}
      <Div variant="glass-sm" padding="p-4">
        <Div type="row" gap="md" align="end" wrap>
          <Div type="col" gap="xs">
            <FilterLabel>{SCHOOL_TIMETABLE_PAGE.employee.selectTeacher}</FilterLabel>
            <Select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              width="md"
              disabled={isLoadingStaff}
            >
              <option value="">— Select Teacher —</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </Div>
          {selectedTeacher && !isLoading && entries.length > 0 && (
            <Div type="col" gap="xs">
              <FilterLabel>Total Periods</FilterLabel>
              <Badge variant="primary" className="text-sm px-3 py-1.5 h-9 flex items-center">
                {entries.length} assigned
              </Badge>
            </Div>
          )}
        </Div>
      </Div>

      {/* States */}
      {isLoading ? (
        <Div variant="glass" padding="py-20" type="col" align="center" gap="sm">
          <Spinner />
          <P size="sm" color="muted">Loading schedule…</P>
        </Div>
      ) : !teacherId ? (
        <Div variant="glass" padding="py-20 px-8" type="col" align="center" gap="sm">
          <Div variant="theme-icon-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </Div>
          <P size="sm" color="muted">Select a teacher to view their weekly schedule</P>
        </Div>
      ) : entries.length === 0 ? (
        <Div variant="glass" padding="py-16 px-8" type="col" align="center" gap="sm">
          <Div variant="icon-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </Div>
          <P size="sm" color="muted">No schedule assigned for {selectedTeacher?.name}</P>
        </Div>
      ) : (
        <Div variant="glass" padding="p-5" type="col" gap="md">
          <Div type="row" align="center" justify="between">
            <SectionLabel>Weekly Schedule — {selectedTeacher?.name}</SectionLabel>
            <Badge variant="default" className="text-xs">{periods.length} Periods</Badge>
          </Div>

          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 border-b border-r border-border/50 bg-muted/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28">
                    Day
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p}
                      className="border-b border-r border-border/50 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide min-w-[160px]"
                      style={{ background: 'var(--theme-glow-soft)', color: 'var(--theme-gradient-from)' }}
                    >
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, idx) => {
                  const hasAnyEntry = periods.some((p) => getCell(day, p) !== null);
                  return (
                    <tr key={day} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/10'}>
                      <td className="sticky left-0 z-10 border-b border-r border-border/50 bg-inherit px-4 py-3">
                        <Div type="col" gap="xs">
                          <span className="text-sm font-semibold text-foreground">{dayLabels[day]}</span>
                          {!hasAnyEntry && (
                            <span className="text-[10px] text-muted-foreground/50">No class</span>
                          )}
                        </Div>
                      </td>
                      {periods.map((p) => {
                        const cell = getCell(day, p);
                        return (
                          <td
                            key={p}
                            className="border-b border-r border-border/50 px-3 py-2.5 align-top transition-colors hover:bg-muted/20"
                          >
                            {cell ? (
                              <Div type="col" gap="xs">
                                <span className="text-sm font-semibold text-foreground leading-snug">
                                  {cell.subject_name ?? <span className="text-muted-foreground/50 font-normal text-xs">No Subject</span>}
                                </span>
                                <span className="text-xs text-muted-foreground leading-none">
                                  {[cell.class_name, cell.class_detail_name].filter(Boolean).join(' / ')}
                                </span>
                                <span className="text-[10px] text-muted-foreground/50 leading-none truncate max-w-[140px]">
                                  {cell.timetable_name}
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
