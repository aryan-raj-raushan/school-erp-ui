'use client';

import { useCreateTimetable } from '@/hooks/useCreateTimetable';
import { SCHOOL_TIMETABLE_PAGE, DAYS_OF_WEEK, DAY_LABELS, MAX_PERIODS_OPTIONS } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button, Spinner, Input, Select, FilterLabel, FormField,
} from '@/components/ui';

export default function NewTimetablePage() {
  const {
    years, classes, classDetails, subjects, staff,
    name, setName,
    academicYearId, setAcademicYearId,
    classId, setClassId,
    classDetailId, setClassDetailId,
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
      <PageHeader
        title={SCHOOL_TIMETABLE_PAGE.form.createTitle}
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
            <Select value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)} defaultValue="">
              <option value="">{SCHOOL_TIMETABLE_PAGE.placeholders.selectAcademicYear}</option>
              {years.map((y) => <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>)}
            </Select>
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.class}>
            <Select value={classId} onChange={(e) => setClassId(e.target.value)} defaultValue="">
              <option value="">{SCHOOL_TIMETABLE_PAGE.placeholders.selectClass}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.classDetail}>
            <Select value={classDetailId} onChange={(e) => setClassDetailId(e.target.value)} defaultValue="" disabled={!classId}>
              <option value="">{SCHOOL_TIMETABLE_PAGE.placeholders.selectClassDetail}</option>
              {classDetails.map((cd) => <option key={cd.id} value={cd.id}>{cd.name}</option>)}
            </Select>
          </FormField>
          <FormField label={SCHOOL_TIMETABLE_PAGE.form.classTeacher}>
            <Select value={classTeacherId} onChange={(e) => setClassTeacherId(e.target.value)} defaultValue="">
              <option value="">{SCHOOL_TIMETABLE_PAGE.placeholders.selectTeacher}</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </FormField>
        </Div>
      </Div>

      <Div type="col" gap="sm">
        <p className="text-sm font-semibold">{SCHOOL_TIMETABLE_PAGE.form.periodTimes}</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border px-2 py-1 font-medium text-left">Period</th>
                {periods.map((p) => (
                  <th key={p} className="border px-2 py-1 font-medium text-center">P{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1 text-muted-foreground text-xs">Start</td>
                {periods.map((p) => (
                  <td key={p} className="border px-1 py-1">
                    <Input
                      type="time"
                      className="w-24 text-xs"
                      value={periodTimes.find((pt) => pt.period_number === p)?.start_time ?? ''}
                      onChange={(e) => setPeriodTime(p, 'start_time', e.target.value)}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border px-2 py-1 text-muted-foreground text-xs">End</td>
                {periods.map((p) => (
                  <td key={p} className="border px-1 py-1">
                    <Input
                      type="time"
                      className="w-24 text-xs"
                      value={periodTimes.find((pt) => pt.period_number === p)?.end_time ?? ''}
                      onChange={(e) => setPeriodTime(p, 'end_time', e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Div>

      <Div type="col" gap="sm">
        <p className="text-sm font-semibold">Timetable Grid</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border px-2 py-1 text-left font-medium w-20">Day</th>
                {periods.map((p) => (
                  <th key={p} className="border px-2 py-1 text-center font-medium min-w-[140px]">P{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => (
                <tr key={day}>
                  <td className="border px-2 py-1 font-medium bg-muted/50">{DAY_LABELS[day]}</td>
                  {periods.map((p) => (
                    <td key={p} className="border px-1 py-1">
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
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Div>

      <Div type="row" gap="md">
        <Button variant="outline" onClick={handleBack}>{SCHOOL_TIMETABLE_PAGE.form.cancel}</Button>
        <Button onClick={handleSubmit} loading={isSubmitting}>{SCHOOL_TIMETABLE_PAGE.form.submit}</Button>
      </Div>
    </Div>
  );
}
