'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FeeCollectionService,
  type ClaimStatus,
  type PaymentCollectionSettings,
  type ReminderList,
  type UpdatePaymentCollectionPayload,
} from '@/services/fee-collection.service';
import type { UpiPaymentClaim } from '@/services/parent-portal.service';
import { errorMessage } from '@/lib/api-error';
import { useSessionState } from './useSessionState';

export function useFeeCollection() {
  const [status, setStatus] = useSessionState<ClaimStatus>('fees-online:status', 'PENDING_VERIFICATION');
  const [claims, setClaims] = useState<UpiPaymentClaim[]>([]);
  const [claimsVersion, setClaimsVersion] = useState(0);
  const [loadedClaimsKey, setLoadedClaimsKey] = useState<string | null>(null);
  const claimsKey = `${status}:${claimsVersion}`;
  const isLoadingClaims = loadedClaimsKey !== claimsKey;
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<PaymentCollectionSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [overdueOnly, setOverdueOnly] = useSessionState('fees-online:overdue-only', false);
  const [reminders, setReminders] = useState<ReminderList | null>(null);
  const [remindersVersion, setRemindersVersion] = useState(0);
  const reloadReminders = useCallback(() => setRemindersVersion((v) => v + 1), []);
  const reloadClaims = useCallback(() => setClaimsVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    FeeCollectionService.listPayments(status)
      .then((rows) => {
        if (active) setClaims(rows);
      })
      .catch((err) => toast.error(errorMessage(err, 'Failed to load UPI payments')))
      .finally(() => {
        if (active) setLoadedClaimsKey(claimsKey);
      });
    return () => {
      active = false;
    };
  }, [status, claimsKey]);

  useEffect(() => {
    let active = true;
    FeeCollectionService.listReminders({ overdue_only: overdueOnly || undefined })
      .then((next) => {
        if (active) setReminders(next);
      })
      .catch((err) => toast.error(errorMessage(err, 'Failed to load reminder audience')));
    return () => {
      active = false;
    };
  }, [overdueOnly, remindersVersion]);

  useEffect(() => {
    FeeCollectionService.getSettings()
      .then(setSettings)
      .catch((err) => toast.error(errorMessage(err, 'Failed to load payment settings')));
  }, []);

  async function review(claim: UpiPaymentClaim, decision: 'approve' | 'reject', note?: string) {
    setReviewingId(claim.id);
    try {
      if (decision === 'approve') {
        await FeeCollectionService.approve(claim.id, note);
        toast.success(`₹${Number(claim.amount).toLocaleString('en-IN')} recorded for ${claim.student_name}`);
      } else {
        await FeeCollectionService.reject(claim.id, note);
        toast.success('Payment marked as not received');
      }
      reloadClaims();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the payment'));
    } finally {
      setReviewingId(null);
    }
  }

  async function saveSettings(payload: UpdatePaymentCollectionPayload) {
    setIsSavingSettings(true);
    try {
      setSettings(await FeeCollectionService.saveSettings(payload));
      toast.success('Payment collection settings saved');
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save settings'));
      return false;
    } finally {
      setIsSavingSettings(false);
    }
  }

  return {
    status,
    setStatus,
    claims,
    isLoadingClaims,
    reloadClaims,
    reviewingId,
    review,
    settings,
    saveSettings,
    isSavingSettings,
    overdueOnly,
    setOverdueOnly,
    reminders,
    reloadReminders,
  };
}
