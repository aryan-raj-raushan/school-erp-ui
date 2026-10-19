"use client";

import type { UseFormReturn } from "react-hook-form";
import { CalendarClock, GraduationCap, User, Users } from "lucide-react";
import {
  ControlledChoiceChips,
  ControlledSelectField,
  ControlledToggleRow,
  FieldRow,
  FormGroup,
  MobileTextArea,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { AdmissionEnquiryFormValues } from "@/lib/validations/admissions.validation";
import type { AcademicYear, Class, Staff } from "@/types";
import type { AdmissionSource } from "@/types/admissions.types";
import { STATUS_OPTIONS } from "@/constants/admission.constants";
import {
  CATEGORY_OPTIONS,
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
} from "@/constants/shared/index.constant";

const withoutPlaceholder = (options: ReadonlyArray<{ value: string; label: string }>) =>
  options.filter((o) => o.value);

const GENDER_CHOICES = withoutPlaceholder(GENDER_OPTIONS);
const CATEGORY_CHOICES = withoutPlaceholder(CATEGORY_OPTIONS);
const RELIGION_CHOICES = withoutPlaceholder(RELIGION_OPTIONS);
const STATUS_CHOICES = withoutPlaceholder(STATUS_OPTIONS);

const STEPS: ReadonlyArray<FormStep<AdmissionEnquiryFormValues>> = [
  {
    id: "student",
    label: "Student",
    fields: [
      "student_name",
      "date_of_birth",
      "gender",
      "category",
      "religion",
      "student_current_address",
    ],
  },
  {
    id: "parents",
    label: "Parents",
    fields: [
      "father_name",
      "mother_name",
      "phone",
      "dial_code",
      "email",
      "father_occupation",
      "mother_occupation",
      "father_qualification",
      "mother_qualification",
      "city",
      "state",
      "country",
    ],
  },
  {
    id: "admission",
    label: "Admission",
    fields: [
      "academic_year_id",
      "applying_academic_year_id",
      "applying_class_id",
      "previous_school_name",
      "previous_class",
      "registration_fee_required",
    ],
  },
  {
    id: "enquiry",
    label: "Follow-up",
    fields: [
      "enquiry_source_id",
      "assigned_teacher_id",
      "next_followup_date",
      "next_followup_time",
      "status",
      "remarks",
    ],
  },
];

export interface EnquiryMobileFormProps {
  form: UseFormReturn<AdmissionEnquiryFormValues>;
  isNew: boolean;
  isTerminal: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel?: () => void;
  banner?: React.ReactNode;
  years: ReadonlyArray<Pick<AcademicYear, "id" | "name">>;
  classes: ReadonlyArray<Pick<Class, "id" | "name">>;
  sources: ReadonlyArray<Pick<AdmissionSource, "id" | "name">>;
  teachers: ReadonlyArray<Pick<Staff, "id" | "first_name" | "last_name">>;
}

export function EnquiryMobileForm({
  form,
  isNew,
  isTerminal,
  isSubmitting,
  onSubmit,
  onCancel,
  banner,
  years,
  classes,
  sources,
  teachers,
}: EnquiryMobileFormProps) {
  const { control, register, watch, formState } = form;
  const errors = formState.errors;

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  const studentName = watch("student_name") ?? "";
  const title = isNew ? "New enquiry" : studentName.trim() || "Edit enquiry";
  const yearOptions = years.map((y) => ({ value: y.id, label: y.name }));

  return (
    <MultiStepForm
      title={title}
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={isNew ? "Create enquiry" : "Save changes"}
      isSubmitting={isSubmitting}
      quickSave={!isNew}
      onCancel={onCancel}
      banner={banner}
    >
      <StepPanel id="student">
        <StepHeader
          icon={<User size={22} />}
          title="About the student"
          description="Who is the enquiry for?"
        />
        <FormGroup title="Name">
          <MobileTextField
            label="Student name"
            required
            placeholder="Full name"
            autoCapitalize="words"
            error={errors.student_name?.message}
            {...register("student_name")}
          />
        </FormGroup>
        <FormGroup title="Personal">
          <MobileTextField
            label="Date of birth"
            type="date"
            error={errors.date_of_birth?.message}
            {...register("date_of_birth")}
          />
          <ControlledChoiceChips
            control={control}
            name="gender"
            label="Gender"
            options={GENDER_CHOICES}
          />
          <ControlledSelectField
            control={control}
            name="category"
            label="Category"
            placeholder="Select category"
            options={CATEGORY_CHOICES}
          />
          <ControlledSelectField
            control={control}
            name="religion"
            label="Religion"
            placeholder="Select religion"
            options={RELIGION_CHOICES}
          />
          <MobileTextArea
            label="Current address"
            placeholder="Student's current address"
            {...register("student_current_address")}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="parents">
        <StepHeader
          icon={<Users size={22} />}
          title="Parents & contact"
          description="How the school reaches the family."
        />
        <FormGroup title="Contact">
          <input type="hidden" {...register("dial_code")} />
          <MobileTextField
            label="Phone"
            required
            prefix={watch("dial_code") || "+91"}
            type="tel"
            inputMode="numeric"
            placeholder="Phone number"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <MobileTextField
            label="Email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormGroup>
        <FormGroup title="Father">
          <MobileTextField
            label="Father name"
            autoCapitalize="words"
            error={errors.father_name?.message}
            {...register("father_name")}
          />
          <FieldRow>
            <MobileTextField label="Occupation" {...register("father_occupation")} />
            <MobileTextField label="Qualification" {...register("father_qualification")} />
          </FieldRow>
        </FormGroup>
        <FormGroup title="Mother">
          <MobileTextField
            label="Mother name"
            autoCapitalize="words"
            error={errors.mother_name?.message}
            {...register("mother_name")}
          />
          <FieldRow>
            <MobileTextField label="Occupation" {...register("mother_occupation")} />
            <MobileTextField label="Qualification" {...register("mother_qualification")} />
          </FieldRow>
        </FormGroup>
        <FormGroup title="Location">
          <FieldRow>
            <MobileTextField label="City" {...register("city")} />
            <MobileTextField label="State" {...register("state")} />
          </FieldRow>
          <MobileTextField label="Country" {...register("country")} />
        </FormGroup>
      </StepPanel>

      <StepPanel id="admission">
        <StepHeader
          icon={<GraduationCap size={22} />}
          title="Admission"
          description="What they are applying for."
        />
        <FormGroup title="Applying for">
          <ControlledSelectField
            control={control}
            name="academic_year_id"
            label="Academic year"
            required
            placeholder="Select year"
            options={yearOptions}
          />
          <ControlledSelectField
            control={control}
            name="applying_academic_year_id"
            label="Applying academic year"
            required
            placeholder="Select year"
            options={yearOptions}
          />
          <ControlledSelectField
            control={control}
            name="applying_class_id"
            label="Applying class"
            required
            placeholder="Select class"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
        </FormGroup>
        <FormGroup title="Previous school">
          <MobileTextField
            label="School name"
            placeholder="Previous school name"
            {...register("previous_school_name")}
          />
          <MobileTextField
            label="Class"
            placeholder="e.g. Class 5"
            {...register("previous_class")}
          />
        </FormGroup>
        <ControlledToggleRow
          control={control}
          name="registration_fee_required"
          label="Registration fee required"
          description="Collect a fee when the admission is confirmed"
        />
      </StepPanel>

      <StepPanel id="enquiry">
        <StepHeader
          icon={<CalendarClock size={22} />}
          title="Follow-up"
          description="Source, owner and the next step."
        />
        <FormGroup title="Source & owner">
          <ControlledSelectField
            control={control}
            name="enquiry_source_id"
            label="Enquiry source"
            placeholder="Select source"
            options={sources.map((s) => ({ value: s.id, label: s.name }))}
          />
          <ControlledSelectField
            control={control}
            name="assigned_teacher_id"
            label="Assigned teacher"
            placeholder="Select teacher"
            options={teachers.map((t) => ({
              value: t.id,
              label: `${t.first_name} ${t.last_name ?? ""}`.trim(),
            }))}
          />
        </FormGroup>
        <FormGroup title="Next follow-up">
          <FieldRow>
            <MobileTextField
              label="Date"
              type="date"
              {...register("next_followup_date")}
            />
            <MobileTextField
              label="Time"
              type="time"
              {...register("next_followup_time")}
            />
          </FieldRow>
        </FormGroup>
        {!isNew && (
          <ControlledSelectField
            control={control}
            name="status"
            label="Status"
            disabled={isTerminal}
            placeholder="Select status"
            options={STATUS_CHOICES}
          />
        )}
        <MobileTextArea
          label="Remarks"
          required
          placeholder="Add remarks about this enquiry…"
          error={errors.remarks?.message}
          {...register("remarks")}
        />
      </StepPanel>
    </MultiStepForm>
  );
}
