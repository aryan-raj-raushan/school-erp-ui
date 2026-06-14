'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  FinanceService,
  FinanceAccount, FinanceHead,
  FinanceExpense, CreateExpensePayload,
  FinanceIncomeRecord, CreateIncomePayload,
  FinanceTransfer, CreateTransferPayload,
  AccountStatement, RegisterEntry, ProfitLossSummary,
} from '@/services/finance.service';
import { StaffService } from '@/services/staff.service';
import type { Staff } from '@/types';
import { StudentsService } from '@/services/students-v2.service';
import type { StudentListItem } from '@/types/students.types';

export type LedgerTab = 'expenses' | 'income' | 'transfers' | 'statement' | 'register' | 'profit-loss';

export const LEDGER_TABS = [
  { value: 'expenses' as const, label: 'Record Expense' },
  { value: 'income' as const, label: 'Record Income' },
  { value: 'transfers' as const, label: 'Account Transfers' },
  { value: 'statement' as const, label: 'Account Statement' },
  { value: 'register' as const, label: 'Daily Register' },
  { value: 'profit-loss' as const, label: 'Profit & Loss' },
] satisfies { value: LedgerTab; label: string }[];

export function useFinanceLedger() {
  const [activeTab, setActiveTab] = useState<LedgerTab>('expenses');
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<FinanceHead[]>([]);
  const [incomeHeads, setIncomeHeads] = useState<FinanceHead[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [studentList, setStudentList] = useState<StudentListItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ─── Expenses ──────────────────────────────────────────────────────────────
  const [expenses, setExpenses] = useState<FinanceExpense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expenseForm, setExpenseForm] = useState<CreateExpensePayload>({
    expense_head_id: '', from_account_id: '', total_amount: 0,
    date_of_expense: new Date().toISOString().split('T')[0], remarks: '',
  });

  // ─── Income ────────────────────────────────────────────────────────────────
  const [incomeList, setIncomeList] = useState<FinanceIncomeRecord[]>([]);
  const [loadingIncome, setLoadingIncome] = useState(false);
  const [incomeForm, setIncomeForm] = useState<CreateIncomePayload>({
    income_head_id: '', to_account_id: '', amount: 0,
    date_of_income: new Date().toISOString().split('T')[0], remarks: '',
  });

  // ─── Transfers ─────────────────────────────────────────────────────────────
  const [transfers, setTransfers] = useState<FinanceTransfer[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [transferForm, setTransferForm] = useState<CreateTransferPayload>({
    from_account_id: '', to_account_id: '', amount: 0,
    date_of_transaction: new Date().toISOString().split('T')[0], remarks: '',
  });

  // ─── Statement ─────────────────────────────────────────────────────────────
  const [statement, setStatement] = useState<AccountStatement | null>(null);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = today.slice(0, 8) + '01';
  const [statementFilters, setStatementFilters] = useState({ account_id: '', start_date: firstOfMonth, end_date: today });

  // ─── Register ──────────────────────────────────────────────────────────────
  const [register, setRegister] = useState<RegisterEntry[]>([]);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [registerFilters, setRegisterFilters] = useState({ start_date: firstOfMonth, end_date: today, account_id: '', head_type: '' });

  // ─── P&L ───────────────────────────────────────────────────────────────────
  const [profitLoss, setProfitLoss] = useState<ProfitLossSummary | null>(null);
  const [loadingPL, setLoadingPL] = useState(false);
  const [plFilters, setPlFilters] = useState({ start_date: firstOfMonth, end_date: today });

  const loadAccounts = useCallback(async () => {
    try {
      const res = await FinanceService.listAccounts({ limit: 100, is_enabled: true });
      setAccounts(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load accounts');
    }
  }, []);

  const loadHeads = useCallback(async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        FinanceService.listHeads({ limit: 100, head_type: 'Expense', is_enabled: true }),
        FinanceService.listHeads({ limit: 100, head_type: 'Income', is_enabled: true }),
      ]);
      setExpenseHeads(expRes.items);
      setIncomeHeads(incRes.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load heads');
    }
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      const res = await StaffService.list({ limit: 100 });
      setStaffList(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load staff');
    }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const res = await StudentsService.list({ limit: 200 });
      setStudentList(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load students');
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const res = await FinanceService.listExpenses({ limit: 25 });
      setExpenses(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally { setLoadingExpenses(false); }
  }, []);

  const fetchIncome = useCallback(async () => {
    setLoadingIncome(true);
    try {
      const res = await FinanceService.listIncome({ limit: 25 });
      setIncomeList(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load income');
    } finally { setLoadingIncome(false); }
  }, []);

  const fetchTransfers = useCallback(async () => {
    setLoadingTransfers(true);
    try {
      const res = await FinanceService.listTransfers({ limit: 25 });
      setTransfers(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load transfers');
    } finally { setLoadingTransfers(false); }
  }, []);

  useEffect(() => {
    loadAccounts();
    loadHeads();
    loadStaff();
    loadStudents();
    fetchExpenses();
    fetchIncome();
    fetchTransfers();
  }, [loadAccounts, loadHeads, loadStaff, loadStudents, fetchExpenses, fetchIncome, fetchTransfers]);

  async function submitExpense() {
    if (!expenseForm.expense_head_id || !expenseForm.from_account_id) { toast.error('Select expense head and account'); return; }
    if (!expenseForm.total_amount || expenseForm.total_amount <= 0) { toast.error('Enter valid amount'); return; }
    setSubmitting(true);
    try {
      await FinanceService.createExpense(expenseForm);
      toast.success('Expense recorded');
      setExpenseForm({ expense_head_id: '', from_account_id: '', total_amount: 0, date_of_expense: new Date().toISOString().split('T')[0], remarks: '' });
      await fetchExpenses();
      await loadAccounts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record expense');
    } finally { setSubmitting(false); }
  }

  async function deleteExpense(id: string) {
    try {
      await FinanceService.deleteExpense(id);
      toast.success('Expense deleted');
      await fetchExpenses();
      await loadAccounts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  }

  async function submitIncome() {
    if (!incomeForm.income_head_id || !incomeForm.to_account_id) { toast.error('Select income head and account'); return; }
    if (!incomeForm.amount || incomeForm.amount <= 0) { toast.error('Enter valid amount'); return; }
    setSubmitting(true);
    try {
      await FinanceService.createIncome(incomeForm);
      toast.success('Income recorded');
      setIncomeForm({ income_head_id: '', to_account_id: '', amount: 0, date_of_income: new Date().toISOString().split('T')[0], remarks: '' });
      await fetchIncome();
      await loadAccounts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record income');
    } finally { setSubmitting(false); }
  }

  async function deleteIncome(id: string) {
    try {
      await FinanceService.deleteIncome(id);
      toast.success('Income deleted');
      await fetchIncome();
      await loadAccounts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete income');
    }
  }

  async function submitTransfer() {
    if (!transferForm.from_account_id || !transferForm.to_account_id) { toast.error('Select both accounts'); return; }
    if (transferForm.from_account_id === transferForm.to_account_id) { toast.error('Source and destination must differ'); return; }
    if (!transferForm.amount || transferForm.amount <= 0) { toast.error('Enter valid amount'); return; }
    setSubmitting(true);
    try {
      await FinanceService.createTransfer(transferForm);
      toast.success('Transfer recorded');
      setTransferForm({ from_account_id: '', to_account_id: '', amount: 0, date_of_transaction: new Date().toISOString().split('T')[0], remarks: '' });
      await fetchTransfers();
      await loadAccounts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record transfer');
    } finally { setSubmitting(false); }
  }

  async function deleteTransfer(id: string) {
    try {
      await FinanceService.deleteTransfer(id);
      toast.success('Transfer deleted');
      await fetchTransfers();
      await loadAccounts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete transfer');
    }
  }

  async function loadStatement() {
    if (!statementFilters.account_id) { toast.error('Select an account'); return; }
    setLoadingStatement(true);
    try {
      const data = await FinanceService.getStatement({
        account_id: statementFilters.account_id,
        start_date: statementFilters.start_date,
        end_date: statementFilters.end_date,
      });
      setStatement(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load statement');
    } finally { setLoadingStatement(false); }
  }

  async function loadRegister() {
    setLoadingRegister(true);
    try {
      const data = await FinanceService.getRegister({
        start_date: registerFilters.start_date,
        end_date: registerFilters.end_date,
        account_id: registerFilters.account_id || undefined,
        head_type: registerFilters.head_type || undefined,
      });
      setRegister(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load register');
    } finally { setLoadingRegister(false); }
  }

  async function loadProfitLoss() {
    setLoadingPL(true);
    try {
      const data = await FinanceService.getProfitLoss({ start_date: plFilters.start_date, end_date: plFilters.end_date });
      setProfitLoss(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load profit & loss');
    } finally { setLoadingPL(false); }
  }

  const fmt = (n: string) => `₹${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return {
    activeTab, setActiveTab,
    accounts, expenseHeads, incomeHeads, staffList, studentList,
    expenses, loadingExpenses, expenseForm, setExpenseForm, submitExpense, deleteExpense,
    incomeList, loadingIncome, incomeForm, setIncomeForm, submitIncome, deleteIncome,
    transfers, loadingTransfers, transferForm, setTransferForm, submitTransfer, deleteTransfer,
    statement, loadingStatement, statementFilters, setStatementFilters, loadStatement,
    register, loadingRegister, registerFilters, setRegisterFilters, loadRegister,
    profitLoss, loadingPL, plFilters, setPlFilters, loadProfitLoss,
    submitting,
    fmt, fmtDate,
  };
}
