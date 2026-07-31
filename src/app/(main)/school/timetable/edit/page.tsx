'use client';

import { useSearchParams } from 'next/navigation';

import { Fragment, Suspense, useRef, useState } from 'react';
import { GripVertical, Plus, X, Coffee } from 'lucide-react';
import { useEditTimetable } from '@/hooks/useEditTimetable';
import { SCHOOL_TIMETABLE_PAGE, DAYS_OF_WEEK, DAY_LABELS } from '@/constants';
import { timeToMinutes, formatDuration } from '@/lib/time.utils';
import { cn } from '@/lib/utils';
import type { DayOfWeek, PeriodTimeDto } from '@/services/timetable.service';
import {
  Div, Button, Spinner, Input, FormField, P, Badge,
  PageHeader, SectionCard,
  ResponsiveSelect,
} from '@/components/ui';

interface DragPayload {
  day: DayOfWeek;
  period: number;
}

function periodDurationLabel(startTime?: string, endTime?: string): string | null {
  if (!startTime || !endTime) return null;
  return formatDuration(timeToMinutes(endTime) - timeToMinutes(startTime));
}

function periodTimeRangeLabel(pt?: PeriodTimeDto): string | null {
  if (!pt?.start_time || !pt?.end_time) return null;
  return `${pt.start_time}–${pt.end_time}`;
}

