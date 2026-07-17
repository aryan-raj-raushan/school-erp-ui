"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Div } from "./layout";
import { P } from "./typography";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(a?: Date, b?: Date) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

/**
 * Simple, dependency-free single-month date grid — no react-day-picker,
 * just a controlled `selected`/`onSelect` pair so it drops into any form
 * or popover. Styled to match the rest of the design system (rounded-lg
 * surfaces, muted/primary states).
 */
export function Calendar({ selected, onSelect, minDate, maxDate, className }: CalendarProps) {
  const [viewDate, setViewDate] = React.useState(() => selected ?? new Date());

  React.useEffect(() => {
    if (selected) setViewDate(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected ? selected.getTime() : undefined]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = startOfDay(new Date());

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1)),
  ];

  function goPrevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function goNextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function isDisabled(date: Date) {
    if (minDate && date < startOfDay(minDate)) return true;
    if (maxDate && date > startOfDay(maxDate)) return true;
    return false;
  }

  return (
    <Div className={cn("w-64 select-none", className)}>
      <Div type="row" align="center" justify="between" className="mb-2 px-1">
        <button
          type="button"
          onClick={goPrevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft size={15} />
        </button>
        <P weight="medium" color="default" className="text-sm">
          {viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </P>
        <button
          type="button"
          onClick={goNextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight size={15} />
        </button>
      </Div>

      <div className="grid grid-cols-7 gap-1 px-1">
        {WEEKDAYS.map((day) => (
          <span key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 px-1 pt-1">
        {cells.map((date, index) => {
          if (!date) return <div key={index} />;
          const disabled = isDisabled(date);
          const isSelected = isSameDay(date, selected);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(date)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground font-medium"
                  : isToday
                    ? "border border-primary/50 text-foreground"
                    : "text-foreground hover:bg-muted",
                disabled && "pointer-events-none opacity-30",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </Div>
  );
}
