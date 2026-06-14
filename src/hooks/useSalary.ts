"use client";

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  SalaryService,
  SalaryHead, CreateSalaryHeadPayload, UpdateSalaryHeadPayload,
  SalaryTemplate, CreateSalaryTemplatePayload, SalaryTemplateItemPayload,
  SalaryAssignment, AssignSalaryPayload,
  SalaryTransaction, CreateSalaryTransactionPayload,
  SALARY_HEAD_TYPES, SALARY_PAYMENT_MODES,
} from '@/services/salary.service';
import { StaffService } from '@/services/staff.service';
import type { Staff } from '@/types';
import { FinanceService } from '@/services/finance.service';
import type { FinanceAccount, FinanceHead } from '@/services/finance.service';

export type SalaryTab = 'heads' | 'templates' | 'assignments' | 'transactions' | 'process' | 'payslip';

export function useSalary() {
  const [activeTab, setActiveTab] = useState<SalaryTab>('heads');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [financeAccounts, setFinanceAccounts] = useState<FinanceAccount[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<FinanceHead[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ─── Heads ─────────────────────────────────────────────────────────────────
  const [heads, setHeads] = useState<SalaryHead[]>([]);
  const [loadingHeads, setLoadingHeads] = useState(false);
  const [editingHead, setEditingHead] = useState<SalaryHead | null>(null);
  const [headForm, setHeadForm] = useState<CreateSalaryHeadPayload>({
    name: '', head_type: 'Earning', code: '', is_enabled: true,
  });

  // ─── Templates ─────────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<SalaryTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SalaryTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateEnabled, setTemplateEnabled] = useState(true);
  const [templateItems, setTemplateItems] = useState<SalaryTemplateItemPayload[]>([{ salary_head_id: '', default_amount: 0 }]);

  // ─── Assignments ────────────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<SalaryAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignForm, setAssignForm] = useState<AssignSalaryPayload>({
    employee_id: '', template_id: '', effective_from: new Date().toISOString().split('T')[0], remarks: '',
  });

  // ─── Transactions ───────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<SalaryTransaction[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [txnForm, setTxnForm] = useState<CreateSalaryTransactionPayload>({
    employee_id: '', salary_month: '', total_amount: 0, deduction_amount: 0,
    payment_mode: 'CASH', payment_release_date: new Date().toISOString().split('T')[0],
    from_account_id: '', expense_head_id: '', remarks: '',
  });
  const [activeAssignment, setActiveAssignment] = useState<SalaryAssignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);

  // ─── Payslip ────────────────────────────────────────────────────────────────
  const [payslipEmployeeId, setPayslipEmployeeId] = useState('');
  const [payslipMonth, setPayslipMonth] = useState('');
  const [payslipTxn, setPayslipTxn] = useState<SalaryTransaction | null>(null);
  const [payslipAssignment, setPayslipAssignment] = useState<SalaryAssignment | null>(null);
  const [loadingPayslip, setLoadingPayslip] = useState(false);

  // ─── Process ────────────────────────────────────────────────────────────────
  const [processMonth, setProcessMonth] = useState('');
  const [processEmployeeId, setProcessEmployeeId] = useState('');
  const [pendingTxns, setPendingTxns] = useState<SalaryTransaction[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const fetchHeads = useCallback(async () => {
    setLoadingHeads(true);
    try {
      const res = await SalaryService.listHeads({ limit: 100 });
      setHeads(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load salary heads');
    } finally { setLoadingHeads(false); }
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const data = await SalaryService.listTemplates();
      setTemplates(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load templates');
    } finally { setLoadingTemplates(false); }
  }, []);

  const fetchAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      const data = await SalaryService.listAssignments();
      setAssignments(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally { setLoadingAssignments(false); }
  }, []);

  const fetchTransactions = useCallback(async (params: Record<string, unknown> = {}) => {
    setLoadingTxns(true);
    try {
      const res = await SalaryService.listTransactions({ limit: 25, ...params });
      setTransactions(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally { setLoadingTxns(false); }
  }, []);

  const fetchPendingTransactions = useCallback(async () => {
    setLoadingPending(true);
    try {
      const params: Record<string, unknown> = { status: 'PENDING', limit: 100 };
      if (processMonth) params.salary_month = processMonth;
      if (processEmployeeId) params.employee_id = processEmployeeId;
      const res = await SalaryService.listTransactions(params);
      setPendingTxns(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load pending transactions');
    } finally { setLoadingPending(false); }
  }, [processMonth, processEmployeeId]);

  // Auto-fetch active assignment when employee selected on Monthly Salary tab
  useEffect(() => {
    if (!txnForm.employee_id) {
      setActiveAssignment(null);
      return;
    }
    setLoadingAssignment(true);
    SalaryService.listAssignmentsByEmployee(txnForm.employee_id)
      .then(list => {
        const active = list.find(a => a.is_active) ?? null;
        setActiveAssignment(active);
        if (active) {
          const earnings = active.items.filter(i => i.head_type === 'Earning').reduce((s, i) => s + parseFloat(i.default_amount), 0);
          const deductions = active.items.filter(i => i.head_type === 'Deduction').reduce((s, i) => s + parseFloat(i.default_amount), 0);
          setTxnForm(f => ({ ...f, total_amount: earnings - deductions }));
        } else {
          setTxnForm(f => ({ ...f, total_amount: 0 }));
        }
      })
      .catch(() => setActiveAssignment(null))
      .finally(() => setLoadingAssignment(false));
  }, [txnForm.employee_id]);

  useEffect(() => {
    fetchHeads();
    fetchTemplates();
    fetchAssignments();
    fetchTransactions();
    // Load staff + finance data for dropdowns
    StaffService.list({ limit: 100 }).then(r => setStaffList(r.items)).catch(() => {});
    FinanceService.listAccounts({ limit: 100, is_enabled: true }).then(r => setFinanceAccounts(r.items)).catch(() => {});
    FinanceService.listHeads({ limit: 100, head_type: 'Expense', is_enabled: true }).then(r => setExpenseHeads(r.items)).catch(() => {});
  }, [fetchHeads, fetchTemplates, fetchAssignments, fetchTransactions]);

  // ─── Head actions ───────────────────────────────────────────────────────────

  function startEditHead(head: SalaryHead) {
    setEditingHead(head);
    setHeadForm({ name: head.name, head_type: head.head_type as 'Earning' | 'Deduction', code: head.code, is_enabled: head.is_enabled });
  }

  function cancelEditHead() {
    setEditingHead(null);
    setHeadForm({ name: '', head_type: 'Earning', code: '', is_enabled: true });
  }

  async function submitHead() {
    if (!headForm.name.trim()) { toast.error('Name is required'); return; }
    if (!headForm.code.trim()) { toast.error('Code is required'); return; }
    setSubmitting(true);
    try {
      if (editingHead) {
        await SalaryService.updateHead(editingHead.id, headForm as UpdateSalaryHeadPayload);
        toast.success('Salary head updated');
      } else {
        await SalaryService.createHead(headForm);
        toast.success('Salary head created');
      }
      cancelEditHead();
      await fetchHeads();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save salary head');
    } finally { setSubmitting(false); }
  }

  async function deleteHead(id: string) {
    try {
      await SalaryService.deleteHead(id);
      toast.success('Salary head deleted');
      await fetchHeads();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete salary head');
    }
  }

  // ─── Template actions ────────────────────────────────────────────────────────

  function startEditTemplate(tpl: SalaryTemplate) {
    setEditingTemplate(tpl);
    setTemplateName(tpl.name);
    setTemplateEnabled(tpl.is_enabled);
    setTemplateItems(tpl.items.map(i => ({ salary_head_id: i.salary_head_id, default_amount: parseFloat(i.default_amount) })));
  }

  function cancelEditTemplate() {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateEnabled(true);
    setTemplateItems([{ salary_head_id: '', default_amount: 0 }]);
  }

  function addTemplateItem() {
    setTemplateItems(prev => [...prev, { salary_head_id: '', default_amount: 0 }]);
  }

  function removeTemplateItem(idx: number) {
    setTemplateItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateTemplateItem(idx: number, field: keyof SalaryTemplateItemPayload, value: string | number) {
    setTemplateItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  async function submitTemplate() {
    if (!templateName.trim()) { toast.error('Template name is required'); return; }
    const validItems = templateItems.filter(i => i.salary_head_id);
    if (!validItems.length) { toast.error('Add at least one salary head'); return; }
    setSubmitting(true);
    try {
      const payload: CreateSalaryTemplatePayload = { name: templateName, is_enabled: templateEnabled, items: validItems };
      if (editingTemplate) {
        await SalaryService.updateTemplate(editingTemplate.id, payload);
        toast.success('Template updated');
      } else {
        await SalaryService.createTemplate(payload);
        toast.success('Template created');
      }
      cancelEditTemplate();
      await fetchTemplates();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save template');
    } finally { setSubmitting(false); }
  }

  async function deleteTemplate(id: string) {
    try {
      await SalaryService.deleteTemplate(id);
      toast.success('Template deleted');
      await fetchTemplates();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete template');
    }
  }

  // ─── Assignment actions ──────────────────────────────────────────────────────

  async function submitAssignment() {
    if (!assignForm.employee_id) { toast.error('Select an employee'); return; }
    if (!assignForm.template_id) { toast.error('Select a salary template'); return; }
    if (!assignForm.effective_from) { toast.error('Select effective from date'); return; }
    setSubmitting(true);
    try {
      await SalaryService.assignStructure(assignForm);
      toast.success('Salary structure assigned');
      setAssignForm({ employee_id: '', template_id: '', effective_from: new Date().toISOString().split('T')[0], remarks: '' });
      await fetchAssignments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign structure');
    } finally { setSubmitting(false); }
  }

  async function deactivateAssignment(id: string) {
    try {
      await SalaryService.deactivateAssignment(id);
      toast.success('Assignment deactivated');
      await fetchAssignments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate assignment');
    }
  }

  // ─── Transaction actions ─────────────────────────────────────────────────────

  async function submitTransaction() {
    if (!txnForm.employee_id) { toast.error('Select employee'); return; }
    if (!txnForm.salary_month) { toast.error('Select salary month'); return; }
    if (!txnForm.total_amount || txnForm.total_amount <= 0) { toast.error('Enter valid amount'); return; }
    setSubmitting(true);
    try {
      await SalaryService.createTransaction(txnForm);
      toast.success('Salary transaction created');
      setTxnForm({ employee_id: '', salary_month: '', total_amount: 0, deduction_amount: 0, payment_mode: 'CASH', payment_release_date: new Date().toISOString().split('T')[0], from_account_id: '', expense_head_id: '', remarks: '' });
      setActiveAssignment(null);
      await fetchTransactions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally { setSubmitting(false); }
  }

  async function deleteTxn(id: string) {
    try {
      await SalaryService.deleteTransaction(id);
      toast.success('Transaction deleted');
      await fetchTransactions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  }

  async function generatePayslip() {
    if (!payslipEmployeeId) { toast.error('Select an employee'); return; }
    if (!payslipMonth) { toast.error('Select a salary month'); return; }
    setLoadingPayslip(true);
    setPayslipTxn(null);
    setPayslipAssignment(null);
    try {
      const [txnRes, assignments] = await Promise.all([
        SalaryService.listTransactions({ employee_id: payslipEmployeeId, salary_month: payslipMonth, limit: 1 }),
        SalaryService.listAssignmentsByEmployee(payslipEmployeeId),
      ]);
      const txn = txnRes.items[0] ?? null;
      if (!txn) { toast.error(`No salary record found for selected employee and month`); return; }
      setPayslipTxn(txn);
      const active = assignments.find(a => a.is_active) ?? assignments[0] ?? null;
      setPayslipAssignment(active);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate payslip');
    } finally { setLoadingPayslip(false); }
  }

  async function processTxn(id: string) {
    try {
      await SalaryService.processTransaction(id);
      toast.success('Transaction processed');
      await fetchTransactions();
      await fetchPendingTransactions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to process transaction');
    }
  }

  return {
    activeTab, setActiveTab,
    staffList, financeAccounts, expenseHeads,
    submitting,
    // Heads
    heads, loadingHeads, editingHead, headForm, setHeadForm,
    startEditHead, cancelEditHead, submitHead, deleteHead,
    // Templates
    templates, loadingTemplates, editingTemplate,
    templateName, setTemplateName, templateEnabled, setTemplateEnabled,
    templateItems,
    startEditTemplate, cancelEditTemplate, submitTemplate, deleteTemplate,
    addTemplateItem, removeTemplateItem, updateTemplateItem,
    // Assignments
    assignments, loadingAssignments, assignForm, setAssignForm,
    submitAssignment, deactivateAssignment,
    // Transactions
    transactions, loadingTxns, txnForm, setTxnForm,
    activeAssignment, loadingAssignment,
    submitTransaction, deleteTxn, processTxn, fetchTransactions,
    // Process tab
    pendingTxns, loadingPending, processMonth, setProcessMonth,
    processEmployeeId, setProcessEmployeeId, fetchPendingTransactions,
    // Payslip tab
    payslipEmployeeId, setPayslipEmployeeId, payslipMonth, setPayslipMonth,
    payslipTxn, payslipAssignment, loadingPayslip, generatePayslip,
    SALARY_HEAD_TYPES, SALARY_PAYMENT_MODES,
  };
}
