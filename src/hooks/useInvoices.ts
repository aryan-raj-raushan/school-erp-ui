'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { InvoicesService, type InvoiceFilters } from '@/services/invoices.service';
import { PaymentsService } from '@/services/payments.service';
import { UploadsService } from '@/services/uploads.service';
import { useAuthStore } from '@/store/auth.store';
import type { Invoice, InvoiceWithLineItems, PaginationMeta, PaymentMethod } from '@/types';

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

export function useInvoices(initialFilters: InvoiceFilters = {}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<InvoiceFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithLineItems | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [showPayModal, setShowPayModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await InvoicesService.listMy(filters);
      setInvoices(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

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

  async function downloadPdf(id: string) {
    setIsDownloading(true);
    try {
      const url = await InvoicesService.getPdfUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  }

  function openPayModal() {
    setShowPayModal(true);
  }

  function closePayModal() {
    setShowPayModal(false);
  }

  async function submitManualPayment(method: PaymentMethod, amount: number, file: File | null, notes?: string) {
    if (!viewingInvoice) return;
    setIsPaying(true);
    try {
      let proof_url: string | undefined;
      let proof_s3_key: string | undefined;
      if (file) {
        const uploaded = await UploadsService.uploadDocument(file, {
          reference_id: viewingInvoice.id,
          reference_type: 'invoice_payment',
          document_type: 'payment_proof',
        });
        proof_url = uploaded.url;
        proof_s3_key = uploaded.s3Key;
      }
      await PaymentsService.submit(viewingInvoice.id, { amount, payment_method: method, proof_url, proof_s3_key, notes });
      toast.success('Payment submitted for verification');
      setShowPayModal(false);
      await openInvoice(viewingInvoice.id);
      await fetchInvoices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit payment');
    } finally {
      setIsPaying(false);
    }
  }

  async function payWithRazorpay() {
    if (!viewingInvoice) return;
    setIsPaying(true);
    try {
      const order = await PaymentsService.createRazorpayOrder(viewingInvoice.id);
      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error('Razorpay failed to load');

      const razorpay = new window.Razorpay({
        key: order.key_id,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        order_id: order.order_id,
        name: 'School ERP',
        description: viewingInvoice.invoice_number,
        prefill: {
          name: user ? `${user.first_name} ${user.last_name ?? ''}`.trim() : undefined,
          email: user?.email,
          contact: user?.phone_number,
        },
        handler: () => {
          toast.success('Payment received — confirming with the bank, this may take a moment.');
          setShowPayModal(false);
          openInvoice(viewingInvoice.id);
          fetchInvoices();
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
      });
      razorpay.open();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start Razorpay checkout');
      setIsPaying(false);
    }
  }

  function updateFilters(next: Partial<InvoiceFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  return {
    invoices, pagination, filters, isLoading,
    viewingInvoice, isDetailLoading, openInvoice, closeInvoice,
    isDownloading, downloadPdf,
    showPayModal, openPayModal, closePayModal, isPaying,
    submitManualPayment, payWithRazorpay,
    updateFilters,
  };
}
