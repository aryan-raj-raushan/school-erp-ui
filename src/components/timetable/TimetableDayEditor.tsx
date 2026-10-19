"use client";

import { useState } from "react";
import { Coffee, Copy } from "lucide-react";
import { Button, MobileSelectField, Tabs } from "@/components/ui";
import { DAY_LABELS, DAYS_OF_WEEK } from "@/constants";

type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

type CellField = "subject_id" | "teacher_id";

interface Option {
  id: string;
  name: string;
}

export interface TimetableDayEditorProps {
  days: ReadonlyArray<DayOfWeek>;
  periods: ReadonlyArray<number>;
  isBreak: (period: number) => boolean;
  timeLabel: (period: number) => string | null;
  getCell: (day: DayOfWeek, period: number) => { subject_id?: string; teacher_id?: string } | undefined;
  subjects: ReadonlyArray<Option>;
  staff: ReadonlyArray<Option>;
  onChange: (day: DayOfWeek, period: number, field: CellField, value: string) => void;
}

/**
 * Phone editor for a weekly timetable: day tabs, one card per period with
 * subject and teacher pickers, and a shortcut to copy the previous day.
 */
export function TimetableDayEditor({
  days,
  periods,
  isBreak,
  timeLabel,
  getCell,
  subjects,
  staff,
  onChange,
}: TimetableDayEditorProps) {
  const [activeDay, setActiveDay] = useState<DayOfWeek>(days[0]);
  const dayIndex = days.indexOf(activeDay);
  const previousDay = dayIndex > 0 ? days[dayIndex - 1] : null;

  function copyPreviousDay() {
    if (!previousDay) return;
    periods.forEach((period) => {
      if (isBreak(period)) return;
      const source = getCell(previousDay, period);
      onChange(activeDay, period, "subject_id", source?.subject_id ?? "");
      onChange(activeDay, period, "teacher_id", source?.teacher_id ?? "");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        options={days.map((day) => ({ value: day, label: DAY_LABELS[day] }))}
        value={activeDay}
        onChange={setActiveDay}
      />

      {previousDay && (
        <Button type="button" variant="outline" onClick={copyPreviousDay}>
          <Copy size={16} /> Copy {DAY_LABELS[previousDay]}&apos;s schedule
        </Button>
      )}

      <ol className="flex flex-col gap-3">
        {periods.map((period) => {
          if (isBreak(period)) {
            return (
              <li
                key={period}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200"
              >
                <Coffee size={18} /> Break
                {timeLabel(period) && <span className="ml-auto text-xs">{timeLabel(period)}</span>}
              </li>
            );
          }
          const cell = getCell(activeDay, period);
          return (
            <li
              key={period}
              className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white p-3 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between px-1">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary-text">
                  Period {period}
                </span>
                {timeLabel(period) && (
                  <span className="text-xs text-muted-foreground">{timeLabel(period)}</span>
                )}
              </div>
              <MobileSelectField
                label="Subject"
                value={cell?.subject_id ?? ""}
                placeholder="Select subject"
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                onChange={(value) => onChange(activeDay, period, "subject_id", value)}
              />
              <MobileSelectField
                label="Teacher"
                value={cell?.teacher_id ?? ""}
                placeholder="Select teacher"
                options={staff.map((s) => ({ value: s.id, label: s.name }))}
                onChange={(value) => onChange(activeDay, period, "teacher_id", value)}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
