"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Div } from "./layout";
import { Span, FilterLabel } from "./typography";
import { Button } from "./button";
import { Badge } from "./badge";
import { useIsMobile, ResponsiveBottomSheet } from "./responsive-bottom-sheet";

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
      setPopoverRect({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 168) });
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
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedLabel = field.options.find((o) => o.value === value)?.label ?? field.placeholder;

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
          className={cn("shrink-0 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && popoverRect && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[1000] max-h-60 min-w-40 overflow-auto rounded-[8px] border border-border bg-popover shadow-md"
          style={{ top: popoverRect.top, left: popoverRect.left, width: popoverRect.width }}
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
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const activeCount = fields.reduce(
    (count, field) => (values[field.key] ? count + 1 : count),
    0,
  );

  function handleFieldChange(field: FilterField, value: string | undefined) {
    onChange(fieldChangePayload(field, value));
  }

  function handleClear() {
    onClear?.();
    setIsSheetOpen(false);
  }

  const activeChips = fields
    .filter((field) => Boolean(values[field.key]))
    .map((field) => {
      if (field.type === "search") {
        return { key: field.key, label: `"${values[field.key]}"` };
      }
      const optionLabel = field.options.find((o) => o.value === values[field.key])?.label;
      return { key: field.key, label: `${field.label}: ${optionLabel ?? values[field.key]}` };
    });

  if (isMobile) {
    return (
      <Div gap="sm" className={className}>
        <Div type="row" align="center" gap="sm">
          <Button
            variant="outline"
            size="default"
            onClick={() => setIsSheetOpen(true)}
            className="w-fit gap-2"
          >
            <SlidersHorizontal size={14} />
            Filter
            {activeCount > 0 && (
              <Badge variant="primary" className="ml-0.5 h-4 min-w-4 px-1 text-[10px]">
                {activeCount}
              </Badge>
            )}
          </Button>

          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              title="Clear all filters"
            >
              <X size={16} />
            </Button>
          )}
        </Div>

        {activeChips.length > 0 && (
          <Div type="row" align="center" gap="sm" className="-mx-1 overflow-x-auto px-1 pb-1">
            {activeChips.map((chip) => (
              <Div
                key={chip.key}
                type="row"
                align="center"
                gap="xs"
                className="shrink-0 whitespace-nowrap rounded-full border border-border bg-muted/50 px-2.5 py-1"
              >
                <Span className="text-xs">{chip.label}</Span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-4 w-4 min-w-0 min-h-0 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const field = fields.find((f) => f.key === chip.key);
                    if (field) handleFieldChange(field, undefined);
                  }}
                >
                  <X size={10} />
                </Button>
              </Div>
            ))}
          </Div>
        )}

        <ResponsiveBottomSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title={sheetTitle}
        >
          <Div gap="lg">
            {fields.map((field) =>
              field.type === "search" ? (
                <Div key={field.key} className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={values[field.key] ?? ""}
                    onChange={(e) => handleFieldChange(field, e.target.value || undefined)}
                    placeholder={field.placeholder}
                    className="h-10 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </Div>
              ) : (
                <Div key={field.key}>
                  <FilterLabel className="mb-2">{field.label}</FilterLabel>
                  <Div type="row" wrap gap="sm">
                    <button
                      type="button"
                      onClick={() => handleFieldChange(field, undefined)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        !values[field.key]
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      {field.placeholder}
                    </button>
                    {field.options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        disabled={field.disabled}
                        onClick={() => handleFieldChange(field, option.value)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          values[field.key] === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted/50",
                          field.disabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </Div>
                </Div>
              ),
            )}
          </Div>

          <Div type="row" gap="sm" className="mt-6 border-t border-border/50 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="grow shrink basis-0 min-w-0"
              onClick={handleClear}
            >
              Clear All
            </Button>
            <Button
              size="sm"
              className="grow shrink basis-0 min-w-0"
              onClick={() => setIsSheetOpen(false)}
            >
              Done
            </Button>
          </Div>
        </ResponsiveBottomSheet>
      </Div>
    );
  }

  return (
    <Div
      type="row"
      align="center"
      gap="sm"
      className={cn("flex-nowrap overflow-x-auto pb-1", className)}
    >
      {fields.map((field) =>
        field.type === "search" ? (
          <Div key={field.key} className="relative shrink-0">
            <Search
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={values[field.key] ?? ""}
              onChange={(e) => handleFieldChange(field, e.target.value || undefined)}
              placeholder={field.placeholder}
              className="h-9 w-40 rounded-lg border border-input bg-transparent pl-8 pr-3 text-[0.8rem] outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:w-48 lg:w-72 xl:w-80"
            />
          </Div>
        ) : (
          <CompactSelect
            key={field.key}
            field={field}
            value={values[field.key]}
            onSelect={(val) => handleFieldChange(field, val)}
          />
        ),
      )}

      {activeCount > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="shrink-0 gap-1"
        >
          <X size={13} />
          Clear
        </Button>
      )}
    </Div>
  );
}
