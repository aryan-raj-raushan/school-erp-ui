'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ParentPortalService, ParentFeeBill } from '@/services/parent-portal.service';
import { useParentStore } from '@/store/parent.store';
import { useAuthStore } from '@/store/auth.store';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);

  const fetchBills = useCallback(() => {
    if (!activeStudentId) return;
    setIsLoading(true);
    return ParentPortalService.getFeeBills()
      .then((res) => setBills(res))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load fee bills'))
      .finally(() => setIsLoading(false));
  }, [activeStudentId]);

  useEffect(() => {
    void fetchBills();
  }, [fetchBills]);

  async function payBill(bill: ParentFeeBill) {
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
        name: 'School Fees',
        description: bill.fee_type_name ?? 'Fee payment',
        prefill: {
          name: user ? `${user.first_name} ${user.last_name ?? ''}`.trim() : undefined,
          email: user?.email,
          contact: user?.phone_number,
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
          } catch {
            toast.error('Payment received but confirmation failed — it will reflect shortly.');
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

  return { bills, isLoading, error, payBill, payingBillId };
}
