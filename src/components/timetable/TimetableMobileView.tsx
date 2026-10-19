"use client";

import { useState } from "react";
import { Pencil, Send, Undo2 } from "lucide-react";
import {
  Badge,
  Button,
  DaySchedule,
  PullToRefresh,
  StickyActionBar,
  type ScheduleSlot,
} from "@/components/ui";
import { DAY_LABELS } from "@/constants";
import type { useViewTimetable } from "@/hooks/useViewTimetable";

type TimetableState = ReturnType<typeof useViewTimetable>;

function todayDay(days: TimetableState["days"]) {
  const index = (new Date().getDay() + 6) % 7;
  return days[index] ?? days[0];
}

export function TimetableMobileView({
  state,
  onRefresh,
}: {
  state: TimetableState;
  onRefresh: () => Promise<unknown> | void;
}) {
  const { timetable, periods, days, getCell, getPeriodTime } = state;
  const [activeDay, setActiveDay] = useState(() => todayDay(days));

  if (!timetable) return null;

  const slots: ScheduleSlot[] = periods.map((period) => {
    const periodTime = getPeriodTime(period);
    const cell = getCell(activeDay, period);
    const timeLabel = periodTime?.start_time
      ? `${periodTime.start_time}${periodTime.end_time ? ` – ${periodTime.end_time}` : ""}`
      : undefined;
    return {
      id: `${activeDay}-${period}`,
      marker: `P${period}`,
      timeLabel,
      isBreak: periodTime?.is_break ?? false,
      title: cell?.subject_name ?? undefined,
      subtitle: cell?.teacher_name ?? undefined,
    };
  });

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="flex flex-col gap-4 pt-3">
        <header>
          <h1 className="text-xl font-bold">{timetable.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {timetable.class_name && <span>{timetable.class_name}</span>}
            <span>· {timetable.max_periods} periods</span>
            <Badge variant={timetable.is_complete ? "success" : "default"}>
              {timetable.is_complete ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Class teacher: {timetable.class_teacher_name ?? "—"}
          </p>
        </header>

        <DaySchedule
          days={days.map((day) => ({ id: day, label: DAY_LABELS[day] }))}
          activeDay={activeDay}
          onDayChange={(day) => setActiveDay(day as typeof activeDay)}
          slots={slots}
        />

        <StickyActionBar>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={state.goToEdit}
          >
            <Pencil size={18} /> Edit
          </Button>
          <Button
            type="button"
            size="lg"
            variant={timetable.is_complete ? "outline" : "success"}
            className="flex-1"
            onClick={state.togglePublish}
          >
            {timetable.is_complete ? (
              <>
                <Undo2 size={18} /> Draft
              </>
            ) : (
              <>
                <Send size={18} /> Publish
              </>
            )}
          </Button>
        </StickyActionBar>
      </div>
    </PullToRefresh>
  );
}
