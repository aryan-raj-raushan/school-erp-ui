"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  ControlledToggleRow,
  FieldRow,
  FormGroup,
  MobileFormScreen,
  MobileTextArea,
  MobileTextField,
} from "@/components/ui";
import type { CreateAcademicYearFormValues } from "@/hooks/useCreateAcademicYear";

export interface AcademicYearMobileFormProps {
  form: UseFormReturn<CreateAcademicYearFormValues>;
  isNew: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
}

export function AcademicYearMobileForm({
  form,
  isNew,
  isSubmitting,
  onSubmit,
  onCancel,
}: AcademicYearMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  return (
    <MobileFormScreen
      title={isNew ? "New academic year" : "Edit academic year"}
      submitLabel={isNew ? "Create year" : "Save changes"}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <FormGroup title="Year">
        <MobileTextField
          label="Name"
          required
          placeholder="e.g. 2026-27"
          error={errors.name?.message}
          {...register("name")}
        />
        <MobileTextField
          label="Session code"
          placeholder="e.g. 2026"
          error={errors.session_code?.message}
          {...register("session_code")}
        />
        <MobileTextArea
          label="Description"
          placeholder="Optional notes"
          error={errors.description?.message}
          {...register("description")}
        />
      </FormGroup>

      <FormGroup title="Duration">
        <FieldRow>
          <MobileTextField
            label="Starts"
            type="date"
            required
            error={errors.start_date?.message}
            {...register("start_date")}
          />
          <MobileTextField
            label="Ends"
            type="date"
            required
            error={errors.end_date?.message}
            {...register("end_date")}
          />
        </FieldRow>
      </FormGroup>

      <FormGroup title="Status">
        <ControlledToggleRow
          control={control}
          name="is_enabled"
          label="Enabled"
          description="Available across the app"
        />
        <ControlledToggleRow
          control={control}
          name="is_current"
          label="Current year"
          description="Used by default for new records"
        />
      </FormGroup>
    </MobileFormScreen>
  );
}
