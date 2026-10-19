"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { BottomSheet } from "./action-sheet";
import type { FilterField } from "./filter-toolbar";

export interface MobileFilterBarProps {
  fields: FilterField[];
  values: Record<string, string | undefined>;
  onChange: (next: Record<string, string | undefined>) => void;
  onClear: () => void;
  sheetTitle?: string;
  searchDebounceMs?: number;
}

type SelectField = Extract<FilterField, { type: "select" }>;

function resetPayload(field: FilterField, value: string | undefined) {
  const next: Record<string, string | undefined> = { [field.key]: value };
  if (field.type === "select") {
    field.resetKeys?.forEach((key) => {
      next[key] = undefined;
    });
  }
  return next;
}

function optionLabel(field: SelectField, value: string) {
  return field.options.find((o) => o.value === value)?.label ?? value;
}

function Chip({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-10 rounded-full border px-4 text-sm font-medium transition-colors active:scale-95",
        selected
          ? "border-primary bg-primary/10 text-primary-text"
          : "border-border text-muted-foreground",
        disabled && "opacity-40",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Mobile list header: an always-visible debounced search box, a filter
 * button (with active count) that opens a bottom sheet, and a scrollable
 * strip of removable chips for the active filters. Driven by the same
 * `FilterField[]` config as the desktop `FilterToolbar`.
 */
export function MobileFilterBar({
  fields,
  values,
  onChange,
  onClear,
  sheetTitle = "Filters",
  searchDebounceMs = 350,
}: MobileFilterBarProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const searchField = fields.find((f) => f.type === "search");
  const otherFields = fields.filter((f) => f.type !== "search");
  const externalSearch = searchField ? (values[searchField.key] ?? "") : "";

  const [searchText, setSearchText] = React.useState(externalSearch);
  const [syncedSearch, setSyncedSearch] = React.useState(externalSearch);
  if (syncedSearch !== externalSearch) {
    setSyncedSearch(externalSearch);
    setSearchText(externalSearch);
  }

  React.useEffect(() => {
    if (!searchField || searchText === externalSearch) return;
    const timer = setTimeout(
      () => onChange({ [searchField.key]: searchText || undefined }),
      searchDebounceMs,
    );
    return () => clearTimeout(timer);
    // onChange identity changes every render; the debounce only needs to
    // restart when the text itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const activeFilters = otherFields.filter((f) => Boolean(values[f.key]));
  const hasAnyActive = activeFilters.length > 0 || Boolean(externalSearch);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {searchField && (
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={searchField.placeholder ?? "Search"}
              className="h-12 w-full rounded-2xl border border-border bg-white pl-11 pr-11 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary dark:bg-neutral-900 [&::-webkit-search-cancel-button]:hidden"
            />
            {searchText && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchText("")}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {otherFields.length > 0 && (
          <button
            type="button"
            aria-label="Filters"
            onClick={() => setSheetOpen(true)}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-white active:bg-muted dark:bg-neutral-900"
          >
            <SlidersHorizontal size={19} />
            {activeFilters.length > 0 && (
              <Badge
                variant="primary"
                className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[11px]"
              >
                {activeFilters.length}
              </Badge>
            )}
          </button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeFilters.map((field) => {
            const raw = values[field.key] as string;
            const label =
              field.type === "select"
                ? optionLabel(field, raw)
                : field.type === "custom"
                  ? (field.chipLabel ?? raw)
                  : raw;
            return (
              <button
                key={field.key}
                type="button"
                onClick={() => onChange(resetPayload(field, undefined))}
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 pl-3 pr-2 text-xs font-medium text-primary-text active:scale-95"
              >
                {label}
                <X size={13} />
              </button>
            );
          })}
          <button
            type="button"
            onClick={onClear}
            className="h-8 shrink-0 rounded-full px-3 text-xs font-medium text-destructive active:bg-destructive/10"
          >
            Clear all
          </button>
        </div>
      )}

      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={sheetTitle}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              disabled={!hasAnyActive}
              onClick={onClear}
              className="h-12 flex-1 rounded-2xl border border-border text-sm font-semibold disabled:opacity-40 active:bg-muted"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="h-12 flex-1 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground active:opacity-80"
            >
              Show results
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 pt-1">
          {otherFields.map((field) => {
            if (field.type === "custom") {
              return (
                <div key={field.key}>
                  <p className="mb-2 text-sm font-semibold">{field.label}</p>
                  {field.render()}
                </div>
              );
            }
            if (field.type !== "select") return null;
            return (
              <div key={field.key}>
                <p className="mb-2.5 text-sm font-semibold">{field.label}</p>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    selected={!values[field.key]}
                    onClick={() => onChange(resetPayload(field, undefined))}
                  >
                    {field.placeholder}
                  </Chip>
                  {field.options.map((option) => (
                    <Chip
                      key={option.value}
                      selected={values[field.key] === option.value}
                      disabled={field.disabled}
                      onClick={() =>
                        onChange(resetPayload(field, option.value))
                      }
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
                {field.disabled && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Select the previous filter first.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
