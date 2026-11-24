"use client";

import { Div, H1, P, Badge, Button, Spinner, EmptyState } from "@/components/ui";
import { Receipt } from "lucide-react";
import { useParentFees } from "@/hooks/useParentFees";
import { UpiPaySheet } from "@/components/parent/UpiPaySheet";
import type { ParentFeeBill } from "@/services/parent-portal.service";

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

function billLabel(bill: ParentFeeBill) {
  return bill.fee_type_name ?? bill.bill_month ?? "Fee Bill";
}

export default function ParentFeesPage() {
  const {
    bills,
    isLoading,
    error,
    canPayOnline,
    payBill,
    payingBillId,
    claimByBill,
    upiPayment,
    closeUpiPayment,
    submitUtr,
    isSubmittingUtr,
  } = useParentFees();

  return (
    <Div type="col" gap="md" className="p-4 sm:p-6">
      <H1 className="text-2xl font-bold">Fees</H1>

      {!isLoading && !error && bills.length > 0 && !canPayOnline && (
        <P color="muted" className="text-sm">
          Online payment isn&apos;t enabled by your school yet — please pay at the school office.
        </P>
      )}

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : bills.length === 0 ? (
        <EmptyState icon={<Receipt size={28} />} title="No fee bills yet" />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {bills.map((bill) => {
            const due = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount) - parseFloat(bill.discount_amount ?? "0");
            const claim = claimByBill.get(bill.id);
            const awaitingConfirmation = claim?.status === "PENDING_VERIFICATION";
            const isPayable = canPayOnline && bill.status !== "PAID" && bill.status !== "WAIVED" && due > 0 && !awaitingConfirmation;
            return (
              <Div key={bill.id} type="col" gap="sm" className="rounded-xl border border-border bg-card p-4">
                <Div type="row" justify="between" align="start">
                  <Div type="col" gap="xs">
                    <P className="font-semibold">{billLabel(bill)}</P>
                    <P color="muted" className="text-xs">
                      Due: {bill.due_date ? new Date(bill.due_date).toLocaleDateString("en-IN") : "—"}
                    </P>
                  </Div>
                  <Badge variant={STATUS_VARIANT[bill.status] ?? "default"}>{bill.status}</Badge>
                </Div>
                <Div type="row" justify="between" align="center" className="gap-2">
                  <P color="muted" className="text-sm">
                    {fmtRupees(bill.paid_amount)} paid of {fmtRupees(bill.total_amount)}
                  </P>
                  {awaitingConfirmation && <Badge variant="warning">Confirming payment</Badge>}
                  {isPayable && (
                    <Button size="sm" onClick={() => void payBill(bill)} loading={payingBillId === bill.id}>
                      Pay {fmtRupees(due)}
                    </Button>
                  )}
                </Div>
                {claim?.status === "REJECTED" && bill.status !== "PAID" && (
                  <P className="text-xs text-rose-600">
                    Your UPI payment (ref {claim.utr}) was not found by the school
                    {claim.review_note ? `: ${claim.review_note}` : ""}. Please contact the school office.
                  </P>
                )}
              </Div>
            );
          })}
        </div>
      )}

      {upiPayment && (
        <UpiPaySheet
          intent={upiPayment.intent}
          billLabel={billLabel(upiPayment.bill)}
          isSubmitting={isSubmittingUtr}
          onSubmitUtr={submitUtr}
          onClose={closeUpiPayment}
        />
      )}
    </Div>
  );
}
