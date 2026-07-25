"use client";

import { Div, H1, P, Badge, Spinner, EmptyState } from "@/components/ui";
import { Footprints } from "lucide-react";
import { useParentMovements } from "@/hooks/useParentGatePasses";

export default function ParentMovementsPage() {
  const { items, isLoading, error } = useParentMovements();

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Movements</H1>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : items.length === 0 ? (
        <EmptyState icon={<Footprints size={28} />} title="No movement records yet" />
      ) : (
        <Div type="col" gap="sm">
          {items.map((m) => (
            <Div key={m.id} type="row" justify="between" align="center" className="rounded-xl border border-border bg-card p-4">
              <Div type="col" gap="xs">
                <P className="font-medium">{m.remarks ?? "Campus movement"}</P>
                <P color="muted" className="text-xs">{new Date(m.recorded_at).toLocaleString("en-IN")}</P>
              </Div>
              <Badge variant={m.direction === "IN" ? "success" : "warning"}>{m.direction}</Badge>
            </Div>
          ))}
        </Div>
      )}
    </Div>
  );
}
