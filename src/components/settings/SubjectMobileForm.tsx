"use client";

import type { UseFormReturn } from "react-hook-form";
import { BookOpen, ListChecks } from "lucide-react";
import {
  ControlledToggleRow,
  FieldRow,
  FormGroup,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { CreateSubjectFormValues } from "@/hooks/useCreateSubject";

const STEPS: ReadonlyArray<FormStep<CreateSubjectFormValues>> = [
  { id: "details", label: "Subject", fields: ["name", "code"] },
  {
    id: "marks",
    label: "Marks",
    fields: ["display_order", "total_marks", "passing_marks", "is_elective", "is_active"],
  },
];

export interface SubjectMobileFormProps {
  form: UseFormReturn<CreateSubjectFormValues>;
  isNew: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
}

export function SubjectMobileForm({
  form,
  isNew,
  isSubmitting,
  onSubmit,
  onCancel,
}: SubjectMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  return (
    <MultiStepForm
      title={isNew ? "New subject" : "Edit subject"}
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={isNew ? "Create subject" : "Save changes"}
      isSubmitting={isSubmitting}
      quickSave={!isNew}
      onCancel={onCancel}
    >
      <StepPanel id="details">
        <StepHeader
          icon={<BookOpen size={22} />}
          title="Subject details"
          description="What it is called."
        />
        <FormGroup>
          <MobileTextField
            label="Subject name"
            required
            autoCapitalize="words"
            placeholder="e.g. Mathematics"
            error={errors.name?.message}
            {...register("name")}
          />
          <MobileTextField
            label="Code"
            autoCapitalize="characters"
            placeholder="e.g. MATH"
            error={errors.code?.message}
            {...register("code")}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="marks">
        <StepHeader
          icon={<ListChecks size={22} />}
          title="Marks & settings"
          description="Scoring and visibility."
        />
        <FormGroup title="Marks">
          <FieldRow>
            <MobileTextField
              label="Total marks"
              type="number"
              inputMode="numeric"
              min={0}
              error={errors.total_marks?.message}
              {...register("total_marks")}
            />
            <MobileTextField
              label="Passing marks"
              type="number"
              inputMode="numeric"
              min={0}
              error={errors.passing_marks?.message}
              {...register("passing_marks")}
            />
          </FieldRow>
          <MobileTextField
            label="Display order"
            type="number"
            inputMode="numeric"
            min={0}
            error={errors.display_order?.message}
            {...register("display_order")}
          />
        </FormGroup>
        <FormGroup title="Settings">
          <ControlledToggleRow
            control={control}
            name="is_elective"
            label="Elective"
            description="Students pick this subject instead of it being compulsory"
          />
          <ControlledToggleRow
            control={control}
            name="is_active"
            label="Active"
            description="Inactive subjects are hidden from new records"
          />
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}
