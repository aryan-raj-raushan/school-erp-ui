"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputBase } from "./form";

const PM_HOURS_WITHOUT_SUFFIX = 5;

export function formatTime12h(value?: string | null): string {
  if (!value) return "";
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function parseTimeText(text: string): string | null {
  const raw = text.trim().toLowerCase().replace(/\s+/g, "");
  if (!raw) return null;
  const match = raw.match(/^(\d{1,2})(?:[:.]?(\d{2}))?(am|pm|a|p)?$/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const suffix = match[3]?.[0];
  if (minute > 59 || hour > 23) return null;
  if (suffix) {
    if (hour < 1 || hour > 12) return null;
    if (suffix === "p" && hour !== 12) hour += 12;
    if (suffix === "a" && hour === 12) hour = 0;
  } else if (hour >= 1 && hour <= PM_HOURS_WITHOUT_SUFFIX) {
    hour += 12;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function buildOptions(fromHour: number, toHour: number, stepMinutes: number): string[] {
  const options: string[] = [];
  for (let minutes = fromHour * 60; minutes <= toHour * 60; minutes += stepMinutes) {
    options.push(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`);
  }
  return options;
}

export interface TimeFieldProps {
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  stepMinutes?: number;
  fromHour?: number;
  toHour?: number;
  className?: string;
  id?: string;
}

/**
 * Fast time entry: type "830", "8:30 pm" or "14:15", or pick from a short list.
 * Value is a 24h "HH:MM" string — the same shape `<input type="time">` uses.
 */
export function TimeField({
  value,
  onChange,
  onBlur,
  placeholder = "e.g. 8:30 AM",
  disabled,
  error,
  stepMinutes = 15,
  fromHour = 6,
  toHour = 20,
  className,
  id,
}: TimeFieldProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = React.useState<string | null>(null);
  const [highlight, setHighlight] = React.useState(0);
  const isOpen = draft !== null;
  const text = draft ?? formatTime12h(value);
  const [rect, setRect] = React.useState<{ top: number; left: number; width: number } | null>(null);

  const allOptions = React.useMemo(() => buildOptions(fromHour, toHour, stepMinutes), [fromHour, toHour, stepMinutes]);

  const typed = text.trim().toLowerCase().replace(/^0/, "");
  const isEditingText = isOpen && text !== formatTime12h(value);
  const options = React.useMemo(() => {
    if (!isEditingText || !typed) return allOptions;
    const parsed = parseTimeText(text);
    const matches = allOptions.filter((opt) => formatTime12h(opt).toLowerCase().replace(/^0/, "").startsWith(typed));
    if (parsed && !matches.includes(parsed)) return [parsed, ...matches];
    return matches;
  }, [allOptions, isEditingText, typed, text]);

  React.useLayoutEffect(() => {
    if (!isOpen) return;
    function updatePosition() {
      const box = inputRef.current?.getBoundingClientRect();
      if (box) setRect({ top: box.bottom + 4, left: box.left, width: box.width });
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
    listRef.current?.querySelector<HTMLElement>(`[data-index="${highlight}"]`)?.scrollIntoView({ block: "nearest" });
  }, [highlight, isOpen, options]);

  function open() {
    if (isOpen) return;
    const index = value ? allOptions.findIndex((opt) => opt >= value) : allOptions.indexOf("08:00");
    setHighlight(Math.max(index, 0));
    setDraft(formatTime12h(value));
  }

  function commit(next: string | null) {
    if (next) onChange(next);
    setDraft(null);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (listRef.current?.contains(e.relatedTarget as Node)) return;
    if (!text.trim()) {
      onChange("");
      setDraft(null);
    } else {
      commit(parseTimeText(text) ?? value ?? null);
    }
    onBlur?.();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      open();
      setHighlight((h) => {
        const next = h + (e.key === "ArrowDown" ? 1 : -1);
        return Math.min(Math.max(next, 0), Math.max(options.length - 1, 0));
      });
    } else if (e.key === "Enter") {
      if (!isOpen) return;
      e.preventDefault();
      commit(options[highlight] ?? parseTimeText(text));
    } else if (e.key === "Escape") {
      setDraft(null);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Clock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="text"
        autoComplete="off"
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={(e) => {
          open();
          e.target.select();
        }}
        onClick={open}
        onChange={(e) => {
          setDraft(e.target.value);
          setHighlight(0);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          inputBase,
          "w-full pl-9",
          error && "border-destructive focus:ring-destructive/40 focus:border-destructive bg-destructive/5",
        )}
      />
      {isOpen && rect && options.length > 0 && createPortal(
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="fixed z-[1000] max-h-60 overflow-y-auto rounded-[8px] border border-border bg-popover py-1 shadow-md"
          style={{ top: rect.top, left: rect.left, width: Math.max(rect.width, 140) }}
        >
          {options.map((opt, index) => (
            <button
              key={opt}
              type="button"
              data-index={index}
              tabIndex={-1}
              role="option"
              aria-selected={opt === value}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlight(index)}
              onClick={() => commit(opt)}
              className={cn(
                "block w-full px-3 py-1.5 text-left text-sm",
                index === highlight && "bg-muted",
                opt === value && "font-semibold text-primary",
              )}
            >
              {formatTime12h(opt)}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
