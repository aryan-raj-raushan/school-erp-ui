'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateTimetable } from '@/hooks/useCreateTimetable';
import { useAutoGenerateTimetable } from '@/hooks/useAutoGenerateTimetable';
import { SCHOOL_TIMETABLE_PAGE, DAYS_OF_WEEK, DAY_LABELS, MAX_PERIODS_OPTIONS, ROUTES } from '@/constants';
import {
  Div, Button, Spinner, Input, FormField, P, Badge, Tabs,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell,
  TableBody, TableRow, TableCell,
  ResponsiveSelect,
} from '@/components/ui';

const TAB_OPTIONS = [
  { value: 'auto', label: SCHOOL_TIMETABLE_PAGE.autoGenerate.tabLabel },
  { value: 'manual', label: SCHOOL_TIMETABLE_PAGE.autoGenerate.manualTabLabel },
] as const;

type TabValue = (typeof TAB_OPTIONS)[number]['value'];

export default function NewTimetablePage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabValue>('auto');

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={SCHOOL_TIMETABLE_PAGE.form.createTitle}
        backButton
        actions={<Button variant="outline" onClick={() => router.push(ROUTES.timetable)}>{SCHOOL_TIMETABLE_PAGE.form.cancel}</Button>}
      />

      <Tabs options={TAB_OPTIONS} value={tab} onChange={setTab} className="max-w-xs" />

      {tab === 'auto' ? <AutoGenerateForm /> : <ManualForm />}
    </Div>
  );
}

function AutoGenerateForm() {
  const {
    name, setName,
    years, academicYearId, setAcademicYearId,
    classes, classId, setClassId,
    timings, schoolTimingId, setSchoolTimingId,
    lunchAfterPeriod, setLunchAfterPeriod,
    lunchDurationMinutes, setLunchDurationMinutes,
    preview,
    mappings, isLoadingMappings,
    isLoadingData, isSubmitting,
    generate, handleBack,
  } = useAutoGenerateTimetable();

  if (isLoadingData) {
    return <Div type="col" align="center" justify="center" className="py-20"><Spinner /></Div>;
  }

  const canGenerate = !!academicYearId && !!classId && !!schoolTimingId && mappings.length > 0;

  return (
    <PageCol>
      <Div type="col" gap="md" className="max-w-3xl rounded-xl border border-border bg-card p-5">
        <Div type="grid" cols={2} gap="md">
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.name}>
            <Input placeholder={SCHOOL_TIMETABLE_PAGE.placeholders.name} value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.academicYear}>
            <ResponsiveSelect
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
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
          <FormField label={SCHOOL_TIMETABLE_PAGE.autoGenerate.timingLabel}>
            <ResponsiveSelect
              value={schoolTimingId}
              onChange={(e) => setSchoolTimingId(e.target.value)}
              customPlaceholder={SCHOOL_TIMETABLE_PAGE.autoGenerate.selectTiming}
              options={timings.map((t) => ({ value: t.id, label: t.name }))}
            />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.autoGenerate.lunchAfterLabel}>
            <Input
              type="number"
              min={1}
              max={Math.max(1, mappings.length - 1)}
              placeholder={SCHOOL_TIMETABLE_PAGE.autoGenerate.lunchAfterPlaceholder}
              value={lunchAfterPeriod}
              onChange={(e) => setLunchAfterPeriod(e.target.value ? Number(e.target.value) : '')}
            />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.autoGenerate.lunchDurationLabel}>
            <Input
              type="number"
              min={5}
              max={180}
              placeholder={SCHOOL_TIMETABLE_PAGE.autoGenerate.lunchDurationPlaceholder}
              value={lunchDurationMinutes}
              onChange={(e) => setLunchDurationMinutes(e.target.value ? Number(e.target.value) : '')}
            />
          </FormField>
        </Div>
      </Div>

      {preview && (
        <Div type="col" gap="xs" className="max-w-3xl rounded-xl border border-border bg-card p-5">
          <P size="sm" weight="semibold">{SCHOOL_TIMETABLE_PAGE.autoGenerate.previewSummaryTitle}</P>
          <Div type="row" gap="xs" wrap>
            <Badge variant="default">Total school day: {preview.totalLabel}</Badge>
            {preview.lunchMinutes > 0 && (
              <Badge variant="warning">Lunch: {preview.lunchMinutes}m after period {lunchAfterPeriod}</Badge>
            )}
            {preview.periodCount > 0 && (
              <Badge variant="info">
                {preview.periodCount} periods × ~{Math.round(preview.periodDurationMinutes)}m each
              </Badge>
            )}
          </Div>
        </Div>
      )}

      {classId && (
        <Div type="col" gap="sm" className="max-w-3xl rounded-xl border border-border bg-card p-5">
          <P size="sm" weight="semibold">{SCHOOL_TIMETABLE_PAGE.autoGenerate.previewTitle}</P>
          {isLoadingMappings ? (
            <Spinner size="sm" />
          ) : mappings.length === 0 ? (
            <P size="sm" className="text-muted-foreground">
              {SCHOOL_TIMETABLE_PAGE.autoGenerate.noMapping}{' '}
              <Link href={ROUTES.subjectTeacherMap} className="text-primary underline">
                {SCHOOL_TIMETABLE_PAGE.autoGenerate.noMappingLink}
              </Link>
            </P>
          ) : (
            <Div type="row" gap="xs" wrap>
              {mappings.map((m) => (
                <Badge key={m.id} variant="info">{m.subject_name} — {m.teacher_name}</Badge>
              ))}
            </Div>
          )}
        </Div>
      )}

      <Div type="row" gap="md">
        <Button variant="outline" onClick={handleBack}>{SCHOOL_TIMETABLE_PAGE.form.cancel}</Button>
        <Button onClick={generate} loading={isSubmitting} disabled={!canGenerate}>
          {SCHOOL_TIMETABLE_PAGE.autoGenerate.generateButton}
        </Button>
      </Div>
    </PageCol>
  );
}

