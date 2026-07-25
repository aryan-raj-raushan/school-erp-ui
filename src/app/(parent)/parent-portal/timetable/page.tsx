"use client";

import { Div, H1, H2, P, Badge, Spinner, EmptyState } from "@/components/ui";
import { Clock } from "lucide-react";
import { useParentTimetable } from "@/hooks/useParentTimetable";

export default function ParentTimetablePage() {
  const { today, week, isLoading, error } = useParentTimetable();

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Timetable</H1>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : (
        <>
          <Div type="col" gap="sm">
            <H2 className="text-sm font-semibold">Today</H2>
            {today.length === 0 ? (
              <EmptyState icon={<Clock size={28} />} title="No periods scheduled today" />
            ) : (
              <Div type="col" gap="xs">
                {today.map((p, i) => (
                  <Div key={i} type="row" justify="between" align="center" className="rounded-lg border border-border bg-card px-4 py-3">
                    <Div type="col">
                      <P className="text-sm font-medium">Period {p.period_number} · {p.subject_name}</P>
                      {p.teacher_name && <P color="muted" className="text-xs">{p.teacher_name}</P>}
                    </Div>
                    <P color="muted" className="text-xs shrink-0">{p.start_time} – {p.end_time}</P>
                  </Div>
                ))}
              </Div>
            )}
          </Div>

          <Div type="col" gap="sm">
            <H2 className="text-sm font-semibold">This Week</H2>
            {week.length === 0 ? (
              <EmptyState icon={<Clock size={28} />} title="Timetable not published yet" />
            ) : (
              <Div type="col" gap="xs">
                {week.map((p, i) => (
                  <Div key={i} type="row" justify="between" align="center" className="rounded-lg bg-muted/30 px-4 py-2">
                    <P className="text-sm">Period {p.period_number} · {p.subject_name}</P>
                    <P color="muted" className="text-xs shrink-0">{p.start_time} – {p.end_time}</P>
                  </Div>
                ))}
              </Div>
            )}
          </Div>
        </>
      )}
    </Div>
  );
}
