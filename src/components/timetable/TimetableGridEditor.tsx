"use client";

import { Fragment, useRef, useState } from "react";
import { Coffee, GripVertical } from "lucide-react";
import { Badge, ResponsiveSelect } from "@/components/ui";
import type { DayOfWeek, PeriodTimeDto } from "@/services/timetable.service";

interface DragPayload {
  day: DayOfWeek;
  period: number;
}

interface Option {
  id: string;
  name: string;
}

type CellField = "subject_id" | "teacher_id";

export interface TimetableGridEditorProps {
  days: ReadonlyArray<DayOfWeek>;
  dayLabels: Record<string, string>;
  periods: ReadonlyArray<number>;
  periodTimes: ReadonlyArray<PeriodTimeDto>;
  timeRangeLabel: (pt?: PeriodTimeDto) => string | null;
  grid: Partial<Record<DayOfWeek, Record<number, { subject_id?: string; teacher_id?: string } | undefined>>>;
  subjects: ReadonlyArray<Option>;
  staff: ReadonlyArray<Option>;
  onChange: (day: DayOfWeek, period: number, field: CellField, value: string) => void;
  onSwap: (dayA: DayOfWeek, periodA: number, dayB: DayOfWeek, periodB: number) => void;
}

const cellClass = (isDragOver: boolean, isFilled: boolean) => {
  const state = isDragOver
    ? "border-primary bg-primary/10 ring-2 ring-primary ring-inset"
    : isFilled
      ? "border-border/60 bg-card hover:border-primary/40 hover:shadow-sm"
      : "border-dashed border-border/50 bg-muted/10";
  return `flex flex-col gap-1.5 rounded-lg border p-2 transition-all ${state}`;
};

/** Desktop weekly timetable grid where any period can be dragged onto another to swap. */
export function TimetableGridEditor({
  days,
  dayLabels,
  periods,
  periodTimes,
  timeRangeLabel,
  grid,
  subjects,
  staff,
  onChange,
  onSwap,
}: TimetableGridEditorProps) {
  const draggingRef = useRef<DragPayload | null>(null);
  const [dragOver, setDragOver] = useState<DragPayload | null>(null);

  const isBreak = (period: number) =>
    periodTimes.find((pt) => pt.period_number === period)?.is_break ?? false;

  function clearDrag() {
    draggingRef.current = null;
    setDragOver(null);
  }

  function handleDrop(day: DayOfWeek, period: number) {
    const from = draggingRef.current;
    clearDrag();
    if (!from || isBreak(period)) return;
    onSwap(from.day, from.period, day, period);
  }

  return (
    <div className="overflow-x-auto p-5" onDragEnd={clearDrag}>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `84px repeat(${periods.length}, minmax(152px, 1fr))` }}
      >
        <div className="sticky left-0 top-0 z-20 flex items-center justify-center rounded-lg bg-muted px-2 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Day</p>
        </div>
        {periods.map((p) => {
          const pt = periodTimes.find((x) => x.period_number === p);
          const label = timeRangeLabel(pt);
          return (
            <div
              key={`head-${p}`}
              className="sticky top-0 z-10 flex flex-col items-center justify-center gap-0.5 rounded-lg bg-muted px-2 py-2"
            >
              {isBreak(p) ? <Badge variant="warning">Break</Badge> : <Badge variant="secondary">Period {p}</Badge>}
              {label && <p className="text-[10px] text-muted-foreground">{label}</p>}
            </div>
          );
        })}

        {days.map((day) => (
          <Fragment key={day}>
            <div className="sticky left-0 z-10 flex items-center justify-center rounded-lg bg-muted/60 px-2 py-2">
              <p className="text-sm font-semibold text-foreground">{dayLabels[day]}</p>
            </div>
            {periods.map((p) => {
              if (isBreak(p)) {
                return (
                  <div
                    key={p}
                    className="flex flex-col items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50/60 py-3 dark:border-amber-900/40 dark:bg-amber-950/10"
                  >
                    <Coffee size={14} className="text-amber-500" />
                    <p className="text-xs text-muted-foreground">Break</p>
                  </div>
                );
              }
              const cell = grid[day]?.[p];
              const isFilled = !!(cell?.subject_id || cell?.teacher_id);
              const isDragOver = dragOver?.day === day && dragOver?.period === p;
              return (
                <div
                  key={p}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver({ day, period: p });
                  }}
                  onDragLeave={() =>
                    setDragOver((prev) => (prev?.day === day && prev?.period === p ? null : prev))
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(day, p);
                  }}
                  className={cellClass(isDragOver, isFilled)}
                >
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      draggable={isFilled}
                      onDragStart={() => {
                        if (isFilled) draggingRef.current = { day, period: p };
                      }}
                      onDragEnd={clearDrag}
                      disabled={!isFilled}
                      title={isFilled ? "Drag to swap" : undefined}
                      className={`flex h-5 w-5 items-center justify-center rounded text-muted-foreground ${
                        isFilled ? "cursor-grab hover:bg-muted active:cursor-grabbing" : "opacity-0"
                      }`}
                    >
                      <GripVertical size={12} />
                    </button>
                  </div>
                  <ResponsiveSelect
                    value={cell?.subject_id ?? ""}
                    onChange={(e) => onChange(day, p, "subject_id", e.target.value)}
                    className="text-xs"
                    customPlaceholder="Subject"
                    options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                  />
                  <ResponsiveSelect
                    value={cell?.teacher_id ?? ""}
                    onChange={(e) => onChange(day, p, "teacher_id", e.target.value)}
                    className="text-xs"
                    customPlaceholder="Teacher"
                    options={staff.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
