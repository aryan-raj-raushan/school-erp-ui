"use client";

import { useState } from "react";
import { Div, H1, H2, P, Badge, Button, Input, Spinner, EmptyState } from "@/components/ui";
import { CalendarOff } from "lucide-react";
import { useParentLeave } from "@/hooks/useParentLeave";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
};

export default function ParentLeavePage() {
  const { requests, balance, isLoading, isApplying, error, apply } = useParentLeave();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) return;
    const ok = await apply({ from_date: fromDate, to_date: toDate, reason });
    if (ok) {
      setFromDate("");
      setToDate("");
      setReason("");
    }
  }

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Leave</H1>

      {balance && (
        <Div type="row" gap="sm" className="flex-wrap">
          <Div type="col" gap="xs" className="rounded-xl border border-border bg-card px-4 py-3 min-w-[120px]">
            <P color="muted" className="text-xs">Total Requested</P>
            <P className="font-semibold">{balance.total_days_requested} day(s)</P>
          </Div>
          <Div type="col" gap="xs" className="rounded-xl border border-border bg-card px-4 py-3 min-w-[120px]">
            <P color="muted" className="text-xs">Approved</P>
            <P className="font-semibold">{balance.approved} day(s)</P>
          </Div>
          <Div type="col" gap="xs" className="rounded-xl border border-border bg-card px-4 py-3 min-w-[120px]">
            <P color="muted" className="text-xs">Pending</P>
            <P className="font-semibold">{balance.pending} day(s)</P>
          </Div>
        </Div>
      )}

      <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-4">
        <H2 className="text-sm font-semibold">Apply for Leave</H2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Div type="row" gap="sm" className="flex-col sm:flex-row">
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
          </Div>
          <Input placeholder="Reason for leave" value={reason} onChange={(e) => setReason(e.target.value)} required />
          <Button type="submit" loading={isApplying} className="self-start">
            Submit Request
          </Button>
        </form>
      </Div>

      <Div type="col" gap="sm">
        <H2 className="text-sm font-semibold">My Requests</H2>
        {isLoading ? (
          <Div type="row" align="center" justify="center" className="py-8"><Spinner /></Div>
        ) : error ? (
          <Badge variant="danger">{error}</Badge>
        ) : requests.length === 0 ? (
          <EmptyState icon={<CalendarOff size={28} />} title="No leave requests yet" />
        ) : (
          <Div type="col" gap="xs">
            {requests.map((r) => (
              <Div key={r.id} type="row" justify="between" align="center" className="rounded-lg border border-border bg-card px-4 py-3">
                <Div type="col" gap="xs">
                  <P className="text-sm font-medium">
                    {new Date(r.from_date).toLocaleDateString("en-IN")} – {new Date(r.to_date).toLocaleDateString("en-IN")}
                  </P>
                  <P color="muted" className="text-xs">{r.reason}</P>
                </Div>
                <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{r.status}</Badge>
              </Div>
            ))}
          </Div>
        )}
      </Div>
    </Div>
  );
}
