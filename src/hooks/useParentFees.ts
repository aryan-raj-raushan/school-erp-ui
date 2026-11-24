'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  ParentPortalService,
  type ParentFeeBill,
  type FeePaymentOptions,
  type UpiIntent,
  type UpiPaymentClaim,
} from '@/services/parent-portal.service';
import { useParentStore } from '@/store/parent.store';
import { useAuthStore } from '@/store/auth.store';
import { errorMessage } from '@/lib/api-error';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export function useParentFees() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const { user } = useAuthStore();
  const [bills, setBills] = useState<ParentFeeBill[]>([]);
  const [options, setOptions] = useState<FeePaymentOptions | null>(null);
  const [claims, setClaims] = useState<UpiPaymentClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [upiPayment, setUpiPayment] = useState<{ bill: ParentFeeBill; intent: UpiIntent } | null>(null);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);

  const fetchBills = useCallback(() => {
    if (!activeStudentId) return;
    setIsLoading(true);
    return Promise.all([
      ParentPortalService.getFeeBills(),
      ParentPortalService.getFeePaymentOptions(),
      ParentPortalService.getUpiPayments(),
    ])
      .then(([nextBills, nextOptions, nextClaims]) => {
        setBills(nextBills);
        setOptions(nextOptions);
        setClaims(nextClaims);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load fee bills'))
      .finally(() => setIsLoading(false));
  }, [activeStudentId]);

  useEffect(() => {
    void fetchBills();
  }, [fetchBills]);

  const claimByBill = useMemo(() => {
    const map = new Map<string, UpiPaymentClaim>();
    for (const claim of claims) {
      if (!map.has(claim.bill_id)) map.set(claim.bill_id, claim);
    }
    return map;
  }, [claims]);

  async function payWithUpi(bill: ParentFeeBill) {
    setPayingBillId(bill.id);
    try {
      const intent = await ParentPortalService.createUpiIntent(bill.id);
      setUpiPayment({ bill, intent });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not start the UPI payment'));
    } finally {
      setPayingBillId(null);
    }
  }

  async function submitUtr(utr: string) {
    if (!upiPayment) return false;
    setIsSubmittingUtr(true);
    try {
      await ParentPortalService.confirmUpiPayment(upiPayment.bill.id, upiPayment.intent.reference, utr);
      toast.success('Payment submitted — the school will confirm it shortly');
      setUpiPayment(null);
      await fetchBills();
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'Could not submit the payment reference'));
      return false;
    } finally {
      setIsSubmittingUtr(false);
    }
  }

  async function payWithRazorpay(bill: ParentFeeBill) {
    setPayingBillId(bill.id);
    try {
      const order = await ParentPortalService.createRazorpayOrder(bill.id);
      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error('Razorpay failed to load');

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        order_id: order.orderId,
        name: options?.payee_name ?? 'School Fees',
        description: bill.fee_type_name ?? 'Fee payment',
        prefill: {
          name: user ? `${user.first_name} ${user.last_name ?? ''}`.trim() : undefined,
          email: user?.email,
          contact: user?.phone_number,
          method: 'upi',
        },
        config: {
          display: {
            blocks: { upi: { name: 'Pay using UPI', instruments: [{ method: 'upi' }] } },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await ParentPortalService.verifyRazorpayPayment(bill.id, response);
            toast.success('Payment successful');
            await fetchBills();
          } catch (err) {
            toast.error(errorMessage(err, 'Payment received but confirmation failed — it will reflect shortly.'));
          }
        },
        modal: {
          ondismiss: () => setPayingBillId(null),
        },
      });
      razorpay.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start payment');
    } finally {
      setPayingBillId(null);
    }
  }

  function payBill(bill: ParentFeeBill) {
    if (options?.mode === 'UPI_DIRECT') return payWithUpi(bill);
    if (options?.mode === 'RAZORPAY_SCHOOL') return payWithRazorpay(bill);
  }

  return {
    bills,
    isLoading,
    error,
    canPayOnline: options?.mode === 'UPI_DIRECT' || options?.mode === 'RAZORPAY_SCHOOL',
    payBill,
    payingBillId,
    claimByBill,
    upiPayment,
    closeUpiPayment: () => setUpiPayment(null),
    submitUtr,
    isSubmittingUtr,
  };
}
