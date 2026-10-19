"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import {
  Badge,
  BottomSheet,
  Button,
  MobileSelectField,
  MobileTextField,
  Spinner,
} from "@/components/ui";
import { INVOICES_PAGE, INVOICE_STATUS_BADGE, PAYMENT_METHOD_FORM_OPTIONS } from "@/constants";
import type { InvoiceWithLineItems, PaymentMethod } from "@/types";

const PROOF_REQUIRED_METHODS: PaymentMethod[] = ["QR_CODE", "BANK_TRANSFER"];

function fmtDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</span>
      <span className={strong ? "font-semibold" : undefined}>{value}</span>
    </div>
  );
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export interface InvoiceDetailSheetProps {
  isOpen: boolean;
  isLoading: boolean;
  invoice: InvoiceWithLineItems | null;
  balanceDue: string;
  isDownloading: boolean;
  onClose: () => void;
  onDownload: () => void;
  onPay: () => void;
}

export function InvoiceDetailSheet({
  isOpen,
  isLoading,
  invoice,
  balanceDue,
  isDownloading,
  onClose,
  onDownload,
  onPay,
}: InvoiceDetailSheetProps) {
  const canPay = invoice && Number(balanceDue) > 0 && invoice.status !== "VOID";

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={invoice ? `${INVOICES_PAGE.detail.title} — ${invoice.invoice_number}` : INVOICES_PAGE.detail.title}
      maxHeight="92dvh"
      footer={
        invoice ? (
          <div className="flex flex-col gap-2">
            {canPay && (
              <Button type="button" size="lg" onClick={onPay}>
                {INVOICES_PAGE.detail.payNow}
              </Button>
            )}
            <Button type="button" variant="outline" size="lg" loading={isDownloading} onClick={onDownload}>
              {INVOICES_PAGE.detail.downloadPdf}
            </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading || !invoice ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-5 pt-1">
          <div className="flex items-center justify-between">
            <Badge variant={INVOICE_STATUS_BADGE[invoice.status]}>{invoice.status}</Badge>
            <span className="text-sm text-muted-foreground">Due {fmtDate(invoice.due_date)}</span>
          </div>

          <section className="flex flex-col gap-2">
            <h3 className="px-1 text-sm font-semibold">{INVOICES_PAGE.detail.lineItems}</h3>
            <ul className="flex flex-col gap-2">
              {invoice.line_items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="shrink-0 text-[15px] font-semibold">₹{item.amount}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-4">
            <Row label={INVOICES_PAGE.detail.subtotal} value={`₹${invoice.subtotal}`} />
            {Number(invoice.tax_amount) > 0 && (
              <Row label={INVOICES_PAGE.detail.tax} value={`₹${invoice.tax_amount}`} />
            )}
            {Number(invoice.discount_amount) > 0 && (
              <Row label={INVOICES_PAGE.detail.discount} value={`-₹${invoice.discount_amount}`} />
            )}
            <Row label={INVOICES_PAGE.detail.total} value={`₹${invoice.total_amount}`} strong />
            <Row label={INVOICES_PAGE.detail.amountPaid} value={`₹${invoice.amount_paid}`} />
            <Row label={INVOICES_PAGE.detail.balanceDue} value={`₹${balanceDue}`} strong />
          </section>
        </div>
      )}
    </BottomSheet>
  );
}

// ─── Pay ──────────────────────────────────────────────────────────────────────

export interface InvoicePaySheetProps {
  isOpen: boolean;
  onClose: () => void;
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onProofChange: (file: File | null) => void;
  balanceDue: string;
  isPaying: boolean;
  onSubmit: () => void;
}

export function InvoicePaySheet({
  isOpen,
  onClose,
  method,
  onMethodChange,
  amount,
  onAmountChange,
  notes,
  onNotesChange,
  onProofChange,
  balanceDue,
  isPaying,
  onSubmit,
}: InvoicePaySheetProps) {
  const [fileName, setFileName] = useState("");
  const fileInputId = "invoice-proof-input";

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={INVOICES_PAGE.payForm.title}
      maxHeight="92dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            {INVOICES_PAGE.payForm.cancel}
          </Button>
          <Button type="button" size="lg" className="flex-[2]" loading={isPaying} onClick={onSubmit}>
            {method === "RAZORPAY" ? INVOICES_PAGE.payForm.payWithRazorpay : INVOICES_PAGE.payForm.submit}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        <MobileSelectField
          label={INVOICES_PAGE.payForm.method}
          value={method}
          onChange={(value) => onMethodChange(value as PaymentMethod)}
          options={PAYMENT_METHOD_FORM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />

        {method === "RAZORPAY" ? (
          <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
            {`₹${balanceDue} will be collected via Razorpay Checkout.`}
          </p>
        ) : (
          <>
            <MobileTextField
              label={INVOICES_PAGE.payForm.amount}
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <input
                id={fileInputId}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setFileName(file?.name ?? "");
                  onProofChange(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => document.getElementById(fileInputId)?.click()}
              >
                <FileUp size={18} /> {fileName ? "Change proof" : INVOICES_PAGE.payForm.proof}
              </Button>
              {fileName && <p className="truncate px-1 text-sm text-muted-foreground">{fileName}</p>}
              {PROOF_REQUIRED_METHODS.includes(method) && (
                <p className="px-1 text-xs text-muted-foreground">{INVOICES_PAGE.payForm.proofHint}</p>
              )}
            </div>
            <MobileTextField
              label={INVOICES_PAGE.payForm.notes}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </>
        )}
      </div>
    </BottomSheet>
  );
}

