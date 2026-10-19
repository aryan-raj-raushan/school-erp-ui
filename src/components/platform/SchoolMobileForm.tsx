"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Building2, MapPin, Phone, ShieldUser } from "lucide-react";
import {
  FieldRow,
  FormGroup,
  MobileSelectField,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import { BOARD_TYPES, CREATE_SCHOOL_FORM } from "@/constants";

const L = CREATE_SCHOOL_FORM.labels;
const P = CREATE_SCHOOL_FORM.placeholders;

export interface SchoolMobileFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  title: string;
  submitLabel: string;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
}

export function SchoolMobileForm<T extends FieldValues>({
  form,
  title,
  submitLabel,
  isEditing,
  isSubmitting,
  onSubmit,
  onCancel,
}: SchoolMobileFormProps<T>) {
  const n = (name: string) => name as Path<T>;
  const err = (name: string) =>
    (form.formState.errors as Record<string, { message?: string } | undefined>)[name]?.message;

  const steps: ReadonlyArray<FormStep<T>> = [
    { id: "basic", label: "School", fields: ["name", "code", "board_type"].map(n) },
    { id: "contact", label: "Contact", fields: ["email", "dial_code", "contact_number", "website"].map(n) },
    { id: "location", label: "Location", fields: ["address", "city", "state", "pincode"].map(n) },
    {
      id: "admin",
      label: "Admin",
      fields: [
        "admin_first_name",
        "admin_last_name",
        "admin_email",
        "admin_dial_code",
        "admin_phone",
        "admin_password",
      ].map(n),
    },
  ];

  const wizard = useMultiStepForm({ form, steps, submit: onSubmit });
  const register = form.register;

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
      submitLabel={submitLabel}
      isSubmitting={isSubmitting}
      quickSave={isEditing}
      onCancel={onCancel}
    >
      <StepPanel id="basic">
        <StepHeader icon={<Building2 size={22} />} title={CREATE_SCHOOL_FORM.sections.basic} />
        <FormGroup>
          <MobileTextField
            label={L.name}
            required
            autoCapitalize="words"
            placeholder={P.name}
            error={err("name")}
            {...register(n("name"))}
          />
          <MobileTextField label={L.code} placeholder={P.code} {...register(n("code"))} />
          <Controller
            control={form.control}
            name={n("board_type")}
            render={({ field }) => (
              <MobileSelectField
                label={L.board_type}
                placeholder={P.board_type}
                value={(field.value as string | undefined) ?? ""}
                onChange={field.onChange}
                options={BOARD_TYPES.map((b) => ({ value: b, label: b }))}
              />
            )}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="contact">
        <StepHeader icon={<Phone size={22} />} title={CREATE_SCHOOL_FORM.sections.contact} />
        <FormGroup>
          <MobileTextField
            label={L.email}
            type="email"
            inputMode="email"
            autoCapitalize="none"
            placeholder={P.email}
            error={err("email")}
            {...register(n("email"))}
          />
          <input type="hidden" {...register(n("dial_code"))} />
          <MobileTextField
            label={L.contact_number}
            type="tel"
            inputMode="tel"
            prefix={(form.watch(n("dial_code")) as string | undefined) || "+91"}
            error={err("contact_number")}
            {...register(n("contact_number"))}
          />
          <MobileTextField
            label={L.website}
            autoCapitalize="none"
            inputMode="url"
            placeholder={P.website}
            error={err("website")}
            {...register(n("website"))}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="location">
        <StepHeader icon={<MapPin size={22} />} title={CREATE_SCHOOL_FORM.sections.location} />
        <FormGroup>
          <MobileTextField label={L.address} placeholder={P.address} {...register(n("address"))} />
          <FieldRow>
            <MobileTextField label={L.city} placeholder={P.city} {...register(n("city"))} />
            <MobileTextField label={L.state} placeholder={P.state} {...register(n("state"))} />
          </FieldRow>
          <MobileTextField
            label={L.pincode}
            inputMode="numeric"
            placeholder={P.pincode}
            {...register(n("pincode"))}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="admin">
        <StepHeader
          icon={<ShieldUser size={22} />}
          title={CREATE_SCHOOL_FORM.sections.admin}
          description={isEditing ? CREATE_SCHOOL_FORM.editAdminHint : CREATE_SCHOOL_FORM.adminHint}
        />
        <FormGroup>
          <FieldRow>
            <MobileTextField
              label={L.admin_first_name}
              autoCapitalize="words"
              placeholder={P.admin_first_name}
              error={err("admin_first_name")}
              {...register(n("admin_first_name"))}
            />
            <MobileTextField
              label={L.admin_last_name}
              autoCapitalize="words"
              placeholder={P.admin_last_name}
              {...register(n("admin_last_name"))}
            />
          </FieldRow>
          <MobileTextField
            label={L.admin_email}
            type="email"
            inputMode="email"
            autoCapitalize="none"
            placeholder={P.admin_email}
            error={err("admin_email")}
            {...register(n("admin_email"))}
          />
          <input type="hidden" {...register(n("admin_dial_code"))} />
          <MobileTextField
            label={L.admin_phone}
            type="tel"
            inputMode="tel"
            prefix={(form.watch(n("admin_dial_code")) as string | undefined) || "+91"}
            error={err("admin_phone")}
            {...register(n("admin_phone"))}
          />
          <MobileTextField
            label={isEditing ? "New password" : L.admin_password}
            type="password"
            placeholder={P.admin_password}
            error={err("admin_password")}
            {...register(n("admin_password"))}
          />
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}
