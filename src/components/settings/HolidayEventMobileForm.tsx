"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { CalendarDays, PartyPopper, Users } from "lucide-react";
import {
  ControlledChoiceChips,
  ControlledSelectField,
  FieldRow,
  FormGroup,
  MobileMultiSelectField,
  MobileTextArea,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { SchoolEventFormValues } from "@/lib/validations/settings/school-event.validation";

const TYPE_OPTIONS = [
  { value: "EVENT", label: "Event" },
  { value: "HOLIDAY", label: "Holiday" },
];

const APPLIES_TO_OPTIONS = [
  { value: "STUDENTS", label: "Students" },
  { value: "STAFF", label: "Staff" },
  { value: "BOTH", label: "Both" },
];

const STEPS: ReadonlyArray<FormStep<SchoolEventFormValues>> = [
  {
    id: "general",
    label: "General",
    fields: ["name", "type", "academic_year_id", "description"],
  },
  {
    id: "schedule",
    label: "Schedule",
    fields: ["from_date", "from_time", "to_date", "to_time"],
  },
  { id: "applies", label: "Applies to", fields: ["applies_to", "exempt_role_ids"] },
];

export interface HolidayEventMobileFormProps {
  form: UseFormReturn<SchoolEventFormValues>;
  isNew: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
  years: ReadonlyArray<{ id: string; name: string; is_current?: boolean }>;
  roles: ReadonlyArray<{ id: string; name: string }>;
  rolesLoading: boolean;
}

export function HolidayEventMobileForm({
  form,
  isNew,
  isSubmitting,
  onSubmit,
  onCancel,
  years,
  roles,
  rolesLoading,
}: HolidayEventMobileFormProps) {
  const { control, register, watch, formState } = form;
  const errors = formState.errors;

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  const appliesTo = watch("applies_to");
  const includesStaff = appliesTo === "STAFF" || appliesTo === "BOTH";

  return (
    <MultiStepForm
      title={isNew ? "New event" : "Edit event"}
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={isNew ? "Create" : "Save changes"}
      isSubmitting={isSubmitting}
      quickSave={!isNew}
      onCancel={onCancel}
    >
      <StepPanel id="general">
        <StepHeader
          icon={<PartyPopper size={22} />}
          title="What is it?"
          description="An event or a holiday."
        />
        <FormGroup>
          <MobileTextField
            label="Name"
            required
            autoCapitalize="words"
            placeholder="e.g. Diwali holiday, Sports day"
            error={errors.name?.message}
            {...register("name")}
          />
          <ControlledChoiceChips
            control={control}
            name="type"
            label="Type"
            required
            options={TYPE_OPTIONS}
          />
          <ControlledSelectField
            control={control}
            name="academic_year_id"
            label="Academic year"
            required
            placeholder="Select year"
            options={years.map((y) => ({
              value: y.id,
              label: `${y.name}${y.is_current ? " (Current)" : ""}`,
            }))}
          />
          <MobileTextArea
            label="Description"
            placeholder="Optional details…"
            error={errors.description?.message}
            {...register("description")}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="schedule">
        <StepHeader
          icon={<CalendarDays size={22} />}
          title="When?"
          description="Dates are required, times are optional."
        />
        <FormGroup title="Starts">
          <FieldRow>
            <MobileTextField
              label="Date"
              type="date"
              required
              error={errors.from_date?.message}
              {...register("from_date")}
            />
            <MobileTextField
              label="Time"
              type="time"
              error={errors.from_time?.message}
              {...register("from_time")}
            />
          </FieldRow>
        </FormGroup>
        <FormGroup title="Ends">
          <FieldRow>
            <MobileTextField
              label="Date"
              type="date"
              required
              error={errors.to_date?.message}
              {...register("to_date")}
            />
            <MobileTextField
              label="Time"
              type="time"
              error={errors.to_time?.message}
              {...register("to_time")}
            />
          </FieldRow>
        </FormGroup>
      </StepPanel>

      <StepPanel id="applies">
        <StepHeader
          icon={<Users size={22} />}
          title="Who is it for?"
          description="Students, staff or everyone."
        />
        <FormGroup>
          <ControlledChoiceChips
            control={control}
            name="applies_to"
            label="Applies to"
            required
            options={APPLIES_TO_OPTIONS}
          />
          {includesStaff && (
            <>
              <Controller
                control={control}
                name="exempt_role_ids"
                render={({ field }) => (
                  <MobileMultiSelectField
                    label="Staff who work"
                    placeholder={rolesLoading ? "Loading roles…" : "None"}
                    disabled={rolesLoading}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    options={roles.map((r) => ({ value: r.id, label: r.name }))}
                  />
                )}
              />
              <p className="px-1 text-xs text-muted-foreground">
                Roles that must work on this holiday (for example peon or gate guard) are paid for it.
              </p>
            </>
          )}
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}
