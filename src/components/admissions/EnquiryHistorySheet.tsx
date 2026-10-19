"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  BottomSheet,
  Button,
  ControlledChoiceChips,
  FieldRow,
  MobileTextArea,
  MobileTextField,
} from "@/components/ui";
import { ACTION_OPTIONS } from "@/constants/admission.constants";
import type { EnquiryHistoryFormValues } from "@/lib/validations/admissions.validation";

const FORM_ID = "enquiry-history-form";

export interface EnquiryHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<EnquiryHistoryFormValues>;
  onSubmit: () => Promise<unknown> | unknown;
  isSubmitting: boolean;
  /** When the action was chosen from a shortcut (confirm / reject) it can't be changed. */
  lockedAction: boolean;
}

const TITLES: Record<string, string> = {
  NEXT_FOLLOW_UP_UPDATE: "Update follow-up",
  ADMISSION_CONFIRMED: "Confirm admission",
  ENQUIRY_REJECTED: "Reject enquiry",
};

/** Bottom-sheet form for adding an entry to an enquiry's history on phones. */
export function EnquiryHistorySheet({
  isOpen,
  onClose,
  form,
  onSubmit,
  isSubmitting,
  lockedAction,
}: EnquiryHistorySheetProps) {
  const { control, register, watch, formState } = form;
  const errors = formState.errors;
  const action = watch("action");

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={TITLES[action] ?? "Add history entry"}
      maxHeight="92dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            size="lg"
            className="flex-[2]"
            loading={isSubmitting}
          >
            Save entry
          </Button>
        </div>
      }
    >
      <form
        id={FORM_ID}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
        className="flex flex-col gap-3 pt-1"
      >
        {!lockedAction && (
          <ControlledChoiceChips
            control={control}
            name="action"
            label="Action"
            required
            options={ACTION_OPTIONS}
          />
        )}

        {action === "NEXT_FOLLOW_UP_UPDATE" && (
          <FieldRow>
            <MobileTextField
              label="Next date"
              type="date"
              required
              error={errors.next_followup_date?.message}
              {...register("next_followup_date")}
            />
            <MobileTextField
              label="Time"
              type="time"
              error={errors.next_followup_time?.message}
              {...register("next_followup_time")}
            />
          </FieldRow>
        )}

        <MobileTextField
          label="Details"
          placeholder="Brief summary of what happened"
          error={errors.details?.message}
          {...register("details")}
        />
        <MobileTextArea
          label="Remarks"
          required
          placeholder="Add detailed remarks…"
          error={errors.remarks?.message}
          {...register("remarks")}
        />
      </form>
    </BottomSheet>
  );
}
