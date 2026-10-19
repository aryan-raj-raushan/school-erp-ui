"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Div } from "./layout";
import { Span } from "./typography";
import { Button } from "./button";
import { useIsMobile } from "./responsive-bottom-sheet";
import { MobileFilterBar } from "./mobile-filter-bar";

export interface FilterOption {
  value: string;
  label: string;
}

export type FilterField =
  | {
      type: "search";
      key: string;
      placeholder?: string;
    }
  | {
      type: "select";
      key: string;
      label: string;
      placeholder: string;
      options: FilterOption[];
      disabled?: boolean;
      /** Other field keys to clear whenever this field's value changes (e.g. class depends on year). */
      resetKeys?: string[];
    }
  | {
      type: "custom";
      key: string;
      label: string;
      /** Renders arbitrary content (e.g. a date picker) in place of a select. */
      render: () => React.ReactNode;
      /** Label shown for this field's active-filter chip; falls back to the raw value. */
      chipLabel?: string;
    };

type SelectField = Extract<FilterField, { type: "select" }>;

export interface FilterToolbarProps {
  fields: FilterField[];
  values: Record<string, string | undefined>;
  onChange: (next: Record<string, string | undefined>) => void;
  onClear?: () => void;
  sheetTitle?: string;
  className?: string;
}

function fieldChangePayload(field: FilterField, value: string | undefined) {
  const next: Record<string, string | undefined> = { [field.key]: value };
  if (field.type === "select" && field.resetKeys) {
    field.resetKeys.forEach((key) => {
      next[key] = undefined;
    });
  }
  return next;
}

function CompactSelect({
  field,
  value,
  onSelect,
}: {
  field: SelectField;
  value: string | undefined;
  onSelect: (value: string | undefined) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);
  const [popoverRect, setPopoverRect] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  React.useLayoutEffect(() => {
    if (!isOpen) return;
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPopoverRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 168),
      });
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedLabel =
    field.options.find((o) => o.value === value)?.label ?? field.placeholder;

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => !field.disabled && setIsOpen((p) => !p)}
        disabled={field.disabled}
        className={cn(
          "flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-input bg-transparent px-4 text-[0.8rem] font-medium outline-none transition-colors",
          "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50",
          value ? "border-primary/40 text-foreground" : "text-muted-foreground",
          field.disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <Span className="max-w-24 truncate text-[0.8rem]">{selectedLabel}</Span>
        <ChevronDown
          size={12}
          className={cn(
            "shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen &&
        popoverRect &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[1000] max-h-60 min-w-40 overflow-auto rounded-[8px] border border-border bg-popover shadow-md"
            style={{
              top: popoverRect.top,
              left: popoverRect.left,
              width: popoverRect.width,
            }}
          >
            <button
              type="button"
              onClick={() => {
                onSelect(undefined);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                !value && "bg-accent font-medium",
              )}
            >
              {field.placeholder}
            </button>
            {field.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                  value === option.value && "bg-accent font-medium",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * Reusable, responsive filter bar for list pages.
 * Desktop: a single-line row of compact controls (search + small dropdown chips).
 * Mobile: filters are hidden behind a "Filter" button that opens a bottom
 * sheet; active selections show as a horizontally-scrollable chip strip
 * with per-chip remove buttons.
 */
export function FilterToolbar({
  fields,
  values,
  onChange,
  onClear,
  sheetTitle = "Filters",
  className,
}: FilterToolbarProps) {
  const isMobile = useIsMobile();

  const activeCount = fields.reduce(
    (count, field) => (values[field.key] ? count + 1 : count),
    0,
  );

  function handleFieldChange(field: FilterField, value: string | undefined) {
    onChange(fieldChangePayload(field, value));
  }

  function handleClear() {
    if (onClear) {
      onClear();
      return;
    }
    const cleared: Record<string, string | undefined> = {};
    fields.forEach((field) => {
      cleared[field.key] = undefined;
    });
    onChange(cleared);
  }

  if (isMobile) {
    return (
      <MobileFilterBar
        fields={fields}
        values={values}
        onChange={onChange}
        onClear={handleClear}
        sheetTitle={sheetTitle}
      />
    );
  }

  return (
    <Div className="rounded-xl border border-border/60 bg-white p-2 dark:bg-neutral-900">
      <Div
        type="row"
        align="center"
        gap="sm"
        className={cn("flex-nowrap overflow-x-auto pb-1", className)}
      >
        {fields.map((field) => {
          if (field.type === "search") {
            return (
              <Div key={field.key} className="relative shrink-0">
                <Search
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    handleFieldChange(field, e.target.value || undefined)
                  }
                  placeholder={field.placeholder}
                  className="h-9 w-40 rounded-lg border border-input bg-transparent pl-8 pr-3 text-[0.8rem] outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/50 sm:w-48 lg:w-72 xl:w-80"
                />
              </Div>
            );
          }

          if (field.type === "custom") {
            return (
              <div key={field.key} className="shrink-0">
                {field.render()}
              </div>
            );
          }

          return (
            <CompactSelect
              key={field.key}
              field={field}
              value={values[field.key]}
              onSelect={(val) => handleFieldChange(field, val)}
            />
          );
        })}

        {activeCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="shrink-0 gap-1 border-red-100 hover:bg-red-100/50 text-red-400"
          >
            <X size={12} className="text-red-400" />
            Clear
          </Button>
        )}
      </Div>
    </Div>
  );
}
