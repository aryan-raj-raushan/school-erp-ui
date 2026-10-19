"use client";

import type { UseFormReturn } from "react-hook-form";
import { Briefcase, History, KeyRound, MapPin, User } from "lucide-react";
import {
  ControlledChoiceChips,
  ControlledSelectField,
  ControlledToggleRow,
  FormGroup,
  MobileTextArea,
  MobileTextField,
  MultiStepForm,
  PhotoHero,
  StepHeader,
  StepPanel,
  type PhotoHeroProps,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { StaffFormValues } from "@/lib/validations/staff.validation";
import { BLOOD_GROUPS } from "@/constants";
import type { Staff } from "@/types";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
] as const;

const BASE_STEPS: ReadonlyArray<FormStep<StaffFormValues>> = [
  {
    id: "personal",
    label: "Personal",
    fields: ["first_name", "last_name", "gender", "date_of_birth", "blood_group"],
  },
  {
    id: "contact",
    label: "Contact",
    fields: [
      "dial_code", "phone_number", "email", "city", "address",
      "permanent_address", "father_name", "husband_name",
    ],
  },
  {
    id: "employment",
    label: "Employment",
    fields: [
      "role_id", "reporting_to_id", "joining_date", "employee_code", "qualification",
    ],
  },
  {
    id: "experience",
    label: "Experience",
    fields: ["previous_employer", "previous_role", "total_experience"],
  },
];

const LOGIN_STEP: FormStep<StaffFormValues> = {
  id: "login",
  label: "Login",
  fields: ["password", "is_active"],
};

export interface StaffMobileFormProps {
  form: UseFormReturn<StaffFormValues>;
  isNew: boolean;
  fullName: string;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel?: () => void;
  photo: PhotoHeroProps;
  roles: ReadonlyArray<{ id: string; name: string }>;
  managers: ReadonlyArray<Pick<Staff, "id" | "first_name" | "last_name">>;
  currentStaffId?: string;
  banner?: React.ReactNode;
}

export function StaffMobileForm({
  form,
  isNew,
  fullName,
  isSubmitting,
  onSubmit,
  onCancel,
  photo,
  roles,
  managers,
  currentStaffId,
  banner,
}: StaffMobileFormProps) {
  const { control, register, watch, formState } = form;
  const errors = formState.errors;

  const steps = isNew ? [...BASE_STEPS, LOGIN_STEP] : BASE_STEPS;
  const wizard = useMultiStepForm({ form, steps, submit: onSubmit });

  const firstName = watch("first_name") ?? "";
  const lastName = watch("last_name") ?? "";

  return (
    <MultiStepForm
      title={isNew ? "Add employee" : fullName}
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={isNew ? "Add employee" : "Save changes"}
      isSubmitting={isSubmitting}
      quickSave={!isNew}
      onCancel={onCancel}
      banner={banner}
    >
      <StepPanel id="personal">
        <StepHeader
          icon={<User size={22} />}
          title="About the employee"
          description="Name, birth date and a photo."
        />
        <PhotoHero {...photo} name={`${firstName} ${lastName}`.trim()} />
        <FormGroup title="Name">
          <MobileTextField
            label="First name"
            required
            placeholder="First name"
            autoCapitalize="words"
            error={errors.first_name?.message}
            {...register("first_name")}
          />
          <MobileTextField
            label="Last name"
            placeholder="Last name"
            autoCapitalize="words"
            {...register("last_name")}
          />
        </FormGroup>
        <FormGroup title="Personal">
          <ControlledChoiceChips
            control={control}
            name="gender"
            label="Gender"
            required
            options={GENDER_OPTIONS}
          />
          <MobileTextField
            label="Date of birth"
            type="date"
            required
            error={errors.date_of_birth?.message}
            {...register("date_of_birth")}
          />
          <ControlledSelectField
            control={control}
            name="blood_group"
            label="Blood group"
            placeholder="Select blood group"
            options={BLOOD_GROUPS}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="contact">
        <StepHeader
          icon={<MapPin size={22} />}
          title="Contact & address"
          description="How to reach the employee."
        />
        <input type="hidden" {...register("dial_code")} />
        <FormGroup title="Contact">
          <MobileTextField
            label="Phone"
            required
            prefix="+91"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit number"
            error={errors.phone_number?.message}
            {...register("phone_number")}
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
        <FormGroup title="Address">
          <MobileTextArea
            label="Current address"
            placeholder="House no., street, area"
            {...register("address")}
          />
          <MobileTextArea
            label="Permanent address"
            placeholder="Same as current if unchanged"
            {...register("permanent_address")}
          />
          <MobileTextField label="City" {...register("city")} />
        </FormGroup>
        <FormGroup title="Family">
          <MobileTextField label="Father's name" {...register("father_name")} />
          <MobileTextField label="Husband's name" {...register("husband_name")} />
        </FormGroup>
      </StepPanel>

      <StepPanel id="employment">
        <StepHeader
          icon={<Briefcase size={22} />}
          title="Employment"
          description="Role and reporting details."
        />
        <FormGroup title="Role">
          <ControlledSelectField
            control={control}
            name="role_id"
            label="Role"
            required
            placeholder="Select role"
            options={roles.map((r) => ({ value: r.id, label: r.name }))}
          />
          <ControlledSelectField
            control={control}
            name="reporting_to_id"
            label="Reporting to"
            placeholder="Select manager"
            options={managers
              .filter((m) => m.id !== currentStaffId)
              .map((m) => ({
                value: m.id,
                label: `${m.first_name} ${m.last_name ?? ""}`.trim(),
              }))}
          />
        </FormGroup>
        <FormGroup title="Details">
          <MobileTextField label="Joining date" type="date" {...register("joining_date")} />
          <MobileTextField label="Employee code" placeholder="EMP-001" {...register("employee_code")} />
          <MobileTextField
            label="Qualification"
            placeholder="M.Ed, B.Sc …"
            {...register("qualification")}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="experience">
        <StepHeader
          icon={<History size={22} />}
          title="Work experience"
          description="Optional — previous employment."
        />
        <FormGroup>
          <MobileTextField label="Previous employer" {...register("previous_employer")} />
          <MobileTextField label="Role at previous employer" {...register("previous_role")} />
          <MobileTextField
            label="Total experience"
            placeholder="e.g. 5 years"
            {...register("total_experience")}
          />
        </FormGroup>
      </StepPanel>

      {isNew && (
        <StepPanel id="login">
          <StepHeader
            icon={<KeyRound size={22} />}
            title="Login details"
            description="They sign in with their email or phone and this password."
          />
          <FormGroup>
            <MobileTextField
              label="Password"
              type="password"
              required
              placeholder="Min 6 characters"
              autoCapitalize="none"
              error={errors.password?.message}
              {...register("password")}
            />
            <ControlledToggleRow
              control={control}
              name="is_active"
              label="Enabled"
              description="Allow this employee to sign in"
            />
          </FormGroup>
        </StepPanel>
      )}
    </MultiStepForm>
  );
}
