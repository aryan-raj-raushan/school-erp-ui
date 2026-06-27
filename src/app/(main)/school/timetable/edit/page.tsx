'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';
import { useEditTimetable } from '@/hooks/useEditTimetable';
import { SCHOOL_TIMETABLE_PAGE, DAYS_OF_WEEK, DAY_LABELS, MAX_PERIODS_OPTIONS } from '@/constants';
import {
  Div, Button, Spinner, Input, Select, FormField, P,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell,
  TableBody, TableRow, TableCell,
} from '@/components/ui';

function EditTimetablePageInner() {
  const _searchParams = useSearchParams();
  const id = _searchParams.get('id') ?? '';

  const {
    years, classes, classDetails, subjects, staff,
    name, setName,
    academicYearId, setAcademicYearId,
    classId, setClassId, loadClassDetails,
    classDetailId, setClassDetailId,
    maxPeriods, setMaxPeriods,
    classTeacherId, setClassTeacherId,
    periodTimes, setPeriodTime,
    grid, setCellValue,
    periods,
    isLoadingData, isSubmitting,
    handleSubmit, handleBack,
  } = useEditTimetable(id);

  if (isLoadingData) {
    return <Div type="col" align="center" justify="center" className="py-20"><Spinner /></Div>;
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={SCHOOL_TIMETABLE_PAGE.form.editTitle}
        actions={<Button variant="outline" onClick={handleBack}>{SCHOOL_TIMETABLE_PAGE.form.cancel}</Button>}
      />

      <Div type="col" gap="md" className="max-w-3xl">
        <Div type="grid" cols={2} gap="md">
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.name}>
            <Input placeholder={SCHOOL_TIMETABLE_PAGE.placeholders.name} value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.maxPeriods}>
            <Select value={String(maxPeriods)} onChange={(e) => setMaxPeriods(Number(e.target.value))}>
              {MAX_PERIODS_OPTIONS.map((n) => <option key={n} value={n}>{n} Periods</option>)}
            </Select>
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.academicYear}>
            <Select value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
              <option value="">{SCHOOL_TIMETABLE_PAGE.placeholders.selectAcademicYear}</option>
              {years.map((y) => <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>)}
            </Select>
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.class}>
            <Select value={classId} onChange={(e) => { setClassId(e.target.value); loadClassDetails(e.target.value); }}>
              <option value="">{SCHOOL_TIMETABLE_PAGE.placeholders.selectClass}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.classDetail}>
            <Select value={classDetailId} onChange={(e) => setClassDetailId(e.target.value)} disabled={!classId}>
              <option value="">{SCHOOL_TIMETABLE_PAGE.placeholders.selectClassDetail}</option>
              {classDetails.map((cd) => <option key={cd.id} value={cd.id}>{cd.name}</option>)}
            </Select>
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.classTeacher}>
            <Select value={classTeacherId} onChange={(e) => setClassTeacherId(e.target.value)}>
              <option value="">{SCHOOL_TIMETABLE_PAGE.placeholders.selectTeacher}</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
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
                        <Select
                          value={grid[day]?.[p]?.subject_id ?? ''}
                          onChange={(e) => setCellValue(day, p, 'subject_id', e.target.value)}
                          className="text-xs"
                        >
                          <option value="">Subject</option>
                          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                        <Select
                          value={grid[day]?.[p]?.teacher_id ?? ''}
                          onChange={(e) => setCellValue(day, p, 'teacher_id', e.target.value)}
                          className="text-xs"
                        >
                          <option value="">Teacher</option>
                          {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
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

export default function EditTimetablePage() {
  return (
    <Suspense fallback={<Div type="col" align="center" justify="center" className="py-20"><Spinner /></Div>}>
      <EditTimetablePageInner />
    </Suspense>
  );
}
