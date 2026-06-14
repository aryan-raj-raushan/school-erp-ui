'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  FinanceService,
  FinanceAccount, CreateAccountPayload, UpdateAccountPayload,
  FinanceHead, CreateHeadPayload, UpdateHeadPayload,
  ACCOUNT_TYPES, HEAD_TYPES,
} from '@/services/finance.service';

export type FinanceSetupTab = 'accounts' | 'heads';

export const FINANCE_SETUP_TABS = [
  { value: 'accounts' as const, label: 'Finance Accounts' },
  { value: 'heads' as const, label: 'Income & Expense Heads' },
] satisfies { value: FinanceSetupTab; label: string }[];

export function useFinanceSetup() {
  const [tab, setTab] = useState<FinanceSetupTab>('accounts');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showHeadModal, setShowHeadModal] = useState(false);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [heads, setHeads] = useState<FinanceHead[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingHeads, setLoadingHeads] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Account form
  const [accountForm, setAccountForm] = useState<CreateAccountPayload>({
    name: '', account_type: 'Bank', opening_balance: 0,
    account_start_date: new Date().toISOString().split('T')[0], is_enabled: true,
  });
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null);

  // Head form
  const [headForm, setHeadForm] = useState<CreateHeadPayload>({
    name: '', head_type: 'Income', is_enabled: true,
  });
  const [editingHead, setEditingHead] = useState<FinanceHead | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await FinanceService.listAccounts({ limit: 100 });
      setAccounts(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  const fetchHeads = useCallback(async () => {
    setLoadingHeads(true);
    try {
      const res = await FinanceService.listHeads({ limit: 100 });
      setHeads(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load heads');
    } finally {
      setLoadingHeads(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchHeads();
  }, [fetchAccounts, fetchHeads]);

  // ─── Account actions ────────────────────────────────────────────────────────

  function startEditAccount(account: FinanceAccount) {
    setEditingAccount(account);
    setAccountForm({ name: account.name, account_type: account.account_type, is_enabled: account.is_enabled, account_start_date: account.account_start_date });
  }

  function cancelEditAccount() {
    setEditingAccount(null);
    setAccountForm({ name: '', account_type: 'Bank', opening_balance: 0, account_start_date: new Date().toISOString().split('T')[0], is_enabled: true });
  }

  async function submitAccount() {
    if (!accountForm.name.trim()) { toast.error('Account name is required'); return; }
    setSubmitting(true);
    try {
      if (editingAccount) {
        const payload: UpdateAccountPayload = { name: accountForm.name, account_type: accountForm.account_type, is_enabled: accountForm.is_enabled };
        await FinanceService.updateAccount(editingAccount.id, payload);
        toast.success('Account updated');
      } else {
        await FinanceService.createAccount(accountForm);
        toast.success('Account created');
      }
      cancelEditAccount();
      await fetchAccounts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteAccount(id: string) {
    try {
      await FinanceService.deleteAccount(id);
      toast.success('Account deleted');
      await fetchAccounts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
    }
  }

  // ─── Head actions ───────────────────────────────────────────────────────────

  function startEditHead(head: FinanceHead) {
    setEditingHead(head);
    setHeadForm({ name: head.name, head_type: head.head_type, is_enabled: head.is_enabled });
  }

  function cancelEditHead() {
    setEditingHead(null);
    setHeadForm({ name: '', head_type: 'Income', is_enabled: true });
  }

  async function submitHead() {
    if (!headForm.name.trim()) { toast.error('Head name is required'); return; }
    setSubmitting(true);
    try {
      if (editingHead) {
        await FinanceService.updateHead(editingHead.id, headForm);
        toast.success('Head updated');
      } else {
        await FinanceService.createHead(headForm);
        toast.success('Head created');
      }
      cancelEditHead();
      await fetchHeads();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save head');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteHead(id: string) {
    try {
      await FinanceService.deleteHead(id);
      toast.success('Head deleted');
      await fetchHeads();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete head');
    }
  }

  function openAddAccount() { cancelEditAccount(); setShowAccountModal(true); }
  function openEditAccount(a: FinanceAccount) { startEditAccount(a); setShowAccountModal(true); }
  function closeAccountModal() { cancelEditAccount(); setShowAccountModal(false); }
  async function handleAccountSubmit() { await submitAccount(); setShowAccountModal(false); }

  function openAddHead() { cancelEditHead(); setShowHeadModal(true); }
  function openEditHead(h: FinanceHead) { startEditHead(h); setShowHeadModal(true); }
  function closeHeadModal() { cancelEditHead(); setShowHeadModal(false); }
  async function handleHeadSubmit() { await submitHead(); setShowHeadModal(false); }

  return {
    tab, setTab,
    showAccountModal, showHeadModal,
    accounts, loadingAccounts,
    accountForm, setAccountForm, editingAccount,
    submitAccount, deleteAccount,
    openAddAccount, openEditAccount, closeAccountModal, handleAccountSubmit,
    heads, loadingHeads,
    headForm, setHeadForm, editingHead,
    submitHead, deleteHead,
    openAddHead, openEditHead, closeHeadModal, handleHeadSubmit,
    submitting,
    ACCOUNT_TYPES, HEAD_TYPES,
  };
}
