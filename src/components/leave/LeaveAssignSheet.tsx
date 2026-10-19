"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { BottomSheet, Button, ControlledSelectField } from "@/components/ui";

const FORM_ID = "leave-assign-form";

interface Option {
  value: string;
  label: string;
}

export interface LeaveAssignSheetProps<T extends FieldValues> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  form: UseFormReturn<T>;
  leaveTypeName: Path<T>;
  academicYearName: Path<T>;
  leaveTypeOptions: ReadonlyArray<Option>;
  academicYearOptions: ReadonlyArray<Option>;
  isLoadingLeaveTypes: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown> | unknown;
  isSubmitting: boolean;
  submitLabel: string;
  cancelLabel: string;
}

/** Phone bottom sheet for assigning a leave type to one employee. */
export function LeaveAssignSheet<T extends FieldValues>({
  isOpen,
  onClose,
  title,
  form,
  leaveTypeName,
  academicYearName,
  leaveTypeOptions,
  academicYearOptions,
  isLoadingLeaveTypes,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelLabel,
}: LeaveAssignSheetProps<T>) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxHeight="85dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="submit" form={FORM_ID} size="lg" className="flex-[2]" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-3 pt-1">
        <ControlledSelectField
          control={form.control}
          name={leaveTypeName}
          label="Leave type"
          required
          disabled={isLoadingLeaveTypes}
          placeholder={isLoadingLeaveTypes ? "Loading…" : "Select leave type"}
          options={leaveTypeOptions}
        />
        <ControlledSelectField
          control={form.control}
          name={academicYearName}
          label="Academic year"
          required
          placeholder="Select academic year"
          options={academicYearOptions}
        />
      </form>
    </BottomSheet>
  );
}