// ─── Admin billing detail (adds line items) ───────────────────────────────────

export interface BillingInvoiceSheetProps {
  isOpen: boolean;
  isLoading: boolean;
  invoice: InvoiceWithLineItems | null;
  schoolName?: string;
  canAddItems: boolean;
  isAddingItem: boolean;
  onAddItem: (item: { description: string; amount: number; quantity: number }) => void;
  onClose: () => void;
  copy: {
    title: string;
    lineItems: string;
    total: string;
    amountPaid: string;
    balanceDue: string;
    addItem: string;
    addItemSubmit: string;
    finalNotice: string;
    itemDescription: string;
    itemAmount: string;
    itemQuantity: string;
    close: string;
  };
}

export function BillingInvoiceSheet({
  isOpen,
  isLoading,
  invoice,
  schoolName,
  canAddItems,
  isAddingItem,
  onAddItem,
  onClose,
  copy,
}: BillingInvoiceSheetProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");

  function submit() {
    const numericAmount = Number(amount);
    if (!description.trim() || !numericAmount || numericAmount <= 0) return;
    onAddItem({
      description: description.trim(),
      amount: numericAmount,
      quantity: Number(quantity) || 1,
    });
    setDescription("");
    setAmount("");
    setQuantity("1");
  }

  const balance = invoice ? (Number(invoice.total_amount) - Number(invoice.amount_paid)).toFixed(2) : "0.00";

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={invoice ? `${copy.title} — ${invoice.invoice_number}` : copy.title}
      maxHeight="92dvh"
      footer={
        <Button type="button" variant="outline" size="lg" className="w-full" onClick={onClose}>
          {copy.close}
        </Button>
      }
    >
      {isLoading || !invoice ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-5 pt-1">
          <div className="flex items-center justify-between gap-3">
            <Badge variant={INVOICE_STATUS_BADGE[invoice.status]}>{invoice.status}</Badge>
            <span className="truncate text-sm text-muted-foreground">{schoolName}</span>
          </div>

          <section className="flex flex-col gap-2">
            <h3 className="px-1 text-sm font-semibold">{copy.lineItems}</h3>
            <ul className="flex flex-col gap-2">
              {invoice.line_items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="shrink-0 text-[15px] font-semibold">₹{item.amount}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-4">
            <Row label={copy.total} value={`₹${invoice.total_amount}`} strong />
            <Row label={copy.amountPaid} value={`₹${invoice.amount_paid}`} />
            <Row label={copy.balanceDue} value={`₹${balance}`} strong />
          </section>

          {canAddItems ? (
            <section className="flex flex-col gap-3">
              <h3 className="px-1 text-sm font-semibold">{copy.addItem}</h3>
              <MobileTextField
                label={copy.itemDescription}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <MobileTextField
                  label={copy.itemAmount}
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <MobileTextField
                  label={copy.itemQuantity}
                  type="number"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" size="lg" loading={isAddingItem} onClick={submit}>
                {copy.addItemSubmit}
              </Button>
            </section>
          ) : (
            <p className="px-1 text-xs text-muted-foreground">{copy.finalNotice}</p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

// ─── Reject reason ────────────────────────────────────────────────────────────

export interface ReasonSheetProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  submitLabel: string;
  cancelLabel: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

/** Bottom sheet asking for a short reason before a destructive decision. */
export function ReasonSheet({
  isOpen,
  title,
  placeholder,
  submitLabel,
  cancelLabel,
  value,
  onChange,
  onSubmit,
  onClose,
}: ReasonSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxHeight="70dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="flex-[2]"
            disabled={!value.trim()}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="pt-1">
        <MobileTextField
          label="Reason"
          required
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </BottomSheet>
  );
}
