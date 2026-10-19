"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export type SegmentTone = "primary" | "success" | "danger" | "warning" | "info";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  tone?: SegmentTone;
  disabled?: boolean;
}

const activeTone: Record<SegmentTone, string> = {
  primary: "bg-primary text-primary-foreground",
  success: "bg-emerald-500 text-white",
  danger: "bg-red-500 text-white",
  warning: "bg-amber-500 text-white",
  info: "bg-sky-500 text-white",
};

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T | undefined;
  onChange: (value: T) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Equal-width, thumb-friendly (44px) single-choice control. Tapping the
 * active segment does nothing; each tone colours its own active state so
 * status choices (present / absent / late) read at a glance.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("grid gap-1 rounded-2xl bg-muted p-1", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const isDisabled = disabled || option.disabled;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={isDisabled}
            onClick={() => {
              if (selected) return;
              void haptic("light");
              onChange(option.value);
            }}
            className={cn(
              "h-11 rounded-xl text-sm font-semibold transition-colors active:scale-95 disabled:opacity-50",
              selected
                ? activeTone[option.tone ?? "primary"]
                : "text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
