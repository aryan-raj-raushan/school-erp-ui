"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Layers, SlidersHorizontal } from "lucide-react";
import {
  ControlledSelectField,
  ControlledToggleRow,
  FieldRow,
  FormGroup,
  MobileCrudSelectField,
  MobileMultiSelectField,
  MobileTextArea,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { useClassTypeCrudSelect } from "@/hooks/useClassTypeCrudSelect";
import type { CreateClassFormValues } from "@/hooks/useCreateClass";
import type { AcademicYear } from "@/types";

const STEPS: ReadonlyArray<FormStep<CreateClassFormValues>> = [
  {
    id: "basics",
    label: "Basics",
    fields: ["academic_year_id", "name", "class_type", "class_code"],
  },
  {
    id: "setup",
    label: "Setup",
    fields: ["class_sequence", "no_of_sessions", "sections", "description", "is_active"],
  },
];

type ClassTypeCrud = ReturnType<typeof useClassTypeCrudSelect>;

export interface ClassMobileFormProps {
  form: UseFormReturn<CreateClassFormValues>;
  isNew: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
  years: ReadonlyArray<Pick<AcademicYear, "id" | "name">>;
  sectionNames: ReadonlyArray<string>;
  classTypes: Pick<
    ClassTypeCrud,
    "classTypeItems" | "isClassTypesLoading" | "addClassType" | "updateClassType" | "deleteClassType"
  >;
}

export function ClassMobileForm({
  form,
  isNew,
  isSubmitting,
  onSubmit,
  onCancel,
  years,
  sectionNames,
  classTypes,
}: ClassMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  return (
    <MultiStepForm
      title={isNew ? "New class" : "Edit class"}
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={isNew ? "Create class" : "Save changes"}
      isSubmitting={isSubmitting}
      quickSave={!isNew}
      onCancel={onCancel}
    >
      <StepPanel id="basics">
        <StepHeader
          icon={<Layers size={22} />}
          title="Class basics"
          description="Which class, in which year."
        />
        <FormGroup>
          <ControlledSelectField
            control={control}
            name="academic_year_id"
            label="Academic year"
            required
            placeholder="Select academic year"
            options={years.map((y) => ({ value: y.id, label: y.name }))}
          />
          <MobileTextField
            label="Class name"
            required
            placeholder="e.g. Class 5"
            error={errors.name?.message}
            {...register("name")}
          />
          <Controller
            control={control}
            name="class_type"
            render={({ field, fieldState }) => (
              <MobileCrudSelectField
                label="Class type"
                placeholder="Select class type"
                value={field.value ?? ""}
                onChange={field.onChange}
                items={classTypes.classTypeItems}
                isLoading={classTypes.isClassTypesLoading}
                onAdd={classTypes.addClassType}
                onUpdate={classTypes.updateClassType}
                onDelete={classTypes.deleteClassType}
                error={fieldState.error?.message}
              />
            )}
          />
          <MobileTextField
            label="Class code"
            placeholder="Short code"
            error={errors.class_code?.message}
            {...register("class_code")}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="setup">
        <StepHeader
          icon={<SlidersHorizontal size={22} />}
          title="Setup"
          description="Order, sessions and sections."
        />
        <FormGroup>
          <FieldRow>
            <MobileTextField
              label="Sequence"
              type="number"
              inputMode="numeric"
              min={1}
              error={errors.class_sequence?.message}
              {...register("class_sequence")}
            />
            <MobileTextField
              label="Sessions"
              type="number"
              inputMode="numeric"
              min={1}
              error={errors.no_of_sessions?.message}
              {...register("no_of_sessions")}
            />
          </FieldRow>
          <Controller
            control={control}
            name="sections"
            render={({ field, fieldState }) => (
              <MobileMultiSelectField
                label="Sections"
                required
                placeholder="Choose sections"
                value={field.value ?? []}
                onChange={field.onChange}
                options={sectionNames.map((name) => ({ value: name, label: name }))}
                error={fieldState.error?.message}
              />
            )}
          />
          <MobileTextArea
            label="Description"
            placeholder="Optional notes about this class"
            error={errors.description?.message}
            {...register("description")}
          />
          <ControlledToggleRow
            control={control}
            name="is_active"
            label="Active"
            description="Inactive classes are hidden from new records"
          />
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}
