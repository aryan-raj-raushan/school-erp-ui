"use client";

import { Div, H1, P, Badge, Spinner, EmptyState } from "@/components/ui";
import { DoorOpen } from "lucide-react";
import { useParentGatePasses } from "@/hooks/useParentGatePasses";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  USED: "default",
};

export default function ParentGatePassesPage() {
  const { items, isLoading, error } = useParentGatePasses();

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Gate Passes</H1>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : items.length === 0 ? (
        <EmptyState icon={<DoorOpen size={28} />} title="No gate passes yet" />
      ) : (
        <Div type="col" gap="sm">
          {items.map((g) => (
            <Div key={g.id} type="row" justify="between" align="center" className="rounded-xl border border-border bg-card p-4">
              <Div type="col" gap="xs">
                <P className="font-medium">{g.reason ?? "Gate pass"}</P>
                <P color="muted" className="text-xs">{new Date(g.requested_at).toLocaleString("en-IN")}</P>
              </Div>
              <Badge variant={STATUS_VARIANT[g.status] ?? "default"}>{g.status}</Badge>
            </Div>
          ))}
        </Div>
      )}
    </Div>
  );
}
