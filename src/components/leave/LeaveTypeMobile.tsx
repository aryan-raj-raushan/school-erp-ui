"use client";

import type { UseFormReturn } from "react-hook-form";
import { Pencil } from "lucide-react";
import {
  Badge,
  Button,
  ControlledChoiceChips,
  ControlledToggleRow,
  DetailField,
  DetailGrid,
  DetailHero,
  FormGroup,
  MobileFormScreen,
  MobileTextField,
  StickyActionBar,
} from "@/components/ui";
import {
  LEAVE_PAY_TYPE_LABEL,
  LEAVE_PAY_TYPE_OPTIONS,
  LEAVE_TYPE_PAGE,
  LEAVE_VALIDITY_LABEL,
  LEAVE_VALIDITY_OPTIONS,
} from "@/constants/emp-leave.constants";
import type { LeaveTypeFormValues } from "@/lib/validations/leave.validation";
import type { LeaveType } from "@/types/leave.types";

const VALIDITY_CHOICES = LEAVE_VALIDITY_OPTIONS.filter((o) => o.value !== "");
const PAY_TYPE_CHOICES = LEAVE_PAY_TYPE_OPTIONS.filter((o) => o.value !== "");

export interface LeaveTypeMobileFormProps {
  form: UseFormReturn<LeaveTypeFormValues>;
  isNew: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
}

export function LeaveTypeMobileForm({
  form,
  isNew,
  isSubmitting,
  onSubmit,
  onCancel,
}: LeaveTypeMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  return (
    <MobileFormScreen
      title={isNew ? LEAVE_TYPE_PAGE.buttons.addLeaveType : "Edit leave type"}
      submitLabel={isNew ? LEAVE_TYPE_PAGE.buttons.createLeaveType : LEAVE_TYPE_PAGE.buttons.saveChanges}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <FormGroup>
        <MobileTextField
          label={LEAVE_TYPE_PAGE.labels.leaveName}
          required
          autoCapitalize="words"
          placeholder={LEAVE_TYPE_PAGE.placeholders.leaveName}
          error={errors.leave_name?.message}
          {...register("leave_name")}
        />
        <ControlledChoiceChips
          control={control}
          name="leave_validity"
          label={LEAVE_TYPE_PAGE.labels.leaveValidity}
          required
          options={VALIDITY_CHOICES}
        />
        <ControlledChoiceChips
          control={control}
          name="leave_pay_type"
          label={LEAVE_TYPE_PAGE.labels.leavePayType}
          required
          options={PAY_TYPE_CHOICES}
        />
        <MobileTextField
          label={LEAVE_TYPE_PAGE.labels.leaveCountDays}
          required
          type="number"
          inputMode="numeric"
          min={1}
          placeholder={LEAVE_TYPE_PAGE.placeholders.leaveCountDays}
          error={errors.leave_count_days?.message}
          {...register("leave_count_days", { valueAsNumber: true })}
        />
        <ControlledToggleRow
          control={control}
          name="is_enabled"
          label={LEAVE_TYPE_PAGE.labels.isEnabled}
          description="Enabled types can be assigned and applied for"
        />
      </FormGroup>
    </MobileFormScreen>
  );
}

export function LeaveTypeMobileView({
  leaveType,
  onEdit,
}: {
  leaveType: LeaveType;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      <DetailHero
        name={leaveType.leave_name}
        subtitle={`${LEAVE_PAY_TYPE_LABEL[leaveType.leave_pay_type]} · ${LEAVE_VALIDITY_LABEL[leaveType.leave_validity]}`}
        badge={
          <Badge variant={leaveType.is_enabled ? "success" : "secondary"}>
            {leaveType.is_enabled ? "Enabled" : "Disabled"}
          </Badge>
        }
      />
      <section className="rounded-2xl border border-border/60 bg-white p-4 dark:bg-neutral-900">
        <DetailGrid>
          <DetailField label="Validity" value={LEAVE_VALIDITY_LABEL[leaveType.leave_validity]} />
          <DetailField label="Pay type" value={LEAVE_PAY_TYPE_LABEL[leaveType.leave_pay_type]} />
          <DetailField label="Days allowed" value={`${leaveType.leave_count_days} days`} />
          <DetailField label="Status" value={leaveType.is_enabled ? "Enabled" : "Disabled"} />
        </DetailGrid>
      </section>
      <StickyActionBar>
        <Button type="button" size="lg" className="flex-1" onClick={onEdit}>
          <Pencil size={16} /> Edit leave type
        </Button>
      </StickyActionBar>
    </div>
  );
}