function ManualForm() {
  const {
    years, classes, subjects, staff,
    name, setName,
    academicYearId, setAcademicYearId,
    classId, setClassId,
    maxPeriods, setMaxPeriods,
    classTeacherId, setClassTeacherId,
    periodTimes, setPeriodTime,
    grid, setCellValue,
    periods,
    isLoadingData, isSubmitting,
    handleSubmit, handleBack,
  } = useCreateTimetable();

  if (isLoadingData) {
    return <Div type="col" align="center" justify="center" className="py-20"><Spinner /></Div>;
  }

  return (
    <Div type="col" gap="lg">
      <Div type="col" gap="md" className="max-w-3xl">
        <Div type="grid" cols={2} gap="md">
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.name}>
            <Input placeholder={SCHOOL_TIMETABLE_PAGE.placeholders.name} value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.maxPeriods}>
            <ResponsiveSelect
              value={String(maxPeriods)}
              onChange={(e) => setMaxPeriods(Number(e.target.value))}
              options={MAX_PERIODS_OPTIONS.map((n) => ({ value: String(n), label: `${n} Periods` }))}
            />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.academicYear}>
            <ResponsiveSelect
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              defaultValue=""
              customPlaceholder={SCHOOL_TIMETABLE_PAGE.placeholders.selectAcademicYear}
              options={years.map((y) => ({ value: y.id, label: `${y.name}${y.is_current ? ' (Current)' : ''}` }))}
            />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.class}>
            <ResponsiveSelect
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              defaultValue=""
              customPlaceholder={SCHOOL_TIMETABLE_PAGE.placeholders.selectClass}
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.classTeacher}>
            <ResponsiveSelect
              value={classTeacherId}
              onChange={(e) => setClassTeacherId(e.target.value)}
              defaultValue=""
              customPlaceholder={SCHOOL_TIMETABLE_PAGE.placeholders.selectTeacher}
              options={staff.map((s) => ({ value: s.id, label: s.name }))}
            />
          </FormField>
        </Div>
      </Div>

      <Div type="col" gap="sm">
        <P size="sm" weight="semibold">{SCHOOL_TIMETABLE_PAGE.form.periodTimes}</P>
        <Div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>Period</TableHeaderCell>
                {periods.map((p) => (
                  <TableHeaderCell key={p} className="text-center">P{p}</TableHeaderCell>
                ))}
              </TableHeadRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className="text-muted-foreground text-xs">Start</TableCell>
                {periods.map((p) => (
                  <TableCell key={p}>
                    <Input
                      type="time"
                      className="w-24 text-xs"
                      value={periodTimes.find((pt) => pt.period_number === p)?.start_time ?? ''}
                      onChange={(e) => setPeriodTime(p, 'start_time', e.target.value)}
                    />
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground text-xs">End</TableCell>
                {periods.map((p) => (
                  <TableCell key={p}>
                    <Input
                      type="time"
                      className="w-24 text-xs"
                      value={periodTimes.find((pt) => pt.period_number === p)?.end_time ?? ''}
                      onChange={(e) => setPeriodTime(p, 'end_time', e.target.value)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </Div>
      </Div>

      <Div type="col" gap="sm">
        <P size="sm" weight="semibold">Timetable Grid</P>
        <Div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>Day</TableHeaderCell>
                {periods.map((p) => (
                  <TableHeaderCell key={p} className="text-center min-w-35">P{p}</TableHeaderCell>
                ))}
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {DAYS_OF_WEEK.map((day) => (
                <TableRow key={day}>
                  <TableCell className="bg-muted/50"><P weight="semibold">{DAY_LABELS[day]}</P></TableCell>
                  {periods.map((p) => (
                    <TableCell key={p}>
                      <Div type="col" gap="xs">
                        <ResponsiveSelect
                          value={grid[day]?.[p]?.subject_id ?? ''}
                          onChange={(e) => setCellValue(day, p, 'subject_id', e.target.value)}
                          className="text-xs"
                          customPlaceholder="Subject"
                          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                        />
                        <ResponsiveSelect
                          value={grid[day]?.[p]?.teacher_id ?? ''}
                          onChange={(e) => setCellValue(day, p, 'teacher_id', e.target.value)}
                          className="text-xs"
                          customPlaceholder="Teacher"
                          options={staff.map((s) => ({ value: s.id, label: s.name }))}
                        />
                      </Div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Div>
      </Div>

      <Div type="row" gap="md">
        <Button variant="outline" onClick={handleBack}>{SCHOOL_TIMETABLE_PAGE.form.cancel}</Button>
        <Button onClick={handleSubmit} loading={isSubmitting}>{SCHOOL_TIMETABLE_PAGE.form.submit}</Button>
      </Div>
    </Div>
  );
}
