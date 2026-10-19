"use client";

import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  BottomSheet,
  Badge,
  Button,
  ControlledToggleRow,
  FormGroup,
  MobileSelectField,
  MobileTextArea,
  MobileTextField,
} from "@/components/ui";
import { LEAVE_POLICY_PAGE } from "@/constants";
import type { PolicyFormValues } from "@/hooks/useLeave";

// ─── Create sheet ─────────────────────────────────────────────────────────────

const CREATE_FORM_ID = "leave-policy-create-form";

export interface LeavePolicyCreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<PolicyFormValues>;
  fields: UseFieldArrayReturn<PolicyFormValues, "leave_types">["fields"];
  onAddType: () => void;
  onRemoveType: (index: number) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown> | unknown;
  isSaving: boolean;
}

export function LeavePolicyCreateSheet({
  isOpen,
  onClose,
  form,
  fields,
  onAddType,
  onRemoveType,
  onSubmit,
  isSaving,
}: LeavePolicyCreateSheetProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={LEAVE_POLICY_PAGE.form.title}
      maxHeight="94dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            {LEAVE_POLICY_PAGE.form.cancel}
          </Button>
          <Button type="submit" form={CREATE_FORM_ID} size="lg" className="flex-[2]" loading={isSaving}>
            {LEAVE_POLICY_PAGE.form.submit}
          </Button>
        </div>
      }
    >
      <form id={CREATE_FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-5 pt-1">
        <FormGroup title="Policy">
          <MobileTextField
            label={LEAVE_POLICY_PAGE.form.policyName}
            required
            placeholder="Annual Leave Policy 2025-26"
            error={errors.name?.message}
            {...register("name")}
          />
          <MobileTextArea
            label={LEAVE_POLICY_PAGE.form.description}
            placeholder="Optional description"
            {...register("description")}
          />
        </FormGroup>

        <FormGroup title={LEAVE_POLICY_PAGE.form.leaveTypes}>
          {fields.map((field, index) => (
            <section
              key={field.id}
              className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-muted/30 p-3"
            >
              <header className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">Leave type {index + 1}</h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove leave type ${index + 1}`}
                    onClick={() => onRemoveType(index)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-destructive active:bg-destructive/10"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </header>
              <MobileTextField
                label={LEAVE_POLICY_PAGE.form.typeName}
                required
                placeholder="Casual Leave"
                error={errors.leave_types?.[index]?.name?.message}
                {...register(`leave_types.${index}.name`)}
              />
              <MobileTextField
                label={LEAVE_POLICY_PAGE.form.maxDays}
                required
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="12"
                error={errors.leave_types?.[index]?.max_days?.message}
                {...register(`leave_types.${index}.max_days`)}
              />
              <ControlledToggleRow
                control={control}
                name={`leave_types.${index}.is_paid`}
                label={LEAVE_POLICY_PAGE.form.isPaid}
              />
            </section>
          ))}
          <Button type="button" variant="outline" size="lg" onClick={onAddType}>
            <Plus size={18} /> {LEAVE_POLICY_PAGE.form.addType}
          </Button>
        </FormGroup>
      </form>
    </BottomSheet>
  );
}

// ─── Detail sheet ─────────────────────────────────────────────────────────────

export interface LeavePolicyDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  name?: string;
  description?: string | null;
  leaveTypes: ReadonlyArray<{ id?: string; name: string; max_days: number; is_paid?: boolean | null }>;
  onProvision: () => void;
}

export function LeavePolicyDetailSheet({
  isOpen,
  onClose,
  name,
  description,
  leaveTypes,
  onProvision,
}: LeavePolicyDetailSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={name}
      maxHeight="85dvh"
      footer={
        <Button type="button" size="lg" className="w-full" onClick={onProvision}>
          Provision staff
        </Button>
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {leaveTypes.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No leave types defined.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {leaveTypes.map((lt, index) => (
              <li
                key={lt.id ?? index}
                className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{lt.name}</p>
                  <p className="text-xs text-muted-foreground">{lt.max_days} days</p>
                </div>
                <Badge variant={lt.is_paid ? "success" : "default"}>
                  {lt.is_paid ? "Paid" : "Unpaid"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BottomSheet>
  );
}

// ─── Provision sheet ──────────────────────────────────────────────────────────

export interface LeaveProvisionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  years: ReadonlyArray<{ id: string; name: string; is_current?: boolean }>;
  academicYearId: string;
  onAcademicYearChange: (id: string) => void;
  onSubmit: () => void;
  isSaving: boolean;
}

export function LeaveProvisionSheet({
  isOpen,
  onClose,
  years,
  academicYearId,
  onAcademicYearChange,
  onSubmit,
  isSaving,
}: LeaveProvisionSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={LEAVE_POLICY_PAGE.provision.title}
      maxHeight="70dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            {LEAVE_POLICY_PAGE.provision.cancel}
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-[2]"
            loading={isSaving}
            disabled={!academicYearId}
            onClick={onSubmit}
          >
            {LEAVE_POLICY_PAGE.provision.submit}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pt-1">
        <p className="text-sm text-muted-foreground">{LEAVE_POLICY_PAGE.provision.desc}</p>
        <MobileSelectField
          label={LEAVE_POLICY_PAGE.provision.academicYear}
          value={academicYearId}
          onChange={onAcademicYearChange}
          placeholder="Select academic year"
          options={years.map((y) => ({
            value: y.id,
            label: `${y.name}${y.is_current ? " (Current)" : ""}`,
          }))}
        />
      </div>
    </BottomSheet>
  );
}
