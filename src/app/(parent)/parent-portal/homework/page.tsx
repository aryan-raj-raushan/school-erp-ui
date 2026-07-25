"use client";

import { Div, H1, P, Badge, Spinner, EmptyState } from "@/components/ui";
import { BookOpen } from "lucide-react";
import { useParentHomework } from "@/hooks/useParentHomework";

const SUBMISSION_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  SUBMITTED: "success",
  GRADED: "success",
  PENDING: "warning",
  LATE: "danger",
};

export default function ParentHomeworkPage() {
  const { items, isLoading, error } = useParentHomework();

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Homework</H1>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : items.length === 0 ? (
        <EmptyState icon={<BookOpen size={28} />} title="No homework assigned yet" />
      ) : (
        <Div type="col" gap="sm">
          {items.map((hw) => {
            const status = hw.submission?.status ?? "PENDING";
            return (
              <Div key={hw.id} type="col" gap="xs" className="rounded-xl border border-border bg-card p-4">
                <Div type="row" justify="between" align="start">
                  <Div type="col" gap="xs">
                    <P className="font-semibold">{hw.title}</P>
                    {hw.subject_name && <P color="muted" className="text-xs">{hw.subject_name}</P>}
                  </Div>
                  <Badge variant={SUBMISSION_VARIANT[status] ?? "default"}>{status}</Badge>
                </Div>
                {hw.description && <P color="muted" className="text-sm">{hw.description}</P>}
                <P color="muted" className="text-xs">
                  Due: {hw.due_date ? new Date(hw.due_date).toLocaleDateString("en-IN") : "—"}
                </P>
              </Div>
            );
          })}
        </Div>
      )}
    </Div>
  );
}
