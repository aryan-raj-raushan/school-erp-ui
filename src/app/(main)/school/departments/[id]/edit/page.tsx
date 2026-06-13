'use client';

import { use } from 'react';
import { useEditDepartment } from '@/hooks/useEditDepartment';
import { DEPARTMENTS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button, H2,
  FormField, Input, Textarea,
  CheckboxLabel, Spinner,
} from '@/components/ui';

export default function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { form, isLoadingData, isSubmitting, handleSubmit, toggleIsActive, handleBack } = useEditDepartment(id);

  if (isLoadingData) {
    return (
      <Div type="col" align="center" justify="center" className="py-20">
        <Spinner />
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-2xl">
      <PageHeader
        title={DEPARTMENTS_PAGE.form.editTitle}
        actions={<Button variant="outline" onClick={handleBack}>{DEPARTMENTS_PAGE.form.cancel}</Button>}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="lg">
          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Department Details
            </H2>

            <FormField label={DEPARTMENTS_PAGE.form.name} error={form.formState.errors.name?.message}>
              <Input placeholder={DEPARTMENTS_PAGE.placeholders.name} {...form.register('name')} />
            </FormField>

            <FormField label={DEPARTMENTS_PAGE.form.address} error={form.formState.errors.address?.message}>
              <Input placeholder={DEPARTMENTS_PAGE.placeholders.address} {...form.register('address')} />
            </FormField>

            <FormField label={DEPARTMENTS_PAGE.form.description} error={form.formState.errors.description?.message}>
              <Textarea placeholder={DEPARTMENTS_PAGE.placeholders.description} {...form.register('description')} />
            </FormField>

            <Div type="row" align="center" gap="sm">
              <input
                type="checkbox"
                id="is_active"
                checked={form.watch('is_active')}
                onChange={toggleIsActive}
              />
              <CheckboxLabel htmlFor="is_active">{DEPARTMENTS_PAGE.form.isActive}</CheckboxLabel>
            </Div>
          </Div>

          <Div type="row" justify="end" gap="sm">
            <Button type="button" variant="outline" onClick={handleBack}>{DEPARTMENTS_PAGE.form.cancel}</Button>
            <Button type="submit" loading={isSubmitting}>{DEPARTMENTS_PAGE.form.update}</Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
