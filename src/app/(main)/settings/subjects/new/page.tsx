'use client';

import { useCreateSubject } from '@/hooks/useCreateSubject';
import { SUBJECTS_PAGE } from '@/constants';
import {
  Div, Button, H2,
  FormField, Input,
  CheckboxLabel,
  PageHeader,
} from '@/components/ui';
import { useIsMobile } from '@/hooks/use-mobile';

export default function NewSubjectPage() {
  const isMobile = useIsMobile();
  const {
    form, isSubmitting,
    handleSubmit, handleBack, toggleIsElective, toggleIsActive,
  } = useCreateSubject();

  return (
    <Div type="col" gap="lg" className="max-w-2xl">
      <PageHeader
        title={SUBJECTS_PAGE.form.createTitle}
        actions={<Button variant="outline" onClick={handleBack}>{SUBJECTS_PAGE.form.cancel}</Button>}
        backButton={isMobile}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="lg">
          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Subject Details
            </H2>

            <Div type="grid" cols={2} gap="md">
              <FormField label={SUBJECTS_PAGE.form.name} error={form.formState.errors.name?.message}>
                <Input placeholder={SUBJECTS_PAGE.placeholders.name} {...form.register('name')} />
              </FormField>

              <FormField label={SUBJECTS_PAGE.form.code} error={form.formState.errors.code?.message}>
                <Input placeholder={SUBJECTS_PAGE.placeholders.code} {...form.register('code')} />
              </FormField>
            </Div>
          </Div>

          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Marks & Settings
            </H2>

            <Div type="grid" cols={3} gap="md">
              <FormField label={SUBJECTS_PAGE.form.displayOrder} error={form.formState.errors.display_order?.message}>
                <Input type="number" min={0} placeholder={SUBJECTS_PAGE.placeholders.displayOrder} {...form.register('display_order')} />
              </FormField>
              <FormField label={SUBJECTS_PAGE.form.totalMarks} error={form.formState.errors.total_marks?.message}>
                <Input type="number" min={0} placeholder={SUBJECTS_PAGE.placeholders.totalMarks} {...form.register('total_marks')} />
              </FormField>
              <FormField label={SUBJECTS_PAGE.form.passingMarks} error={form.formState.errors.passing_marks?.message}>
                <Input type="number" min={0} placeholder={SUBJECTS_PAGE.placeholders.passingMarks} {...form.register('passing_marks')} />
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
          </Div>

          <Div type="row" justify="end" gap="sm">
            <Button type="button" variant="outline" onClick={handleBack}>{SUBJECTS_PAGE.form.cancel}</Button>
            <Button type="submit" loading={isSubmitting}>{SUBJECTS_PAGE.form.submit}</Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
