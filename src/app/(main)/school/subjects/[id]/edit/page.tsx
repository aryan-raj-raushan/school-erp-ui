'use client';

import { use } from 'react';
import { useEditSubject } from '@/hooks/useEditSubject';
import { SUBJECTS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button,
  FormField, Input, Select,
  CheckboxLabel, Spinner,
} from '@/components/ui';

export default function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    form, classes, classDetails, isLoadingData, isSubmitting,
    handleSubmit, handleBack, toggleIsElective, toggleIsActive,
  } = useEditSubject(id);

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
        title={SUBJECTS_PAGE.form.editTitle}
        actions={<Button variant="outline" onClick={handleBack}>{SUBJECTS_PAGE.form.cancel}</Button>}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="md" className="max-w-2xl">
          <FormField label={SUBJECTS_PAGE.form.name} error={form.formState.errors.name?.message}>
            <Input placeholder={SUBJECTS_PAGE.placeholders.name} {...form.register('name')} />
          </FormField>

          <FormField label={SUBJECTS_PAGE.form.code} error={form.formState.errors.code?.message}>
            <Input placeholder={SUBJECTS_PAGE.placeholders.code} {...form.register('code')} />
          </FormField>

          <FormField label="Class" error={form.formState.errors.class_id?.message}>
            <Select {...form.register('class_id')}>
              <option value="">Select Class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>

          <FormField label="Class (Year / Semester)" error={form.formState.errors.class_detail_id?.message}>
            <Select {...form.register('class_detail_id')} disabled={!form.watch('class_id')}>
              <option value="">Select Year / Semester</option>
              {classDetails.map((cd) => <option key={cd.id} value={cd.id}>{cd.name}</option>)}
            </Select>
          </FormField>

          <Div type="grid" cols={3} gap="md">
            <FormField label={SUBJECTS_PAGE.form.displayOrder} error={form.formState.errors.display_order?.message}>
              <Input type="number" min={0} {...form.register('display_order')} />
            </FormField>
            <FormField label={SUBJECTS_PAGE.form.totalMarks} error={form.formState.errors.total_marks?.message}>
              <Input type="number" min={0} {...form.register('total_marks')} />
            </FormField>
            <FormField label={SUBJECTS_PAGE.form.passingMarks} error={form.formState.errors.passing_marks?.message}>
              <Input type="number" min={0} {...form.register('passing_marks')} />
            </FormField>
          </Div>

          <Div type="row" gap="lg" align="center">
            <Div type="row" align="center" gap="sm">
              <input type="checkbox" id="is_elective" checked={form.watch('is_elective')} onChange={toggleIsElective} />
              <CheckboxLabel htmlFor="is_elective">{SUBJECTS_PAGE.form.isElective}</CheckboxLabel>
            </Div>
            <Div type="row" align="center" gap="sm">
              <input type="checkbox" id="is_active" checked={form.watch('is_active')} onChange={toggleIsActive} />
              <CheckboxLabel htmlFor="is_active">{SUBJECTS_PAGE.form.isActive}</CheckboxLabel>
            </Div>
          </Div>

          <Div type="row" gap="md">
            <Button type="button" variant="outline" onClick={handleBack}>{SUBJECTS_PAGE.form.cancel}</Button>
            <Button type="submit" loading={isSubmitting}>{SUBJECTS_PAGE.form.update}</Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