function EditTimetablePageInner() {
  const _searchParams = useSearchParams();
  const id = _searchParams.get('id') ?? '';

  const {
    years, classes, subjects, staff,
    name, setName,
    academicYearId, setAcademicYearId,
    classId, setClassId,
    classTeacherId, setClassTeacherId,
    periodTimes, setPeriodTime, addPeriod, removePeriod,
    grid, setCellValue, swapCells,
    periods, daySummary,
    isLoadingData, isSubmitting,
    handleSubmit, handleBack,
  } = useEditTimetable(id);

  const draggingRef = useRef<DragPayload | null>(null);
  const [dragOver, setDragOver] = useState<DragPayload | null>(null);

  if (isLoadingData) {
    return <Div type="col" align="center" justify="center" className="py-20"><Spinner /></Div>;
  }

  function isBreakPeriod(period: number): boolean {
    return periodTimes.find((pt) => pt.period_number === period)?.is_break ?? false;
  }

  function handleDrop(day: DayOfWeek, period: number) {
    const from = draggingRef.current;
    draggingRef.current = null;
    setDragOver(null);
    if (!from || isBreakPeriod(period)) return;
    swapCells(from.day, from.period, day, period);
  }

  return (
    <Div
      type="col"
      gap="lg"
      onDragEnd={() => { draggingRef.current = null; setDragOver(null); }}
    >
      <PageHeader
        title={SCHOOL_TIMETABLE_PAGE.form.editTitle}
        subtitle={name || undefined}
        backButton
        actions={
          <Div type="row" gap="sm">
            <Button variant="outline" onClick={handleBack}>{SCHOOL_TIMETABLE_PAGE.form.cancel}</Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>{SCHOOL_TIMETABLE_PAGE.form.submit}</Button>
          </Div>
        }
      />

      <SectionCard title="Timetable Details">
        <Div type="grid" cols={3} gap="md" className="p-5">
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.name}>
            <Input placeholder={SCHOOL_TIMETABLE_PAGE.placeholders.name} value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.academicYear}>
            <ResponsiveSelect
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              customPlaceholder={SCHOOL_TIMETABLE_PAGE.placeholders.selectAcademicYear}
              options={years.map((y) => ({ value: y.id, label: `${y.name}${y.is_current ? ' (Current)' : ''}` }))}
            />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.class}>
            <ResponsiveSelect
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              customPlaceholder={SCHOOL_TIMETABLE_PAGE.placeholders.selectClass}
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.classTeacher}>
            <ResponsiveSelect
              value={classTeacherId}
              onChange={(e) => setClassTeacherId(e.target.value)}
              customPlaceholder={SCHOOL_TIMETABLE_PAGE.placeholders.selectTeacher}
              options={staff.map((s) => ({ value: s.id, label: s.name }))}
            />
          </FormField>
        </Div>
      </SectionCard>

      <SectionCard title={SCHOOL_TIMETABLE_PAGE.form.periodTimes} subtitle="Add, remove or resize any period">
        <Div type="row" gap="sm" className="overflow-x-auto p-5">
          {periods.map((p) => {
            const pt = periodTimes.find((x) => x.period_number === p);
            const isBreak = pt?.is_break ?? false;
            const duration = periodDurationLabel(pt?.start_time, pt?.end_time);
            return (
              <Div key={p} className="flex min-w-[136px] shrink-0 flex-col gap-2 rounded-xl border border-border/60 bg-card p-3">
                <Div type="row" justify="between" align="center">
                  {isBreak ? <Badge variant="warning">Break</Badge> : <Badge variant="primary">Period {p}</Badge>}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removePeriod(p)}
                    disabled={periods.length <= 1}
                    title="Remove period"
                  >
                    <X size={12} />
                  </Button>
                </Div>
                <Input
                  type="time"
                  className="text-xs"
                  value={pt?.start_time ?? ''}
                  onChange={(e) => setPeriodTime(p, 'start_time', e.target.value)}
                />
                <Input
                  type="time"
                  className="text-xs"
                  value={pt?.end_time ?? ''}
                  onChange={(e) => setPeriodTime(p, 'end_time', e.target.value)}
                />
                {duration && <P size="xs" className="text-center">{duration}</P>}
              </Div>
            );
          })}
          <button
            type="button"
            onClick={addPeriod}
            className="flex min-w-[136px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus size={16} />
            <P size="xs">Add Period</P>
          </button>
        </Div>
      </SectionCard>

      {daySummary && (
        <Div type="row" gap="xs" wrap>
          <Badge variant="primary">School Day: {daySummary.totalLabel}</Badge>
          <Badge variant="info">{daySummary.teachingCount} teaching period{daySummary.teachingCount === 1 ? '' : 's'}</Badge>
          {daySummary.breakCount > 0 && (
            <Badge variant="warning">{daySummary.breakCount} break{daySummary.breakCount === 1 ? '' : 's'}</Badge>
          )}
        </Div>
      )}

      <SectionCard title="Weekly Schedule" subtitle="Grab the ⠿ handle on any period to swap it with another">
        <Div className="overflow-x-auto p-5">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `84px repeat(${periods.length}, minmax(152px, 1fr))` }}
          >
            <div className="sticky top-0 left-0 z-20 flex items-center justify-center rounded-lg bg-muted px-2 py-2">
              <P size="xs" weight="semibold" className="uppercase tracking-wide">Day</P>
            </div>
            {periods.map((p) => {
              const pt = periodTimes.find((x) => x.period_number === p);
              return (
                <div key={`head-${p}`} className="sticky top-0 z-10 flex flex-col items-center justify-center gap-0.5 rounded-lg bg-muted px-2 py-2">
                  {isBreakPeriod(p) ? <Badge variant="warning">Break</Badge> : <Badge variant="secondary">Period {p}</Badge>}
                  {periodTimeRangeLabel(pt) && <P size="xs" className="text-[10px]">{periodTimeRangeLabel(pt)}</P>}
                </div>
              );
            })}

            {DAYS_OF_WEEK.map((day) => (
              <Fragment key={day}>
                <div className="sticky left-0 z-10 flex items-center justify-center rounded-lg bg-muted/60 px-2 py-2">
                  <P weight="semibold" className="text-foreground">{DAY_LABELS[day]}</P>
                </div>
                {periods.map((p) => {
                  if (isBreakPeriod(p)) {
                    return (
                      <div
                        key={p}
                        className="flex flex-col items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50/60 py-3 dark:border-amber-900/40 dark:bg-amber-950/10"
                      >
                        <Coffee size={14} className="text-amber-500" />
                        <P size="xs">Break</P>
                      </div>
                    );
                  }
                  const cell = grid[day]?.[p];
                  const isFilled = !!(cell?.subject_id || cell?.teacher_id);
                  const isDragOver = dragOver?.day === day && dragOver?.period === p;
                  return (
                    <div
                      key={p}
                      onDragOver={(e) => { e.preventDefault(); setDragOver({ day, period: p }); }}
                      onDragLeave={() => setDragOver((prev) => (prev?.day === day && prev?.period === p ? null : prev))}
                      onDrop={(e) => { e.preventDefault(); handleDrop(day, p); }}
                      className={cn(
                        'flex flex-col gap-1.5 rounded-lg border p-2 transition-all',
                        isDragOver
                          ? 'border-primary bg-primary/10 ring-2 ring-primary ring-inset'
                          : isFilled
                            ? 'border-border/60 bg-card hover:border-primary/40 hover:shadow-sm'
                            : 'border-dashed border-border/50 bg-muted/10',
                      )}
                    >
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          draggable={isFilled}
                          onDragStart={() => { if (isFilled) draggingRef.current = { day, period: p }; }}
                          onDragEnd={() => { draggingRef.current = null; setDragOver(null); }}
                          disabled={!isFilled}
                          title={isFilled ? 'Drag to swap' : undefined}
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded text-muted-foreground',
                            isFilled ? 'cursor-grab hover:bg-muted active:cursor-grabbing' : 'opacity-0',
                          )}
                        >
                          <GripVertical size={12} />
                        </button>
                      </div>
                      <ResponsiveSelect
                        value={cell?.subject_id ?? ''}
                        onChange={(e) => setCellValue(day, p, 'subject_id', e.target.value)}
                        className="text-xs"
                        customPlaceholder="Subject"
                        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                      />
                      <ResponsiveSelect
                        value={cell?.teacher_id ?? ''}
                        onChange={(e) => setCellValue(day, p, 'teacher_id', e.target.value)}
                        className="text-xs"
                        customPlaceholder="Teacher"
                        options={staff.map((s) => ({ value: s.id, label: s.name }))}
                      />
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </Div>
      </SectionCard>

      <Div type="row" gap="md">
        <Button variant="outline" onClick={handleBack}>{SCHOOL_TIMETABLE_PAGE.form.cancel}</Button>
        <Button onClick={handleSubmit} loading={isSubmitting}>{SCHOOL_TIMETABLE_PAGE.form.submit}</Button>
      </Div>
    </Div>
  );
}

export default function EditTimetablePage() {
  return (
    <Suspense fallback={<Div type="col" align="center" justify="center" className="py-20"><Spinner /></Div>}>
      <EditTimetablePageInner />
    </Suspense>
  );
}
