"use client";

import { Div, H1, P, Badge, Button, Spinner, EmptyState } from "@/components/ui";
import { Receipt } from "lucide-react";
import { useParentFees } from "@/hooks/useParentFees";

function fmtRupees(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return `₹${n.toLocaleString("en-IN")}`;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  PAID: "success",
  PARTIAL: "warning",
  PENDING: "warning",
  OVERDUE: "danger",
  WAIVED: "default",
};

export default function ParentFeesPage() {
  const { bills, isLoading, error, payBill, payingBillId } = useParentFees();

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Fees</H1>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : bills.length === 0 ? (
        <EmptyState icon={<Receipt size={28} />} title="No fee bills yet" />
      ) : (
        <Div type="col" gap="sm">
          {bills.map((bill) => {
            const due = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount);
            const isPayable = bill.status !== "PAID" && bill.status !== "WAIVED" && due > 0;
            return (
              <Div key={bill.id} type="col" gap="sm" className="rounded-xl border border-border bg-card p-4">
                <Div type="row" justify="between" align="start">
                  <Div type="col" gap="xs">
                    <P className="font-semibold">{bill.fee_type_name ?? bill.bill_month ?? "Fee Bill"}</P>
                    <P color="muted" className="text-xs">
                      Due: {bill.due_date ? new Date(bill.due_date).toLocaleDateString("en-IN") : "—"}
                    </P>
                  </Div>
                  <Badge variant={STATUS_VARIANT[bill.status] ?? "default"}>{bill.status}</Badge>
                </Div>
                <Div type="row" justify="between" align="center">
                  <P color="muted" className="text-sm">
                    {fmtRupees(bill.paid_amount)} paid of {fmtRupees(bill.total_amount)}
                  </P>
                  {isPayable && (
                    <Button
                      size="sm"
                      onClick={() => payBill(bill)}
                      loading={payingBillId === bill.id}
                    >
                      Pay {fmtRupees(due)}
                    </Button>
                  )}
                </Div>
              </Div>
            );
          })}
        </Div>
      )}
    </Div>
  );
}
