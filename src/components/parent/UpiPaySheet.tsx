"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, FormField, Input, ResponsiveModalContainer } from "@/components/ui";
import { useIsMobileSync } from "@/hooks/useIsMobileSync";
import type { UpiIntent } from "@/services/parent-portal.service";

interface UpiPaySheetProps {
  intent: UpiIntent;
  billLabel: string;
  isSubmitting: boolean;
  onSubmitUtr: (utr: string) => Promise<boolean>;
  onClose: () => void;
}

const UTR_PATTERN = /^[A-Za-z0-9]{10,22}$/;

export function UpiPaySheet({ intent, billLabel, isSubmitting, onSubmitUtr, onClose }: UpiPaySheetProps) {
  const isMobile = useIsMobileSync();
  const [utr, setUtr] = useState("");
  const utrValid = UTR_PATTERN.test(utr.trim());

  async function copyUpiId() {
    await navigator.clipboard.writeText(intent.upi_id);
    toast.success("UPI ID copied");
  }

  return (
    <ResponsiveModalContainer isOpen onClose={onClose} title="Pay with UPI">
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-center">
          <p className="text-xs text-muted-foreground">{billLabel}</p>
          <p className="mt-1 text-3xl font-bold">₹{intent.amount.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-sm">
            to <span className="font-semibold">{intent.payee_name}</span>
          </p>
        </div>

        {isMobile ? (
          <a href={intent.upi_uri} className="w-full">
            <Button type="button" fullWidth className="h-12 rounded-xl text-[15px]">
              <ExternalLink size={16} /> Open UPI app to pay
            </Button>
          </a>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-2xl border border-border bg-white p-3">
              <QRCodeSVG value={intent.upi_uri} size={184} level="M" />
            </div>
            <p className="text-xs text-muted-foreground">Scan with any UPI app — GPay, PhonePe, Paytm, BHIM</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => void copyUpiId()}
          className="flex items-center justify-between rounded-xl border border-dashed border-border px-3 py-2 text-sm"
        >
          <span className="text-muted-foreground">
            UPI ID <span className="font-semibold text-foreground">{intent.upi_id}</span>
          </span>
          <Copy size={14} className="text-muted-foreground" />
        </button>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-sm font-semibold">After paying, enter the UPI reference number</p>
          <FormField
            label="UPI reference / UTR (12 digits, shown in your UPI app)"
            htmlFor="utr"
            error={utr && !utrValid ? "Enter the reference number exactly as shown" : undefined}
          >
            <Input
              id="utr"
              inputMode="text"
              autoCapitalize="characters"
              placeholder="e.g. 412345678901"
              value={utr}
              onChange={(e) => setUtr(e.target.value.replace(/\s/g, ""))}
            />
          </FormField>
          <Button
            type="button"
            fullWidth
            loading={isSubmitting}
            disabled={!utrValid}
            onClick={() => void onSubmitUtr(utr.trim())}
            className="h-11 rounded-xl"
          >
            I have paid — submit reference
          </Button>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            Money goes straight to the school&apos;s own account. The school confirms it against their bank statement and your
            receipt appears here.
          </p>
        </div>
      </div>
    </ResponsiveModalContainer>
  );
}
