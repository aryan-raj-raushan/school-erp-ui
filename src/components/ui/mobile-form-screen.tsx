"use client";

import * as React from "react";
import { Button } from "./button";
import { StickyActionBar } from "./mobile-detail";

export interface MobileFormScreenProps {
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  /** Omit for settings-style screens that only have Save. */
  onCancel?: () => void;
  children: React.ReactNode;
}

/**
 * Single-screen phone form: a large title, the fields, and a pinned
 * Cancel / Save bar. For forms that don't need `MultiStepForm`.
 */
export function MobileFormScreen({
  title,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  children,
}: MobileFormScreenProps) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="flex flex-col gap-5 pt-4"
    >
      <h1 className="px-1 text-xl font-bold">{title}</h1>

      {children}

      <StickyActionBar>
        {onCancel && (
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" className="flex-[2]" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </StickyActionBar>
    </form>
  );
}
