import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { InvoicePayment, RazorpayOrder, PaymentMethod } from '@/types';

export interface SubmitPaymentPayload {
  amount: number;
  payment_method: PaymentMethod;
  proof_url?: string;
  proof_s3_key?: string;
  notes?: string;
}

export const PaymentsService = {
  async listByInvoice(invoiceId: string): Promise<InvoicePayment[]> {
    const res = await apiGateway.get<InvoicePayment[]>(ENDPOINTS.invoicePayments.list(invoiceId));
    return res.data;
  },

  async submit(invoiceId: string, payload: SubmitPaymentPayload): Promise<InvoicePayment> {
    const res = await apiGateway.post<InvoicePayment>(ENDPOINTS.invoicePayments.submit(invoiceId), payload);
    return res.data;
  },

  async createRazorpayOrder(invoiceId: string): Promise<RazorpayOrder> {
    const res = await apiGateway.post<RazorpayOrder>(ENDPOINTS.invoicePayments.razorpayOrder(invoiceId));
    return res.data;
  },

  async listPending(): Promise<InvoicePayment[]> {
    const res = await apiGateway.get<InvoicePayment[]>(ENDPOINTS.payments.pending);
    return res.data;
  },

  async approve(invoiceId: string, paymentId: string): Promise<InvoicePayment> {
    const res = await apiGateway.post<InvoicePayment>(ENDPOINTS.invoicePayments.approve(invoiceId, paymentId));
    return res.data;
  },

  async reject(invoiceId: string, paymentId: string, reason: string): Promise<InvoicePayment> {
    const res = await apiGateway.post<InvoicePayment>(ENDPOINTS.invoicePayments.reject(invoiceId, paymentId), { reason });
    return res.data;
  },
};
