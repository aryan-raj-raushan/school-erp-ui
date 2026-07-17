"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Calendar } from "./calendar";
import { inputBase } from "./form";
import { useIsMobile, ResponsiveDropdownContainer } from "./responsive-bottom-sheet";

function parseISODate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface DatePickerProps {
  /** ISO date string ("YYYY-MM-DD") — same shape a native `<input type="date">` uses. */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  /** "default" matches form inputs (h-11); "compact" matches filter-bar chips (h-9). */
  size?: "default" | "compact";
}

/**
 * Drop-in replacement for `<input type="date">` — a compact trigger button
 * that opens the `Calendar` component (popover on desktop, bottom sheet on
 * mobile). Works with plain ISO date strings so it swaps in anywhere a
 * native date input was used.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  disabled,
  className,
  size = "default",
}: DatePickerProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);
  const [popoverRect, setPopoverRect] = React.useState<{ top: number; left: number } | null>(null);

  const selectedDate = parseISODate(value);

  React.useLayoutEffect(() => {
    if (isMobile || !isOpen) return;
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPopoverRect({ top: rect.bottom + 4, left: rect.left });
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isMobile, isOpen]);

  React.useEffect(() => {
    if (isMobile || !isOpen) return;
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
  }, [isMobile, isOpen]);

  function handleSelect(date: Date) {
    onChange(toISODate(date));
    setIsOpen(false);
  }

  const calendar = (
    <Calendar selected={selectedDate} onSelect={handleSelect} minDate={minDate} maxDate={maxDate} />
  );

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((p) => !p)}
        className={cn(
          size === "compact"
            ? "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-transparent px-4 text-[0.8rem] font-medium outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50"
            : cn(inputBase, "flex items-center gap-2"),
          "w-full text-left",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <CalendarIcon size={size === "compact" ? 13 : 14} className="shrink-0 text-muted-foreground" />
        <span className={cn("truncate", !selectedDate && "text-muted-foreground")}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
      </button>

      {!isMobile && isOpen && popoverRect && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[1000] rounded-[8px] border border-border bg-popover p-3 shadow-md"
          style={{ top: popoverRect.top, left: popoverRect.left }}
        >
          {calendar}
        </div>,
        document.body,
      )}

      {isMobile && (
        <ResponsiveDropdownContainer isOpen={isOpen} onClose={() => setIsOpen(false)} title={placeholder}>
          <div className="flex justify-center">{calendar}</div>
        </ResponsiveDropdownContainer>
      )}
    </div>
  );
}
