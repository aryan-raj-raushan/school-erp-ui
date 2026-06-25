'use client';

import { useCreateClassDetail } from '@/hooks/useCreateClassDetail';
import { CLASS_DETAILS_PAGE, BEST_EXAM_COUNT_OPTIONS } from '@/constants';
import {
  Div, Button,
  FormField, Input, Select,
  CheckboxLabel, Spinner,
  PageHeader, PageCol,
} from '@/components/ui';

export default function NewClassDetailPage() {
  const {
    form, classes, isLoadingData, isSubmitting,
    handleSubmit, handleBack, toggleIsEnabled,
  } = useCreateClassDetail();

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
        title={CLASS_DETAILS_PAGE.form.createTitle}
        subtitle="Configure class detail for a session"
        actions={<Button variant="outline" onClick={handleBack}>{CLASS_DETAILS_PAGE.form.cancel}</Button>}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="md" className="max-w-2xl">
          <FormField label={CLASS_DETAILS_PAGE.form.class} error={form.formState.errors.class_id?.message}>
            <Select {...form.register('class_id')} defaultValue="">
              <option value="">{CLASS_DETAILS_PAGE.placeholders.class}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label={CLASS_DETAILS_PAGE.form.year} error={form.formState.errors.year?.message}>
            <Input placeholder={CLASS_DETAILS_PAGE.placeholders.year} {...form.register('year')} />
          </FormField>

          <Div type="grid" cols={2} gap="md">
            <FormField label={CLASS_DETAILS_PAGE.form.name} error={form.formState.errors.name?.message}>
              <Input placeholder={CLASS_DETAILS_PAGE.placeholders.name} {...form.register('name')} />
            </FormField>
            <FormField label={CLASS_DETAILS_PAGE.form.classCode} error={form.formState.errors.class_code?.message}>
              <Input placeholder={CLASS_DETAILS_PAGE.placeholders.classCode} {...form.register('class_code')} />
            </FormField>
          </Div>

          <FormField label={CLASS_DETAILS_PAGE.form.maxInternalExam} error={form.formState.errors.max_internal_exam?.message}>
            <Input type="number" min={0} {...form.register('max_internal_exam')} />
          </FormField>

          <FormField label={CLASS_DETAILS_PAGE.form.bestInternalExamCount} error={form.formState.errors.best_internal_exam_count?.message}>
            <Select {...form.register('best_internal_exam_count')}>
              {BEST_EXAM_COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
          </FormField>

          <FormField label={CLASS_DETAILS_PAGE.form.noOfElectiveSubjects} error={form.formState.errors.no_of_elective_subjects?.message}>
            <Input type="number" min={0} {...form.register('no_of_elective_subjects')} />
          </FormField>

          <Div type="row" align="center" gap="sm">
            <input
              type="checkbox"
              id="is_enabled"
              checked={form.watch('is_enabled')}
              onChange={toggleIsEnabled}
            />
            <CheckboxLabel htmlFor="is_enabled">{CLASS_DETAILS_PAGE.form.isEnabled}</CheckboxLabel>
          </Div>

          <Div type="row" gap="md">
            <Button type="button" variant="outline" onClick={handleBack}>{CLASS_DETAILS_PAGE.form.cancel}</Button>
            <Button type="submit" loading={isSubmitting}>{CLASS_DETAILS_PAGE.form.submit}</Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
