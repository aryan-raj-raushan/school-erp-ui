'use client';

import { useCreateAcademicYear } from '@/hooks/useCreateAcademicYear';
import { ACADEMIC_YEARS_PAGE } from '@/constants';
import {
  Div, Button,
  FormField, Input, Select, Textarea,
  CheckboxLabel, Spinner,
  PageHeader, PageCol,
} from '@/components/ui';
import { useIsMobile } from '@/hooks/use-mobile';

export default function NewAcademicYearPage() {
  const isMobile = useIsMobile();
  const {
    form, isSubmitting,
    handleSubmit, handleBack, toggleIsEnabled, toggleIsCurrent,
  } = useCreateAcademicYear();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={ACADEMIC_YEARS_PAGE.form.createTitle}
        subtitle="Fill in the details below to create a new academic year"
        actions={
          <Button variant="outline" onClick={handleBack}>
            {ACADEMIC_YEARS_PAGE.form.cancel}
          </Button>
        }
        backButton={isMobile}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="md" className="max-w-2xl">
          <FormField label={ACADEMIC_YEARS_PAGE.form.name} error={form.formState.errors.name?.message}>
            <Input placeholder={ACADEMIC_YEARS_PAGE.placeholders.name} {...form.register('name')} />
          </FormField>

          <FormField label={ACADEMIC_YEARS_PAGE.form.sessionCode} error={form.formState.errors.session_code?.message}>
            <Input placeholder={ACADEMIC_YEARS_PAGE.placeholders.sessionCode} {...form.register('session_code')} />
          </FormField>

          <Div type="grid" cols={2} gap="md">
            <FormField label={ACADEMIC_YEARS_PAGE.form.startDate} error={form.formState.errors.start_date?.message}>
              <Input type="date" placeholder={ACADEMIC_YEARS_PAGE.placeholders.startDate} {...form.register('start_date')} />
            </FormField>
            <FormField label={ACADEMIC_YEARS_PAGE.form.endDate} error={form.formState.errors.end_date?.message}>
              <Input type="date" placeholder={ACADEMIC_YEARS_PAGE.placeholders.endDate} {...form.register('end_date')} />
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
              {ACADEMIC_YEARS_PAGE.form.submit}
            </Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
