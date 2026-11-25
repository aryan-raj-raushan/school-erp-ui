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
import { errorMessage } from '@/lib/api-error';

export function useParentFees() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
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

  function payBill(bill: ParentFeeBill) {
    return payWithUpi(bill);
  }

  return {
    bills,
    isLoading,
    error,
    canPayOnline: options?.mode === 'UPI_DIRECT',
    payBill,
    payingBillId,
    claimByBill,
    upiPayment,
    closeUpiPayment: () => setUpiPayment(null),
    submitUtr,
    isSubmittingUtr,
  };
}
