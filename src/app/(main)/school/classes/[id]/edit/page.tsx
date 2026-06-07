'use client';

import { use } from 'react';
import { useEditClass } from '@/hooks/useEditClass';
import { useDepartmentCrudSelect } from '@/hooks/useDepartmentCrudSelect';
import { useClassTypeCrudSelect } from '@/hooks/useClassTypeCrudSelect';
import { CLASSES_PAGE, CLASS_SEQUENCE_OPTIONS } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button,
  FormField, Input, Select, Textarea,
  CheckboxLabel, Spinner, CrudDropdown,
} from '@/components/ui';

export default function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    form, sessions, years, isLoadingData, isSubmitting,
    allSectionNames, watchedSections,
    handleSubmit, handleBack, toggleSection, toggleIsActive,
  } = useEditClass(id);
  const { departmentItems, isDepartmentsLoading, addDepartment, updateDepartment, deleteDepartment } = useDepartmentCrudSelect();
  const { classTypeItems, isClassTypesLoading, addClassType, updateClassType, deleteClassType } = useClassTypeCrudSelect();

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
        title={CLASSES_PAGE.form.editTitle}
        subtitle="Update the details of this class"
        actions={<Button variant="outline" onClick={handleBack}>{CLASSES_PAGE.form.cancel}</Button>}
      />

      <form onSubmit={handleSubmit}>
        <Div type="col" gap="md" className="max-w-2xl">
          <FormField label={CLASSES_PAGE.form.session} error={form.formState.errors.timetable_session_id?.message}>
            <Select {...form.register('timetable_session_id')}>
              <option value="">{CLASSES_PAGE.placeholders.session}</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Academic Year *" error={form.formState.errors.academic_year_id?.message}>
            <Select {...form.register('academic_year_id')}>
              <option value="">Select Academic Year</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label={CLASSES_PAGE.form.name} error={form.formState.errors.name?.message}>
            <Input placeholder={CLASSES_PAGE.placeholders.name} {...form.register('name')} />
          </FormField>

          <FormField label={CLASSES_PAGE.form.department} error={form.formState.errors.department?.message}>
            <CrudDropdown
              items={departmentItems}
              isLoading={isDepartmentsLoading}
              value={form.watch('department') ?? ''}
              onChange={(val) => form.setValue('department', val, { shouldValidate: true })}
              onAdd={addDepartment}
              onUpdate={updateDepartment}
              onDelete={deleteDepartment}
              placeholder={CLASSES_PAGE.placeholders.department}
            />
          </FormField>

          <Div type="grid" cols={2} gap="md">
            <FormField label={CLASSES_PAGE.form.classType} error={form.formState.errors.class_type?.message}>
              <CrudDropdown
                items={classTypeItems}
                isLoading={isClassTypesLoading}
                value={form.watch('class_type') ?? ''}
                onChange={(val) => form.setValue('class_type', val, { shouldValidate: true })}
                onAdd={addClassType}
                onUpdate={updateClassType}
                onDelete={deleteClassType}
                placeholder={CLASSES_PAGE.placeholders.classType}
              />
            </FormField>
            <FormField label={CLASSES_PAGE.form.classSequence} error={form.formState.errors.class_sequence?.message}>
              <Select {...form.register('class_sequence')}>
                <option value="">Select</option>
                {CLASS_SEQUENCE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </FormField>
          </Div>

          <Div type="grid" cols={2} gap="md">
            <FormField label={CLASSES_PAGE.form.noOfSessions} error={form.formState.errors.no_of_sessions?.message}>
              <Input type="number" min={1} {...form.register('no_of_sessions')} />
            </FormField>
            <FormField label={CLASSES_PAGE.form.classCode} error={form.formState.errors.class_code?.message}>
              <Input placeholder={CLASSES_PAGE.placeholders.classCode} {...form.register('class_code')} />
            </FormField>
          </Div>

          <FormField label={CLASSES_PAGE.form.sections} error={form.formState.errors.sections?.message}>
            <Div type="row" gap="sm" wrap>
              {allSectionNames.map((name) => (
                <Div key={name} type="row" align="center" gap="xs">
                  <input
                    type="checkbox"
                    id={`sec-${name}`}
                    checked={watchedSections.includes(name)}
                    onChange={() => toggleSection(name)}
                  />
                  <CheckboxLabel htmlFor={`sec-${name}`}>{name}</CheckboxLabel>
                </Div>
              ))}
            </Div>
          </FormField>

          <FormField label={CLASSES_PAGE.form.description} error={form.formState.errors.description?.message}>
            <Textarea placeholder={CLASSES_PAGE.placeholders.description} {...form.register('description')} />
          </FormField>

          <Div type="row" align="center" gap="sm">
            <input
              type="checkbox"
              id="is_active"
              checked={form.watch('is_active')}
              onChange={toggleIsActive}
            />
            <CheckboxLabel htmlFor="is_active">{CLASSES_PAGE.form.isActive}</CheckboxLabel>
          </Div>

          <Div type="row" gap="md">
            <Button type="button" variant="outline" onClick={handleBack}>{CLASSES_PAGE.form.cancel}</Button>
            <Button type="submit" loading={isSubmitting}>{CLASSES_PAGE.form.update}</Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}
