"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs } from "./tabs";

export interface ScheduleDay {
  id: string;
  label: string;
}

export interface ScheduleSlot {
  id: string;
  /** Short marker on the left, e.g. "P1". */
  marker: string;
  timeLabel?: string;
  title?: string;
  subtitle?: string;
  isBreak?: boolean;
}

export interface DayScheduleProps {
  days: ReadonlyArray<ScheduleDay>;
  activeDay: string;
  onDayChange: (dayId: string) => void;
  slots: ReadonlyArray<ScheduleSlot>;
  emptyText?: string;
}

export function ScheduleSlotList({
  slots,
  emptyText = "Nothing scheduled",
}: {
  slots: ReadonlyArray<ScheduleSlot>;
  emptyText?: string;
}) {
  return (
    <>
      {slots.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3",
                slot.isBreak
                  ? "border-dashed border-border bg-muted/30"
                  : "border-border/60 bg-white dark:bg-neutral-900",
              )}
            >
              <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-primary/10 py-2 text-primary-text">
                <span className="text-sm font-bold">{slot.marker}</span>
              </div>
              <div className="min-w-0 flex-1">
                {slot.isBreak ? (
                  <p className="text-sm font-medium text-muted-foreground">Break</p>
                ) : slot.title ? (
                  <>
                    <p className="truncate text-[15px] font-semibold">{slot.title}</p>
                    {slot.subtitle && (
                      <p className="truncate text-xs text-muted-foreground">{slot.subtitle}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Free period</p>
                )}
              </div>
              {slot.timeLabel && (
                <span className="shrink-0 text-right text-[11px] text-muted-foreground">
                  {slot.timeLabel}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

/**
 * Phone view of a weekly timetable: scrollable day tabs and a vertical list
 * of that day's periods (time, subject, teacher, breaks).
 */
export function DaySchedule({
  days,
  activeDay,
  onDayChange,
  slots,
  emptyText = "Nothing scheduled",
}: DayScheduleProps) {
  return (
    <div className="flex flex-col gap-3">
      <Tabs
        options={days.map((d) => ({ value: d.id, label: d.label }))}
        value={activeDay}
        onChange={onDayChange}
      />

      <ScheduleSlotList slots={slots} emptyText={emptyText} />
    </div>
  );
}
