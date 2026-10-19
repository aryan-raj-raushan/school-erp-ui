"use client";

import type { ReactNode } from "react";
import { Badge, BottomSheet, Button, MobileTextArea } from "@/components/ui";

const FORM_ID = "leave-review-form";

export interface LeaveReviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** What is being decided: leave type, dates, reason … */
  summary: ReactNode;
  decision: "APPROVED" | "REJECTED";
  remarksProps: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: React.Ref<HTMLTextAreaElement> };
  remarksError?: string;
  remarksLabel: string;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown> | unknown;
  isSubmitting: boolean;
  confirmLabel: string;
  cancelLabel: string;
}

/** Phone bottom sheet for approving or rejecting a leave request. */
export function LeaveReviewSheet({
  isOpen,
  onClose,
  title,
  summary,
  decision,
  remarksProps,
  remarksError,
  remarksLabel,
  onSubmit,
  isSubmitting,
  confirmLabel,
  cancelLabel,
}: LeaveReviewSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxHeight="92dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            size="lg"
            className="flex-[2]"
            variant={decision === "APPROVED" ? "success" : "destructive"}
            loading={isSubmitting}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-4 pt-1">
        <div className="rounded-2xl bg-muted/50 p-4 text-sm">{summary}</div>
        <div className="flex items-center gap-2 px-1 text-sm font-medium">
          Decision
          <Badge variant={decision === "APPROVED" ? "success" : "danger"}>{decision}</Badge>
        </div>
        <MobileTextArea label={remarksLabel} error={remarksError} {...remarksProps} />
      </form>
    </BottomSheet>
  );
}
