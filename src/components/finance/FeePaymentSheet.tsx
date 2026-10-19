"use client";

import { CreditCard } from "lucide-react";
import {
  BottomSheet,
  Button,
  ChoiceChips,
  FieldRow,
  MobileSelectField,
  MobileTextField,
} from "@/components/ui";

export interface FeePayFormState<M extends string = string> {
  to_account_id?: string;
  amount: number;
  payment_mode: M;
  transaction_id?: string;
  bank_name?: string;
  payment_date: string;
  remarks?: string;
}

const rupees = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export interface FeePaymentSheetProps<M extends string> {
  isOpen: boolean;
  onClose: () => void;
  /** What is being paid: fee type / student with a short detail line. */
  heading: string;
  detail: string;
  form: FeePayFormState<M>;
  onChange: (patch: Partial<FeePayFormState<M>>) => void;
  accounts: ReadonlyArray<{ id: string; name: string; account_type: string }>;
  paymentModes: ReadonlyArray<M>;
  totalAmount: number;
  balanceDue: number;
  onSubmit: () => void;
}

export function FeePaymentSheet<M extends string>({
  isOpen,
  onClose,
  heading,
  detail,
  form,
  onChange,
  accounts,
  paymentModes,
  totalAmount,
  balanceDue,
  onSubmit,
}: FeePaymentSheetProps<M>) {
  const paying = form.amount || 0;
  const remaining = Math.max(0, balanceDue - paying);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Record payment"
      maxHeight="94dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-[2]"
            disabled={!form.amount || !form.payment_date}
            onClick={onSubmit}
          >
            <CreditCard size={18} /> Record payment
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        <div className="rounded-2xl bg-muted/50 p-4">
          <p className="text-[15px] font-semibold">{heading}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <dt className="text-[11px] text-muted-foreground">Total</dt>
              <dd className="text-sm font-semibold">{rupees(totalAmount)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Paying</dt>
              <dd className="text-sm font-semibold text-primary-text">{rupees(paying)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Remaining</dt>
              <dd className={remaining > 0 ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-emerald-600"}>
                {rupees(remaining)}
              </dd>
            </div>
          </dl>
        </div>

        <MobileTextField
          label="Paying now"
          required
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.amount || ""}
          onChange={(e) => onChange({ amount: parseFloat(e.target.value) || 0 })}
        />
        <ChoiceChips
          label="Payment mode"
          required
          value={form.payment_mode}
          onChange={(value) => onChange({ payment_mode: value as M })}
          options={paymentModes.map((m) => ({ value: m, label: m }))}
        />
        <MobileSelectField
          label="Finance account"
          placeholder="No account (offline record only)"
          value={form.to_account_id ?? ""}
          onChange={(value) => onChange({ to_account_id: value || undefined })}
          options={accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.account_type})` }))}
        />
        <MobileTextField
          label="Payment date"
          required
          type="date"
          value={form.payment_date}
          onChange={(e) => onChange({ payment_date: e.target.value })}
        />
        <FieldRow>
          <MobileTextField
            label="Transaction no."
            placeholder="UTR / ref"
            value={form.transaction_id ?? ""}
            onChange={(e) => onChange({ transaction_id: e.target.value || undefined })}
          />
          <MobileTextField
            label="Bank"
            placeholder="Optional"
            value={form.bank_name ?? ""}
            onChange={(e) => onChange({ bank_name: e.target.value || undefined })}
          />
        </FieldRow>
        <MobileTextField
          label="Remarks"
          placeholder="Optional"
          value={form.remarks ?? ""}
          onChange={(e) => onChange({ remarks: e.target.value || undefined })}
        />
      </div>
    </BottomSheet>
  );
}
