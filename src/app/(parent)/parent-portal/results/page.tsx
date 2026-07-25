"use client";

import { Div, H1, P, Badge, Spinner, EmptyState } from "@/components/ui";
import { Award } from "lucide-react";
import { useParentReportCards } from "@/hooks/useParentExams";

export default function ParentResultsPage() {
  const { items, isLoading, error } = useParentReportCards();

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Results & Report Cards</H1>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : items.length === 0 ? (
        <EmptyState icon={<Award size={28} />} title="No published results yet" description="Report cards will appear here once your school publishes them." />
      ) : (
        <Div type="col" gap="sm">
          {items.map((r) => (
            <Div key={r.id} type="row" justify="between" align="center" className="rounded-xl border border-border bg-card p-4">
              <Div type="col" gap="xs">
                <P className="font-semibold">{r.exam_name ?? "Exam"}</P>
                {r.grade && <P color="muted" className="text-xs">Grade: {r.grade}</P>}
              </Div>
              {typeof r.obtained_marks === "number" && typeof r.total_marks === "number" && (
                <Badge variant="success">{r.obtained_marks} / {r.total_marks}</Badge>
              )}
            </Div>
          ))}
        </Div>
      )}
    </Div>
  );
}
