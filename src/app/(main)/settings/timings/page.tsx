'use client';

import { useSchoolTimings } from '@/hooks/useSchoolTimings';
import {
  Div,
  Button,
  Badge,
  PageHeader,
  PageCol,
  Input,
  FormField,
  EmptyState,
  ResponsiveModalContainer,
  ResponsiveSelect,
  PageHeaderConfig,
  Span,
} from '@/components/ui';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import {
  TIMINGS_PAGE,
  TIMING_TYPE_OPTIONS,
  TIMING_TYPE_BADGE,
  WORKING_DAY_OPTIONS,
  DEFAULT_WORKING_DAYS,
} from '@/constants/school-settings.constants';
import { useState } from 'react';
import { Clock, CalendarRange, Pencil, Trash2 } from 'lucide-react';
import type { SchoolTiming, CreateSchoolTimingPayload } from '@/types/school-settings.types';
import { useIsMobile } from '@/hooks/use-mobile';

function fmtTime(t: string | null | undefined) {
  if (!t) return null;
  return t.length > 5 ? t.slice(0, 5) : t;
}

function fmtDate(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1]} ${y}`;
}

const DAY_SHORT: Record<string, string> = {
  MON: 'M', TUE: 'T', WED: 'W', THU: 'T', FRI: 'F', SAT: 'S', SUN: 'Su',
};
const ALL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const EMPTY_FORM: CreateSchoolTimingPayload = {
  name: '',
  timing_type: 'DEFAULT',
  school_start_time: '08:00',
  school_end_time: '14:00',
  grace_period_minutes: 10,
  late_cutoff_time: '08:15',
  half_day_cutoff_time: '10:30',
  absent_cutoff_time: '12:00',
  working_days: DEFAULT_WORKING_DAYS,
  period_duration_minutes: 45,
  lunch_start_time: '',
  lunch_end_time: '',
  effective_from: '',
  effective_to: '',
  priority: 0,
};

export default function TimingsPage() {
  const isMobile = useIsMobile();
  const {
    timings, isLoading, isSubmitting, isDialogOpen,
    editingTiming, openCreate, openEdit, closeDialog, submit, remove,
  } = useSchoolTimings();
  const [form, setForm] = useState<CreateSchoolTimingPayload>(EMPTY_FORM);

  const handleOpenCreate = () => { setForm(EMPTY_FORM); openCreate(); };

  const handleOpenEdit = (t: SchoolTiming) => {
    setForm({
      name: t.name,
      timing_type: t.timing_type,
      school_start_time: fmtTime(t.school_start_time) ?? '08:00',
      school_end_time: fmtTime(t.school_end_time) ?? '14:00',
      grace_period_minutes: t.grace_period_minutes,
      late_cutoff_time: fmtTime(t.late_cutoff_time) ?? '',
      half_day_cutoff_time: fmtTime(t.half_day_cutoff_time) ?? '',
      absent_cutoff_time: fmtTime(t.absent_cutoff_time) ?? '',
      working_days: t.working_days,
      period_duration_minutes: t.period_duration_minutes,
      lunch_start_time: fmtTime(t.lunch_start_time) ?? '',
      lunch_end_time: fmtTime(t.lunch_end_time) ?? '',
      effective_from: t.effective_from,
      effective_to: t.effective_to,
      priority: t.priority,
    });
    openEdit(t);
  };

  const updateForm = <K extends keyof CreateSchoolTimingPayload>(
    key: K, value: CreateSchoolTimingPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleDay = (day: string) => {
    const days = form.working_days?.split(',').filter(Boolean) ?? [];
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    updateForm('working_days', next.join(','));
  };

  const columns: ColumnDef<SchoolTiming>[] = [
    {
      id: 'schedule',
      header: 'Schedule',
      meta: { primary: true },
      cell: ({ row }) => {
        const t = row.original;
        const badge = TIMING_TYPE_BADGE[t.timing_type];
        const activeDays = t.working_days.split(',').filter(Boolean);
        return (
          <Div className="flex items-center gap-3 py-0.5">
            <Div className="flex flex-col gap-1">
              <Div className="flex items-center gap-2">
                <Div className="font-semibold text-foreground text-sm">{t.name}</Div>
                <Badge variant={badge.variant as 'warning'}>{badge.label}</Badge>
                {!t.is_active && (
                  <Badge variant="default">Inactive</Badge>
                )}
              </Div>
              <Div className="flex items-center gap-1">
                {ALL_DAYS.map((day) => {
                  const active = activeDays.includes(day);
                  return (
                    <Span
                      key={day}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/40 text-muted-foreground/40'
                      }`}
                    >
                      {DAY_SHORT[day]}
                    </Span>
                  );
                })}
              </Div>
            </Div>
          </Div>
        );
      },
    },
    {
      id: 'hours',
      header: 'School Hours',
      cell: ({ row }) => {
        const t = row.original;
        return (
          <Div className="flex items-start gap-3 py-0.5">
            <Div className="flex items-center gap-1.5 shrink-0">
              <Clock size={13} className="text-muted-foreground" />
              <Span className="text-sm font-medium tabular-nums whitespace-nowrap">
                {fmtTime(t.school_start_time)} – {fmtTime(t.school_end_time)}
              </Span>
            </Div>
            <Div className="flex items-center gap-1.5 flex-wrap">
              <Span className="inline-flex px-1.5 py-0.5 rounded bg-muted/60 text-[11px] font-medium whitespace-nowrap">
                Grace {t.grace_period_minutes}m
              </Span>
              <Span className="inline-flex px-1.5 py-0.5 rounded bg-muted/60 text-[11px] font-medium whitespace-nowrap">
                {t.period_duration_minutes}m/period
              </Span>
              <Span className="text-[11px] text-muted-foreground">P{t.priority}</Span>
              {t.lunch_start_time && t.lunch_end_time && (
                <Span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  Lunch {fmtTime(t.lunch_start_time)}–{fmtTime(t.lunch_end_time)}
                </Span>
              )}
            </Div>
          </Div>
        );
      },
    },
    {
      id: 'cutoffs',
      header: 'Cutoff Times',
      cell: ({ row }) => {
        const t = row.original;
        const items = [
          { label: 'Late', time: fmtTime(t.late_cutoff_time), color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Half day', time: fmtTime(t.half_day_cutoff_time), color: 'text-orange-600 dark:text-orange-400' },
          { label: 'Absent', time: fmtTime(t.absent_cutoff_time), color: 'text-red-500 dark:text-red-400' },
        ].filter((i) => i.time);

        if (!items.length) return <Span className="text-muted-foreground/40 text-xs">—</Span>;

        return (
          <Div type="col" gap="xs" className="py-0.5">
            {items.map(({ label, time, color }) => (
              <Span key={label} className="inline-flex items-center gap-1.5">
                <Span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</Span>
                <Span className="text-muted-foreground/40">–</Span>
                <Span className={`text-xs font-semibold tabular-nums ${color}`}>{time}</Span>
              </Span>
            ))}
          </Div>
        );
      },
    },
    {
      id: 'period',
      header: 'Effective Period',
      cell: ({ row }) => {
        const t = row.original;
        return (
          <Div className="flex items-center gap-2 py-0.5">
            <CalendarRange size={13} className="text-muted-foreground shrink-0" />
            <Div className="flex items-center gap-1.5">
              <Span className="text-xs text-foreground whitespace-nowrap">{fmtDate(t.effective_from)}</Span>
              <Span className="text-xs text-muted-foreground">→</Span>
              <Span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(t.effective_to)}</Span>
            </Div>
          </Div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const t = row.original;
        return (
          <Div className="flex items-center justify-end gap-1">
            <Button
              onClick={(e) => { e.stopPropagation(); handleOpenEdit(t); }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Edit"
              variant={'outline'}
              size={'icon'}
            >
              <Pencil size={14} />
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); remove(t.id); }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete"
              variant={'ghost'}
              size={'icon'}
            >
              <Trash2 size={14} />
            </Button>
          </Div>
        );
      },
    },
  ];

  const pageHeaderConfig: PageHeaderConfig = {
      title: TIMINGS_PAGE.title,
      subtitle: TIMINGS_PAGE.subtitle,
      actions: [
        {
          label: TIMINGS_PAGE.addButton,
          onClick: () => handleOpenCreate(),
        },
      ],
      backButton: isMobile,
    };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig}
      />

      {!isLoading && timings.length === 0 ? (
        <EmptyState
          title="No timing schedules yet"
          description="Add seasonal or special schedules to control school hours and late rules"
          action={{ label: TIMINGS_PAGE.addButton, onClick: handleOpenCreate }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={timings}
          isLoading={isLoading}
          emptyText="No timing schedules found"
          pinnedColumns={['schedule']}
        />
      )}

      <ResponsiveModalContainer
        isOpen={isDialogOpen}
        onClose={closeDialog}
        title={editingTiming ? 'Edit Timing Schedule' : 'New Timing Schedule'}
      >
          <Div className="px-4 py-4">
            <Div type="col" gap="md">
              <Div type="grid" cols={2} gap="md">
                <FormField label="Name">
                  <Input
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="e.g. Summer Schedule"
                  />
                </FormField>
                <FormField label="Type">
                  <ResponsiveSelect
                    value={form.timing_type}
                    onChange={(e) => updateForm('timing_type', e.target.value as typeof form.timing_type)}
                    options={TIMING_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  />
                </FormField>
                <FormField label="Start Time">
                  <Input type="time" value={form.school_start_time} onChange={(e) => updateForm('school_start_time', e.target.value)} />
                </FormField>
                <FormField label="End Time">
                  <Input type="time" value={form.school_end_time} onChange={(e) => updateForm('school_end_time', e.target.value)} />
                </FormField>
                <FormField label="Grace Period (min)">
                  <Input type="number" value={form.grace_period_minutes ?? ''} onChange={(e) => updateForm('grace_period_minutes', Number(e.target.value))} />
                </FormField>
                <FormField label="Late Cutoff">
                  <Input type="time" value={form.late_cutoff_time ?? ''} onChange={(e) => updateForm('late_cutoff_time', e.target.value)} />
                </FormField>
                <FormField label="Half Day Cutoff">
                  <Input type="time" value={form.half_day_cutoff_time ?? ''} onChange={(e) => updateForm('half_day_cutoff_time', e.target.value)} />
                </FormField>
                <FormField label="Absent Cutoff">
                  <Input type="time" value={form.absent_cutoff_time ?? ''} onChange={(e) => updateForm('absent_cutoff_time', e.target.value)} />
                </FormField>
                <FormField label="Period Duration (min)">
                  <Input type="number" value={form.period_duration_minutes ?? ''} onChange={(e) => updateForm('period_duration_minutes', Number(e.target.value))} />
                </FormField>
                <FormField label="Lunch Start">
                  <Input type="time" value={form.lunch_start_time ?? ''} onChange={(e) => updateForm('lunch_start_time', e.target.value)} />
                </FormField>
                <FormField label="Lunch End">
                  <Input type="time" value={form.lunch_end_time ?? ''} onChange={(e) => updateForm('lunch_end_time', e.target.value)} />
                </FormField>
                <FormField label="Effective From">
                  <Input type="date" value={form.effective_from} onChange={(e) => updateForm('effective_from', e.target.value)} />
                </FormField>
                <FormField label="Effective To">
                  <Input type="date" value={form.effective_to} onChange={(e) => updateForm('effective_to', e.target.value)} />
                </FormField>
                <FormField label="Priority">
                  <Input type="number" value={form.priority ?? 0} onChange={(e) => updateForm('priority', Number(e.target.value))} />
                </FormField>
              </Div>

              <FormField label="Working Days">
                <Div type="row" wrap gap="sm" className="items-center">
                  {WORKING_DAY_OPTIONS.map((day) => {
                    const selected = (form.working_days ?? '').split(',').includes(day.value);
                    return (
                      <Button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`min-w-[44px] justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        variant={'outline'}
                      >
                        {day.label}
                      </Button>
                    );
                  })}
                </Div>
              </FormField>
            </Div>
          </Div>
          <Div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button loading={isSubmitting} onClick={() => submit(form)}>
              {editingTiming ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </Div>
      </ResponsiveModalContainer>
    </PageCol>
  );
}
