"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputBase } from "./form";
import { BottomSheet } from "./action-sheet";
import { useIsMobileSync } from "@/hooks/useIsMobileSync";
import { haptic } from "@/lib/haptics";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  error = false,
}: MultiSelectProps) {
  const isMobile = useIsMobileSync();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isMobile) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  function toggle(optValue: string) {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  }

  function remove(optValue: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optValue));
  }

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={cn(
          inputBase,
          "w-full flex items-center justify-between gap-2 cursor-pointer text-left",
          error && "border-destructive focus:ring-destructive/40",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedLabels.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedLabels.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs rounded-[4px] px-2 py-0.5"
              >
                {o.label}
                {!disabled && (
                  <X
                    size={10}
                    className="cursor-pointer hover:text-destructive"
                    onClick={(e) => remove(o.value, e)}
                  />
                )}
              </span>
            ))
          )}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {isMobile && (
        <BottomSheet
          isOpen={open && !disabled}
          onClose={() => setOpen(false)}
          title={placeholder.replace(/\.{3}$/, "")}
          maxHeight="80dvh"
          footer={
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground active:opacity-80"
            >
              Done{value.length > 0 ? ` · ${value.length}` : ""}
            </button>
          }
        >
          {options.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No options available</p>
          ) : (
            <ul>
              {options.map((o) => {
                const checked = value.includes(o.value);
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => {
                        void haptic("light");
                        toggle(o.value);
                      }}
                      className="flex min-h-14 w-full items-center gap-3 rounded-xl px-2 text-left text-[15px] active:bg-muted"
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
                          checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {checked && <Check size={14} />}
                      </span>
                      {o.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </BottomSheet>
      )}

      {!isMobile && open && !disabled && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-[8px] border border-border bg-popover shadow-md">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No options available
            </div>
          ) : (
            options.map((o) => {
              const checked = value.includes(o.value);
              return (
                <label
                  key={o.value}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={checked}
                    onChange={() => toggle(o.value)}
                  />
                  {o.label}
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
