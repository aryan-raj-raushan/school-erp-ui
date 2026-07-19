import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { Invoice, InvoiceWithLineItems, InvoiceStatus, OneTimeCharge, OneTimeChargeType, PaginationMeta } from '@/types';

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  school_id?: string;
  status?: InvoiceStatus;
  [key: string]: unknown;
}

export interface PaginatedInvoices {
  items: Invoice[];
  pagination: PaginationMeta;
}

export interface ExtraLineItemInput {
  description: string;
  amount: number;
  quantity?: number;
}

export interface CreateInvoicePayload {
  subscription_id: string;
  due_date?: string;
  notes?: string;
  extra_items?: ExtraLineItemInput[];
}

export interface CreateOneTimeChargePayload {
  school_id: string;
  subscription_id?: string;
  charge_type: OneTimeChargeType;
  description?: string;
  amount: number;
  quantity?: number;
}

export const InvoicesService = {
  async list(filters: InvoiceFilters = {}): Promise<PaginatedInvoices> {
    const res = await apiGateway.get<Invoice[]>(ENDPOINTS.invoices.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async listMy(filters: InvoiceFilters = {}): Promise<PaginatedInvoices> {
    const res = await apiGateway.get<Invoice[]>(ENDPOINTS.invoices.my, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<InvoiceWithLineItems> {
    const res = await apiGateway.get<InvoiceWithLineItems>(ENDPOINTS.invoices.byId(id));
    return res.data;
  },

  async getPdfUrl(id: string): Promise<string> {
    const res = await apiGateway.get<{ pdf_url: string }>(ENDPOINTS.invoices.pdf(id));
    return res.data.pdf_url;
  },

  async create(payload: CreateInvoicePayload): Promise<Invoice> {
    const res = await apiGateway.post<Invoice>(ENDPOINTS.invoices.list, payload);
    return res.data;
  },

  async addLineItem(invoiceId: string, payload: ExtraLineItemInput): Promise<InvoiceWithLineItems> {
    const res = await apiGateway.post<InvoiceWithLineItems>(ENDPOINTS.invoices.lineItems(invoiceId), payload);
    return res.data;
  },

  async createOneTimeCharge(payload: CreateOneTimeChargePayload): Promise<OneTimeCharge> {
    const res = await apiGateway.post<OneTimeCharge>(ENDPOINTS.oneTimeCharges.list, payload);
    return res.data;
  },
};
