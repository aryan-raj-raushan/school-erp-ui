'use client';

import { useCreateDepartment } from '@/hooks/useCreateDepartment';
import { DEPARTMENTS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button,
  FormField, Input, Textarea,
  CheckboxLabel,
} from '@/components/ui';

export default function NewDepartmentPage() {
  const { form, isSubmitting, handleSubmit, toggleIsActive, handleBack } = useCreateDepartment();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={DEPARTMENTS_PAGE.form.createTitle}
        subtitle="Fill in the details below to create a new department"
        actions={<Button variant="outline" onClick={handleBack}>{DEPARTMENTS_PAGE.form.cancel}</Button>}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="md" className="max-w-2xl">
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

          <Div type="row" gap="md">
            <Button type="button" variant="outline" onClick={handleBack}>{DEPARTMENTS_PAGE.form.cancel}</Button>
            <Button type="submit" loading={isSubmitting}>{DEPARTMENTS_PAGE.form.submit}</Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
