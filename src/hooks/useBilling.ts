'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  InvoicesService,
  type InvoiceFilters,
  type CreateInvoicePayload,
  type CreateOneTimeChargePayload,
  type ExtraLineItemInput,
} from '@/services/invoices.service';
import { SubscriptionsService } from '@/services/subscriptions.service';
import { PaymentsService } from '@/services/payments.service';
import type { Invoice, InvoiceWithLineItems, PaginationMeta, Subscription, OneTimeChargeType, InvoicePayment } from '@/types';

interface GenerateInvoiceFormValues {
  subscription_id: string;
  due_date?: string;
  notes?: string;
}

interface OneTimeChargeFormValues {
  school_id: string;
  charge_type: OneTimeChargeType;
  description?: string;
  amount: number;
  quantity?: number;
  // When set, the charge is added as a line item directly to this existing
  // (not yet final) invoice instead of generating a brand-new one.
  target_invoice_id?: string;
}

const FINAL_STATUSES: Invoice['status'][] = ['PAID', 'VOID'];

export function useBilling(initialFilters: InvoiceFilters = {}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<InvoiceFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [pendingPayments, setPendingPayments] = useState<InvoicePayment[]>([]);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [extraItems, setExtraItems] = useState<ExtraLineItemInput[]>([]);
  const [schoolInvoiceOptions, setSchoolInvoiceOptions] = useState<Invoice[]>([]);

  const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithLineItems | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const generateForm = useForm<GenerateInvoiceFormValues>();
  const chargeForm = useForm<OneTimeChargeFormValues>();

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await InvoicesService.list(filters);
      setInvoices(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchActiveSubscriptions = useCallback(async () => {
    try {
      const result = await SubscriptionsService.list({ status: 'ACTIVE', limit: 100 });
      setActiveSubscriptions(result.items);
    } catch {
      // Non-fatal — generate-invoice modal will just show an empty picker
    }
  }, []);

  function addExtraItemRow() {
    setExtraItems((prev) => [...prev, { description: '', amount: 0, quantity: 1 }]);
  }

  function updateExtraItemRow(index: number, patch: Partial<ExtraLineItemInput>) {
    setExtraItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeExtraItemRow(index: number) {
    setExtraItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGenerateSubmit(values: GenerateInvoiceFormValues) {
    const validExtraItems = extraItems.filter((item) => item.description.trim() && item.amount > 0);
    const payload: CreateInvoicePayload = {
      subscription_id: values.subscription_id,
      ...(values.due_date && { due_date: values.due_date }),
      ...(values.notes && { notes: values.notes }),
      ...(validExtraItems.length > 0 && { extra_items: validExtraItems }),
    };
    try {
      const invoice = await InvoicesService.create(payload);
      toast.success(`Invoice ${invoice.invoice_number} generated`);
      await fetchInvoices();
      setShowGenerateModal(false);
      generateForm.reset();
      setExtraItems([]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate invoice');
    }
  }

  const fetchSchoolInvoices = useCallback(async (schoolId: string) => {
    if (!schoolId) { setSchoolInvoiceOptions([]); return; }
    try {
      const result = await InvoicesService.list({ school_id: schoolId, limit: 100 });
      setSchoolInvoiceOptions(result.items.filter((inv) => !FINAL_STATUSES.includes(inv.status)));
    } catch {
      setSchoolInvoiceOptions([]);
    }
  }, []);

  useEffect(() => {
    const subscription = chargeForm.watch((value, { name }) => {
      if (name === 'school_id') fetchSchoolInvoices(value.school_id ?? '');
    });
    return () => subscription.unsubscribe();
  }, [chargeForm, fetchSchoolInvoices]);

  async function handleChargeSubmit(values: OneTimeChargeFormValues) {
    try {
      const quantity = values.quantity && values.quantity > 0 ? Number(values.quantity) : 1;
      if (values.target_invoice_id) {
        await InvoicesService.addLineItem(values.target_invoice_id, {
          description: values.description?.trim() || values.charge_type,
          amount: Number(values.amount),
          quantity,
        });
        toast.success('Charge added to invoice');
      } else {
        const payload: CreateOneTimeChargePayload = {
          school_id: values.school_id,
          charge_type: values.charge_type,
          amount: Number(values.amount),
          quantity,
          ...(values.description && { description: values.description }),
        };
        await InvoicesService.createOneTimeCharge(payload);
        toast.success('One-time charge added');
      }
      await fetchInvoices();
      setShowChargeModal(false);
      chargeForm.reset();
      setSchoolInvoiceOptions([]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add charge');
    }
  }

  const fetchPendingPayments = useCallback(async () => {
    setIsPendingLoading(true);
    try {
      const result = await PaymentsService.listPending();
      setPendingPayments(result);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load pending payments');
    } finally {
      setIsPendingLoading(false);
    }
  }, []);

  async function approvePayment(payment: InvoicePayment) {
    if (!payment.invoice_id) return;
    try {
      await PaymentsService.approve(payment.invoice_id, payment.id);
      toast.success('Payment approved');
      await fetchPendingPayments();
      await fetchInvoices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve payment');
    }
  }

  async function rejectPayment(payment: InvoicePayment, reason: string) {
    if (!payment.invoice_id) return;
    try {
      await PaymentsService.reject(payment.invoice_id, payment.id, reason);
      toast.success('Payment rejected');
      setRejectingPaymentId(null);
      await fetchPendingPayments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject payment');
    }
  }

  async function openInvoice(id: string) {
    setIsDetailLoading(true);
    try {
      const invoice = await InvoicesService.getById(id);
      setViewingInvoice(invoice);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeInvoice() {
    setViewingInvoice(null);
  }

  function canAddItems(invoice: Pick<Invoice, 'status'>): boolean {
    return !FINAL_STATUSES.includes(invoice.status);
  }

  async function addItemToInvoice(item: ExtraLineItemInput) {
    if (!viewingInvoice) return;
    setIsAddingItem(true);
    try {
      const updated = await InvoicesService.addLineItem(viewingInvoice.id, item);
      setViewingInvoice(updated);
      toast.success('Item added to invoice');
      await fetchInvoices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setIsAddingItem(false);
    }
  }

  function updateFilters(next: Partial<InvoiceFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { fetchActiveSubscriptions(); }, [fetchActiveSubscriptions]);
  useEffect(() => { fetchPendingPayments(); }, [fetchPendingPayments]);

  return {
    invoices, pagination, filters, isLoading, updateFilters,
    activeSubscriptions,
    pendingPayments, isPendingLoading, approvePayment, rejectPayment,
    rejectingPaymentId, setRejectingPaymentId,
    showGenerateModal,
    openGenerateModal: () => setShowGenerateModal(true),
    closeGenerateModal: () => { setShowGenerateModal(false); generateForm.reset(); setExtraItems([]); },
    generateForm,
    handleGenerateSubmit: generateForm.handleSubmit(handleGenerateSubmit),
    isGenerating: generateForm.formState.isSubmitting,
    extraItems, addExtraItemRow, updateExtraItemRow, removeExtraItemRow,
    showChargeModal,
    openChargeModal: () => setShowChargeModal(true),
    closeChargeModal: () => { setShowChargeModal(false); chargeForm.reset(); setSchoolInvoiceOptions([]); },
    chargeForm,
    handleChargeSubmit: chargeForm.handleSubmit(handleChargeSubmit),
    isAddingCharge: chargeForm.formState.isSubmitting,
    schoolInvoiceOptions,
    viewingInvoice, isDetailLoading, openInvoice, closeInvoice,
    canAddItems, addItemToInvoice, isAddingItem,
  };
}
