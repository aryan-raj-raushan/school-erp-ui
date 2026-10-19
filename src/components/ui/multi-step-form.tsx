"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { StickyActionBar } from "./mobile-detail";
import { StepProgress, type StepProgressItem } from "./mobile-form";

// ─── StepPanel ────────────────────────────────────────────────────────────────

const ActiveStepContext = React.createContext<string>("");

/**
 * Content of one step. Inactive panels stay mounted (so react-hook-form
 * state and validation are untouched) but are hidden.
 */
export function StepPanel({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const activeId = React.useContext(ActiveStepContext);
  return (
    <div className={cn(activeId === id ? "flex flex-col gap-5" : "hidden", className)}>
      {children}
    </div>
  );
}

// ─── MultiStepForm ────────────────────────────────────────────────────────────

export interface MultiStepFormProps {
  title: string;
  steps: ReadonlyArray<StepProgressItem>;
  activeId: string;
  onSelectStep: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
  /** Edit mode: shows a Save button in the header so any step can be saved directly. */
  quickSave?: boolean;
  /** Shows a Cancel button in the header (e.g. to leave edit mode). */
  onCancel?: () => void;
  /** Notices shown above the first step (drafts, prefill info …). */
  banner?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * App-style multi-step form shell: sticky title + progress header, the
 * active step's content, and a pinned Back / Next (Submit on the last
 * step) bar. Pair with `useMultiStepForm` and wrap each step in
 * `<StepPanel id=…>`. Pressing Enter in a field moves to the next step.
 */
export function MultiStepForm({
  title,
  steps,
  activeId,
  onSelectStep,
  isFirst,
  isLast,
  onBack,
  onNext,
  onSubmit,
  submitLabel,
  isSubmitting,
  quickSave,
  onCancel,
  banner,
  children,
}: MultiStepFormProps) {
  return (
    <ActiveStepContext.Provider value={activeId}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) onSubmit();
          else onNext();
        }}
      >
        <div className="sticky top-0 z-20 -mx-4 border-b border-border/60 bg-background/95 px-4 pb-2 pt-3 backdrop-blur">
          <div className="mb-1 flex items-center justify-between gap-3">
            <h1 className="truncate text-lg font-bold">{title}</h1>
            <div className="flex shrink-0 items-center gap-2">
              {onCancel && (
                <Button type="button" size="sm" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {quickSave && (
                <Button
                  type="button"
                  size="sm"
                  loading={isSubmitting}
                  onClick={onSubmit}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
          <StepProgress steps={steps} activeId={activeId} onSelect={onSelectStep} />
        </div>

        {banner && <div className="pt-4">{banner}</div>}

        <div className="pb-2 pt-4">{children}</div>

        <StickyActionBar>
          {!isFirst && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onBack}
            >
              Back
            </Button>
          )}
          {isLast ? (
            <Button
              type="button"
              size="lg"
              className="flex-[2]"
              loading={isSubmitting}
              onClick={onSubmit}
            >
              {submitLabel}
            </Button>
          ) : (
            <Button type="button" size="lg" className="flex-[2]" onClick={onNext}>
              Next
            </Button>
          )}
        </StickyActionBar>
      </form>
    </ActiveStepContext.Provider>
  );
}
