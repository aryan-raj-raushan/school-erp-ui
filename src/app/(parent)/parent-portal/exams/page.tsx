"use client";

import Link from "next/link";
import { Div, H1, P, Badge, Spinner, EmptyState } from "@/components/ui";
import { GraduationCap } from "lucide-react";
import { useParentExamSchedule } from "@/hooks/useParentExams";
import { ROUTES } from "@/constants";

export default function ParentExamsPage() {
  const { items, isLoading, error } = useParentExamSchedule();

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <Div type="row" justify="between" align="center">
        <H1 className="text-2xl font-bold">Exam Schedule</H1>
        <Link href={`${ROUTES.parentPortal}/results`} className="text-sm font-medium text-primary">
          View Results →
        </Link>
      </Div>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : items.length === 0 ? (
        <EmptyState icon={<GraduationCap size={28} />} title="No exams scheduled" />
      ) : (
        <Div type="col" gap="sm">
          {items.map((e) => (
            <Div key={e.id} type="row" justify="between" align="center" className="rounded-xl border border-border bg-card p-4">
              <Div type="col" gap="xs">
                <P className="font-semibold">{e.subject_name ?? e.exam_name ?? "Exam"}</P>
                {e.exam_name && e.subject_name && <P color="muted" className="text-xs">{e.exam_name}</P>}
              </Div>
              <Div type="col" align="end" gap="xs">
                <P className="text-sm font-medium">{new Date(e.exam_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</P>
                {e.start_time && <P color="muted" className="text-xs">{e.start_time}{e.end_time ? ` – ${e.end_time}` : ""}</P>}
              </Div>
            </Div>
          ))}
        </Div>
      )}
    </Div>
  );
}
