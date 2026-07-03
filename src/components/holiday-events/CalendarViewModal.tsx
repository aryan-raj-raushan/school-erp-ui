"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  PartyPopper,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Modal, ModalBody } from "@/components/ui/modal";
import { Div } from "@/components/ui/layout";
import { H2, P, Span } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import type { SchoolEvent } from "@/types/setting/school-events.types";

// ─── helpers ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Returns all days (in yyyy-mm-dd) that a school event spans */
function getEventDays(ev: SchoolEvent): string[] {
  const days: string[] = [];
  const start = new Date(ev.from_date);
  const end = new Date(ev.to_date);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const cur = new Date(start);
  while (cur <= end) {
    days.push(toYMD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/** Build a map of date-string → events that fall on that day */
function buildDayMap(events: SchoolEvent[]): Map<string, SchoolEvent[]> {
  const map = new Map<string, SchoolEvent[]>();
  for (const ev of events) {
    for (const day of getEventDays(ev)) {
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(ev);
    }
  }
  return map;
}

// ─── mini event pill ─────────────────────────────────────────────────────────

function EventPill({ ev }: { ev: SchoolEvent }) {
  const isHoliday = ev.type === "HOLIDAY";
  return (
    <div
      title={ev.name}
      className={`truncate rounded px-0.5 py-0 text-[8px] font-medium leading-none cursor-default select-none ${
        isHoliday
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
      }`}
    >
      {ev.name}
    </div>
  );
}

// ─── day detail popover ───────────────────────────────────────────────────────

function DayDetail({
  date,
  events,
  onClose,
}: {
  date: string|null;
  events: SchoolEvent[];
  onClose: () => void;
}) {
  const d = new Date(date + "T00:00:00");
  return (
    <div className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-1 w-64 rounded-xl border border-border bg-card shadow-xl p-4 space-y-3">
      <Div type="row" justify="between" align="center">
        <P color="default" className="font-semibold">
          {d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </P>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </Div>
      <div className="space-y-2">
        {events.map((ev) => (
          <Div
            key={ev.id}
            type="row"
            align="start"
            gap="sm"
            className="text-sm"
          >
            {ev.type === "HOLIDAY" ? (
              <Calendar size={13} className="text-amber-500 mt-0.5 shrink-0" />
            ) : (
              <PartyPopper
                size={13}
                className="text-blue-500 mt-0.5 shrink-0"
              />
            )}
            <div className="min-w-0">
              <P color="default" className="font-medium truncate">
                {ev.name}
              </P>
              {ev.description && (
                <P color="muted" className="text-xs line-clamp-2">
                  {ev.description}
                </P>
              )}
              {(ev.from_time || ev.to_time) && (
                <P color="muted" className="text-xs">
                  {ev.from_time?.slice(0, 5)}{" "}
                  {ev.to_time ? `→ ${ev.to_time.slice(0, 5)}` : ""}
                </P>
              )}
            </div>
          </Div>
        ))}
      </div>
    </div>
  );
}

// ─── calendar grid ────────────────────────────────────────────────────────────

function CalendarGrid({
  year,
  month,
  dayMap,
  today,
}: {
  year: number;
  month: number; // 0-indexed
  dayMap: Map<string, SchoolEvent[]>;
  today: string;
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // first day of the month
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // fill leading empty cells
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // pad to complete grid rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-2">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-0 shrink-0">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={`py-0.5 text-center text-[9px] font-semibold uppercase tracking-tight ${
              i === 0 || i === 6
                ? "text-muted-foreground/60"
                : "text-muted-foreground"
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border max-h-60" style={{gridAutoRows: 'minmax(36px, 1fr)'}}>
        {cells.map((day, idx) => {
          const ymd = day
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : null;
          const events = ymd ? (dayMap.get(ymd) ?? []) : [];
          const isToday = ymd === today;
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;
          const isSelected = ymd === selectedDay;

          return (
            <div
              key={idx}
              onClick={() => {
                if (!ymd) return;
                setSelectedDay(isSelected ? null : ymd);
              }}
              className={`relative p-0 flex flex-col gap-0 bg-card transition-colors overflow-hidden ${
                !day ? "bg-muted/30" : ""
              } ${isWeekend && day ? "bg-muted/20" : ""} ${
                day ? "cursor-pointer hover:bg-muted/50" : ""
              }`}
            >
              {day && (
                <>
                  {/* Day number */}
                  <span
                    className={`self-start text-[8px] font-bold leading-none flex-shrink-0 px-0.5 ${
                      isToday
                        ? "text-primary"
                        : isWeekend
                          ? "text-muted-foreground"
                          : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>

                  {/* Event pills — show up to 1 only */}
                  <div className="flex flex-col gap-0 overflow-hidden flex-1 min-h-0">
                    {events.slice(0, 1).map((ev) => (
                      <EventPill key={ev.id} ev={ev} />
                    ))}
                    {events.length > 1 && (
                      <span className="text-[8px] text-muted-foreground px-0 leading-none">
                        +{events.length - 1}
                      </span>
                    )}
                  </div>

                  {/* Day detail popover */}
                  {isSelected && events.length > 0 && (
                    <DayDetail
                      date={ymd}
                      events={events}
                      onClose={() => setSelectedDay(null)}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <Div type="row" gap="md" align="center">
      <Div type="row" gap="xs" align="center">
        <span className="h-2.5 w-2.5 rounded-sm bg-blue-200 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700" />
        <Span color="muted" className="text-xs">
          Event
        </Span>
      </Div>
      <Div type="row" gap="xs" align="center">
        <span className="h-2.5 w-2.5 rounded-sm bg-amber-200 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700" />
        <Span color="muted" className="text-xs">
          Holiday
        </Span>
      </Div>
    </Div>
  );
}

// ─── year picker ─────────────────────────────────────────────────────────────

function YearPicker({
  year,
  onChange,
}: {
  year: number;
  onChange: (y: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const base = year - 6;
  const years = Array.from({ length: 12 }, (_, i) => base + i);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-base font-semibold text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
      >
        {year}
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="absolute z-30 top-full left-1/2 -translate-x-1/2 mt-1 w-48 rounded-xl border border-border bg-card shadow-xl p-2 grid grid-cols-3 gap-1">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => {
              onChange(y);
              setOpen(false);
            }}
            className={`rounded-lg py-1 text-sm font-medium transition-colors ${
              y === year
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── main modal ───────────────────────────────────────────────────────────────

interface CalendarViewModalProps {
  onClose: () => void;
  events: SchoolEvent[];
}

export function CalendarViewModal({ onClose, events }: CalendarViewModalProps) {
  const todayDate = new Date();
  const today = toYMD(todayDate);
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());

  const dayMap = useMemo(() => buildDayMap(events), [events]);

  // monthly event count for the mini summary
  const monthEvents = useMemo(() => {
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-`;
    const seen = new Set<string>();
    for (const [key, evs] of dayMap.entries()) {
      if (key.startsWith(prefix)) evs.forEach((e) => seen.add(e.id));
    }
    return seen.size;
  }, [dayMap, viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  function goToday() {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
  }

  return (
    <Modal onClose={onClose} size="lg" className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        {/* Left: nav */}
        <Div type="row" align="center" gap="sm">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setViewYear((y) => y - 1)}
            title="Previous year"
          >
            <ChevronsLeft size={15} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={prevMonth}
            title="Previous month"
          >
            <ChevronLeft size={15} />
          </Button>
        </Div>

        {/* Center: month + year */}
        <Div type="row" align="center" gap="sm">
          <H2 className="text-base font-semibold">{MONTHS[viewMonth]}</H2>
          <YearPicker year={viewYear} onChange={setViewYear} />
        </Div>

        {/* Right: nav + today + close */}
        <Div type="row" align="center" gap="sm">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={nextMonth}
            title="Next month"
          >
            <ChevronRight size={15} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setViewYear((y) => y + 1)}
            title="Next year"
          >
            <ChevronsRight size={15} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={goToday}
            className="ml-1"
          >
            Today
          </Button>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <X size={18} />
          </button>
        </Div>
      </div>

      <ModalBody className="px-6 py-5 space-y-4">
        {/* Summary bar */}
        <Div type="row" justify="between" align="center">
          <P color="muted" className="text-xs">
            {monthEvents > 0
              ? `${monthEvents} event${monthEvents > 1 ? "s" : ""} this month`
              : "No events this month"}
          </P>
          <Legend />
        </Div>

        {/* Calendar */}
        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          dayMap={dayMap}
          today={today}
        />

        {/* Month quick-jump */}
        <div className="grid grid-cols-6 gap-1 pt-1 border-t border-border">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setViewMonth(i)}
              className={`rounded-lg py-1.5 text-xs font-medium transition-colors ${
                i === viewMonth
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
}
