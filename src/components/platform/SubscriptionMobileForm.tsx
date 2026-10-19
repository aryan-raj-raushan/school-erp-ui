"use client";

import type { UseFormReturn } from "react-hook-form";
import { Building2, CalendarRange, ShieldAlert } from "lucide-react";
import {
  ChoiceChips,
  ControlledChoiceChips,
  ControlledSelectField,
  FieldRow,
  FormGroup,
  MobileMultiSelectField,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
  ToggleRow,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { SubscriptionFormValues } from "@/hooks/useSubscriptions";
import {
  BILLING_MODEL_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PLAN_TYPE_OPTIONS,
  RESTRICTION_MODE_OPTIONS,
  SUBSCRIPTIONS_PAGE,
} from "@/constants";
import { PERMISSIONS, RESOURCE_LABELS } from "@/constants/permissions.registry";

const F = SUBSCRIPTIONS_PAGE.form;
const PH = SUBSCRIPTIONS_PAGE.placeholders;
const RESTRICTABLE_RESOURCES = Object.keys(PERMISSIONS);

const STEPS: ReadonlyArray<FormStep<SubscriptionFormValues>> = [
  {
    id: "plan",
    label: "Plan",
    fields: [
      "school_id",
      "plan_id",
      "plan_name",
      "plan_type",
      "billing_model",
      "price_per_student",
      "amount",
    ],
  },
  {
    id: "term",
    label: "Term",
    fields: ["max_students", "start_date", "end_date", "auto_renew"],
  },
  {
    id: "policy",
    label: "Policy",
    fields: [
      "grace_period_days",
      "restriction_mode",
      "restricted_resources",
      "payment_methods_allowed",
    ],
  },
];

export interface SubscriptionMobileFormProps {
  form: UseFormReturn<SubscriptionFormValues>;
  schools: ReadonlyArray<{ id: string; name: string }>;
  plans: ReadonlyArray<{ id: string; name: string }>;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
}

export function SubscriptionMobileForm({
  form,
  schools,
  plans,
  isSubmitting,
  onSubmit,
  onCancel,
}: SubscriptionMobileFormProps) {
  const { control, register, watch, setValue, formState } = form;
  const errors = formState.errors;

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  const planId = watch("plan_id");
  const billingModel = watch("billing_model");
  const restrictionMode = watch("restriction_mode");
  const autoRenew = watch("auto_renew");
  const restrictedResources = watch("restricted_resources") ?? [];
  const paymentMethods = watch("payment_methods_allowed") ?? [];

  return (
    <MultiStepForm
      title={F.title}
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={F.submit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
    >
      <StepPanel id="plan">
        <StepHeader icon={<Building2 size={22} />} title="School & plan" description={F.sections.plan} />
        <FormGroup>
          <ControlledSelectField
            control={control}
            name="school_id"
            label={F.school}
            required
            placeholder={PH.selectSchool}
            options={schools.map((s) => ({ value: s.id, label: s.name }))}
          />
          <ControlledSelectField
            control={control}
            name="plan_id"
            label={F.existingPlan}
            placeholder={PH.selectPlan}
            options={plans.map((p) => ({ value: p.id, label: p.name }))}
          />
        </FormGroup>

        {!planId && (
          <FormGroup title="Custom plan" description={F.customPlanHint}>
            <MobileTextField
              label={F.planName}
              required
              placeholder={PH.planName}
              error={errors.plan_name?.message}
              {...register("plan_name")}
            />
            <ControlledChoiceChips
              control={control}
              name="plan_type"
              label={F.planType}
              options={PLAN_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <ControlledChoiceChips
              control={control}
              name="billing_model"
              label={F.billingModel}
              options={BILLING_MODEL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            {billingModel === "PER_STUDENT" ? (
              <MobileTextField
                label={F.pricePerStudent}
                type="number"
                inputMode="decimal"
                placeholder={PH.pricePerStudent}
                error={errors.price_per_student?.message}
                {...register("price_per_student")}
              />
            ) : (
              <MobileTextField
                label={F.amount}
                type="number"
                inputMode="decimal"
                placeholder={PH.amount}
                error={errors.amount?.message}
                {...register("amount")}
              />
            )}
          </FormGroup>
        )}
      </StepPanel>

      <StepPanel id="term">
        <StepHeader icon={<CalendarRange size={22} />} title="Term" description="Seats, dates and renewal." />
        <FormGroup>
          <MobileTextField
            label={F.maxStudents}
            type="number"
            inputMode="numeric"
            placeholder={PH.maxStudents}
            error={errors.max_students?.message}
            {...register("max_students")}
          />
          <FieldRow>
            <MobileTextField
              label={F.startDate}
              type="date"
              error={errors.start_date?.message}
              {...register("start_date")}
            />
            <MobileTextField
              label={F.endDate}
              type="date"
              error={errors.end_date?.message}
              {...register("end_date")}
            />
          </FieldRow>
          <ToggleRow
            label={F.autoRenew}
            description={autoRenew ? F.autoRenewHint : undefined}
            checked={!!autoRenew}
            onChange={(value) => setValue("auto_renew", value, { shouldDirty: true })}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="policy">
        <StepHeader icon={<ShieldAlert size={22} />} title="Policy" description={F.sections.policy} />
        <FormGroup>
          <MobileTextField
            label={F.gracePeriod}
            type="number"
            inputMode="numeric"
            placeholder={PH.gracePeriod}
            {...register("grace_period_days")}
          />
          <ChoiceChips
            label={F.restrictionMode}
            value={restrictionMode ?? ""}
            onChange={(value) =>
              setValue("restriction_mode", value as SubscriptionFormValues["restriction_mode"], {
                shouldDirty: true,
              })
            }
            options={RESTRICTION_MODE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          {restrictionMode === "SOFT" && (
            <MobileMultiSelectField
              label={F.restrictedResources}
              placeholder="None"
              value={restrictedResources}
              onChange={(value) => setValue("restricted_resources", value, { shouldDirty: true })}
              options={RESTRICTABLE_RESOURCES.map((r) => ({ value: r, label: RESOURCE_LABELS[r] ?? r }))}
            />
          )}
          <MobileMultiSelectField
            label={F.paymentMethods}
            placeholder="Any"
            value={paymentMethods}
            onChange={(value) =>
              setValue("payment_methods_allowed", value as SubscriptionFormValues["payment_methods_allowed"], {
                shouldDirty: true,
              })
            }
            options={PAYMENT_METHOD_OPTIONS.map((m) => ({ value: m.value, label: m.label }))}
          />
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}
