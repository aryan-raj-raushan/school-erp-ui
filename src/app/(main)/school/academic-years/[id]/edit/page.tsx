'use client';

import { use } from 'react';
import { useEditAcademicYear } from '@/hooks/useEditAcademicYear';
import { ACADEMIC_YEARS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button,
  FormField, Input, Select, Textarea,
  CheckboxLabel, Spinner,
} from '@/components/ui';

export default function EditAcademicYearPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    form, sessions, isLoadingData, isSubmitting,
    handleSubmit, handleBack, toggleIsEnabled, toggleIsCurrent,
  } = useEditAcademicYear(id);

  if (isLoadingData) {
    return (
      <Div type="col" align="center" justify="center" className="py-20">
        <Spinner />
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={ACADEMIC_YEARS_PAGE.form.editTitle}
        subtitle="Update the details of this academic year"
        actions={
          <Button variant="outline" onClick={handleBack}>
            {ACADEMIC_YEARS_PAGE.form.cancel}
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="md" className="max-w-2xl">
          <FormField label={ACADEMIC_YEARS_PAGE.form.name} error={form.formState.errors.name?.message}>
            <Input placeholder={ACADEMIC_YEARS_PAGE.placeholders.name} {...form.register('name')} />
          </FormField>

          <FormField label={ACADEMIC_YEARS_PAGE.form.sessionCode} error={form.formState.errors.session_code?.message}>
            <Input placeholder={ACADEMIC_YEARS_PAGE.placeholders.sessionCode} {...form.register('session_code')} />
          </FormField>

          <FormField label={ACADEMIC_YEARS_PAGE.form.timetableSession} error={form.formState.errors.timetable_session_id?.message}>
            <Select {...form.register('timetable_session_id')}>
              <option value="" disabled>{ACADEMIC_YEARS_PAGE.placeholders.timetableSession}</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>

          <Div type="grid" cols={2} gap="md">
            <FormField label={ACADEMIC_YEARS_PAGE.form.startDate} error={form.formState.errors.start_date?.message}>
              <Input type="date" {...form.register('start_date')} />
            </FormField>
            <FormField label={ACADEMIC_YEARS_PAGE.form.endDate} error={form.formState.errors.end_date?.message}>
              <Input type="date" {...form.register('end_date')} />
            </FormField>
          </Div>

          <FormField label={ACADEMIC_YEARS_PAGE.form.description} error={form.formState.errors.description?.message}>
            <Textarea placeholder={ACADEMIC_YEARS_PAGE.placeholders.description} {...form.register('description')} />
          </FormField>

          <Div type="col" gap="sm">
            <Div type="row" align="center" gap="sm">
              <input
                type="checkbox"
                id="is_enabled"
                checked={form.watch('is_enabled')}
                onChange={toggleIsEnabled}
              />
              <CheckboxLabel htmlFor="is_enabled">{ACADEMIC_YEARS_PAGE.form.isEnabled}</CheckboxLabel>
            </Div>
            <Div type="row" align="center" gap="sm">
              <input
                type="checkbox"
                id="is_current"
                checked={form.watch('is_current')}
                onChange={toggleIsCurrent}
              />
              <CheckboxLabel htmlFor="is_current">{ACADEMIC_YEARS_PAGE.form.isActiveSeason}</CheckboxLabel>
            </Div>
          </Div>

          <Div type="row" gap="md">
            <Button type="button" variant="outline" onClick={handleBack}>
              {ACADEMIC_YEARS_PAGE.form.cancel}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {ACADEMIC_YEARS_PAGE.form.update}
            </Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
