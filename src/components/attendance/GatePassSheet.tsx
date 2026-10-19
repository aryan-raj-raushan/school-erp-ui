"use client";

import {
  BottomSheet,
  Button,
  FieldRow,
  MobileSelectField,
  MobileTextField,
} from "@/components/ui";

const FORM_ID = "gate-pass-form";

export interface GatePassSheetProps {
  isOpen: boolean;
  onClose: () => void;
  students: ReadonlyArray<{ id: string; label: string }>;
  isLoadingStudents: boolean;
  studentId: string;
  onStudentChange: (id: string) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  exitTime: string;
  onExitTimeChange: (value: string) => void;
  returnTime: string;
  onReturnTimeChange: (value: string) => void;
  attemptedSubmit: boolean;
  onSubmit: () => void;
}

const REQUIRED = "Required";

/** Phone bottom sheet for creating a student gate pass. */
export function GatePassSheet({
  isOpen,
  onClose,
  students,
  isLoadingStudents,
  studentId,
  onStudentChange,
  reason,
  onReasonChange,
  date,
  onDateChange,
  exitTime,
  onExitTimeChange,
  returnTime,
  onReturnTimeChange,
  attemptedSubmit,
  onSubmit,
}: GatePassSheetProps) {
  const missing = (value: string) => (attemptedSubmit && !value ? REQUIRED : undefined);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Create gate pass"
      maxHeight="92dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} size="lg" className="flex-[2]">
            Create gate pass
          </Button>
        </div>
      }
    >
      <form
        id={FORM_ID}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-3 pt-1"
      >
        <MobileSelectField
          label="Student"
          required
          disabled={isLoadingStudents}
          placeholder={isLoadingStudents ? "Loading students…" : "Select student"}
          value={studentId}
          onChange={onStudentChange}
          error={missing(studentId)}
          options={students.map((s) => ({ value: s.id, label: s.label }))}
        />
        <MobileTextField
          label="Reason"
          required
          placeholder="e.g. Doctor appointment"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          error={missing(reason)}
        />
        <MobileTextField
          label="Date"
          required
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
        <FieldRow>
          <MobileTextField
            label="Exit"
            required
            type="time"
            value={exitTime}
            onChange={(e) => onExitTimeChange(e.target.value)}
            error={missing(exitTime)}
          />
          <MobileTextField
            label="Return"
            required
            type="time"
            value={returnTime}
            onChange={(e) => onReturnTimeChange(e.target.value)}
            error={missing(returnTime)}
          />
        </FieldRow>
      </form>
    </BottomSheet>
  );
}
