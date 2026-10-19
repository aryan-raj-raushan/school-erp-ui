"use client";

import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

const DAYS = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
];

export interface MobileDayPickerProps {
  /** Comma-separated day codes, e.g. `MON,TUE,WED`. */
  value: string;
  onChange: (value: string) => void;
}

/** Thumb-sized weekday toggles for working-day settings. */
export function MobileDayPicker({ value, onChange }: MobileDayPickerProps) {
  const active = value.split(",").filter(Boolean);

  function toggle(day: string) {
    void haptic("light");
    const next = active.includes(day) ? active.filter((d) => d !== day) : [...active, day];
    onChange(DAYS.filter((d) => next.includes(d.value)).map((d) => d.value).join(","));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((day) => {
        const selected = active.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(day.value)}
            className={cn(
              "h-11 min-w-14 rounded-full border px-4 text-sm font-semibold active:scale-95",
              selected
                ? "border-primary bg-primary/10 text-primary-text"
                : "border-border text-muted-foreground",
            )}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
