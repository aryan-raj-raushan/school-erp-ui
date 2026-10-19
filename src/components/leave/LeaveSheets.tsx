"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  BottomSheet,
  Button,
  ControlledChoiceChips,
  ControlledSelectField,
  FieldRow,
  MobileTextArea,
  MobileTextField,
} from "@/components/ui";
import { LEAVE_PAGE } from "@/constants";
import type { ApplyLeaveFormValues, ReviewFormValues } from "@/hooks/useLeave";

type SubmitHandler = (e?: React.BaseSyntheticEvent) => Promise<unknown> | unknown;

interface SheetFooterProps {
  formId: string;
  cancelLabel: string;
  submitLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

function SheetFooter({ formId, cancelLabel, submitLabel, isSubmitting, onCancel }: SheetFooterProps) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="submit" form={formId} size="lg" className="flex-[2]" loading={isSubmitting}>
        {submitLabel}
      </Button>
    </div>
  );
}

// ─── Approve / reject ─────────────────────────────────────────────────────────

const DECISION_FORM_ID = "leave-decision-form";

const DECISION_OPTIONS = [
  { value: "APPROVED", label: LEAVE_PAGE.review.approve },
  { value: "REJECTED", label: LEAVE_PAGE.review.reject },
];

export interface LeaveDecisionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<ReviewFormValues>;
  onSubmit: SubmitHandler;
  isSubmitting: boolean;
}

export function LeaveDecisionSheet({ isOpen, onClose, form, onSubmit, isSubmitting }: LeaveDecisionSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={LEAVE_PAGE.review.title}
      maxHeight="85dvh"
      footer={
        <SheetFooter
          formId={DECISION_FORM_ID}
          cancelLabel={LEAVE_PAGE.review.cancel}
          submitLabel={LEAVE_PAGE.review.submit}
          isSubmitting={isSubmitting}
          onCancel={onClose}
        />
      }
    >
      <form id={DECISION_FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-3 pt-1">
        <ControlledChoiceChips
          control={form.control}
          name="status"
          label="Decision"
          required
          options={DECISION_OPTIONS}
        />
        <MobileTextArea
          label="Remarks"
          placeholder="Optional remarks"
          {...form.register("reviewer_remarks")}
        />
      </form>
    </BottomSheet>
  );
}

// ─── Apply for leave ──────────────────────────────────────────────────────────

const REQUEST_FORM_ID = "leave-request-form";

export interface LeaveRequestSheetProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<ApplyLeaveFormValues>;
  leaveTypeOptions: ReadonlyArray<{ value: string; label: string }>;
  onSubmit: SubmitHandler;
  isSubmitting: boolean;
}

export function LeaveRequestSheet({
  isOpen,
  onClose,
  form,
  leaveTypeOptions,
  onSubmit,
  isSubmitting,
}: LeaveRequestSheetProps) {
  const errors = form.formState.errors;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={LEAVE_PAGE.apply.title}
      maxHeight="92dvh"
      footer={
        <SheetFooter
          formId={REQUEST_FORM_ID}
          cancelLabel={LEAVE_PAGE.apply.cancel}
          submitLabel={LEAVE_PAGE.apply.submit}
          isSubmitting={isSubmitting}
          onCancel={onClose}
        />
      }
    >
      <form id={REQUEST_FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-3 pt-1">
        <ControlledSelectField
          control={form.control}
          name="leave_type_id"
          label="Leave type"
          required
          placeholder="Select leave type"
          options={leaveTypeOptions}
        />
        <FieldRow>
          <MobileTextField
            label="From"
            type="date"
            required
            error={errors.from_date?.message}
            {...form.register("from_date")}
          />
          <MobileTextField
            label="To"
            type="date"
            required
            error={errors.to_date?.message}
            {...form.register("to_date")}
          />
        </FieldRow>
        <MobileTextArea
          label="Reason"
          required
          placeholder="Reason for leave"
          error={errors.reason?.message}
          {...form.register("reason")}
        />
      </form>
    </BottomSheet>
  );
}
