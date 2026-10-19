'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';
import { Plus, X } from 'lucide-react';
import { useEditTimetable } from '@/hooks/useEditTimetable';
import { SCHOOL_TIMETABLE_PAGE, DAYS_OF_WEEK, DAY_LABELS } from '@/constants';
import { timeToMinutes, formatDuration } from '@/lib/time.utils';
import { useIsMobileSync } from '@/hooks/useIsMobileSync';
import { TimetableDayEditor } from '@/components/timetable/TimetableDayEditor';
import { TimetableGridEditor } from '@/components/timetable/TimetableGridEditor';
import type { PeriodTimeDto } from '@/services/timetable.service';
import {
  Div, Button, Spinner, Input, FormField, P, Badge,
  PageHeader, SectionCard,
  ResponsiveSelect,
} from '@/components/ui';

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

  const isMobile = useIsMobileSync();

  if (isLoadingData) {
    return <Div type="col" align="center" justify="center" className="py-20"><Spinner /></Div>;
  }

  function isBreakPeriod(period: number): boolean {
    return periodTimes.find((pt) => pt.period_number === period)?.is_break ?? false;
  }

  return (
    <Div type="col" gap="lg">
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
          <Button
            type="button"
            variant="outline"
            onClick={addPeriod}
            className="h-auto min-w-[136px] shrink-0 flex-col gap-1 rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus size={16} />
            <P size="xs">Add Period</P>
          </Button>
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

      {isMobile ? (
        <SectionCard title="Weekly Schedule" subtitle="Pick a day, then set each period">
          <Div className="p-4">
            <TimetableDayEditor
              days={DAYS_OF_WEEK}
              periods={periods}
              isBreak={isBreakPeriod}
              timeLabel={(p) => periodTimeRangeLabel(periodTimes.find((x) => x.period_number === p))}
              getCell={(day, p) => grid[day]?.[p]}
              subjects={subjects}
              staff={staff}
              onChange={setCellValue}
            />
          </Div>
        </SectionCard>
      ) : (
      <SectionCard title="Weekly Schedule" subtitle="Grab the ⠿ handle on any period to swap it with another">
        <TimetableGridEditor
          days={DAYS_OF_WEEK}
          dayLabels={DAY_LABELS}
          periods={periods}
          periodTimes={periodTimes}
          timeRangeLabel={periodTimeRangeLabel}
          grid={grid}
          subjects={subjects}
          staff={staff}
          onChange={setCellValue}
          onSwap={swapCells}
        />
      </SectionCard>
      )}

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
