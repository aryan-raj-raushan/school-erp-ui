import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { FeeMasterType, FeeReceipt, FeePayment, FeeItem, PaymentMode, PaginationMeta } from '@/types';

// ─── Fee Master Types ─────────────────────────────────────────────────────────

export const FeeMasterTypesService = {
  async list(): Promise<FeeMasterType[]> {
    const res = await apiGateway.get<FeeMasterType[]>(ENDPOINTS.fees.masterTypes);
    return res.data;
  },

  async create(name: string, description?: string): Promise<FeeMasterType> {
    const res = await apiGateway.post<FeeMasterType>(ENDPOINTS.fees.masterTypes, { name, description });
    return res.data;
  },

  async update(id: string, name: string, description?: string): Promise<FeeMasterType> {
    const res = await apiGateway.patch<FeeMasterType>(ENDPOINTS.fees.masterTypeById(id), { name, description });
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.fees.masterTypeById(id));
  },
};

// ─── Fee Receipts ─────────────────────────────────────────────────────────────

export interface CreateFeePayload {
  student_id: string;
  academic_year_id: string;
  fee_items: FeeItem[];
  discount_amount?: number;
  due_date?: string;
  notes?: string;
}

export const FeesService = {
  async list(page = 1, limit = 20, student_id?: string): Promise<{ items: FeeReceipt[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<FeeReceipt[]>(ENDPOINTS.fees.list, {
      params: { page, limit, ...(student_id ? { student_id } : {}) },
    });
    return { items: res.data, pagination: res.pagination! };
  },

  async getReceipt(id: string): Promise<FeeReceipt> {
    const res = await apiGateway.get<FeeReceipt>(ENDPOINTS.fees.receipt(id));
    return res.data;
  },

  async createSingle(payload: CreateFeePayload): Promise<FeeReceipt> {
    const res = await apiGateway.post<FeeReceipt>(ENDPOINTS.fees.single, payload);
    return res.data;
  },

  async createBulk(fees: CreateFeePayload[]): Promise<FeeReceipt[]> {
    const res = await apiGateway.post<FeeReceipt[]>(ENDPOINTS.fees.bulk, { fees });
    return res.data;
  },

  async recordManualPayment(receiptId: string, payload: {
    amount: number;
    payment_mode: PaymentMode;
    transaction_id?: string;
    notes?: string;
  }): Promise<FeePayment> {
    const res = await apiGateway.post<FeePayment>(ENDPOINTS.fees.manualPayment(receiptId), payload);
    return res.data;
  },

  async createOrder(receiptId: string): Promise<{ orderId: string; amount: number }> {
    const res = await apiGateway.post<{ orderId: string; amount: number }>(ENDPOINTS.fees.order(receiptId), {});
    return res.data;
  },

  async getParentFees(student_id?: string): Promise<FeeReceipt[]> {
    const res = await apiGateway.get<FeeReceipt[]>(ENDPOINTS.fees.parentFees, {
      params: student_id ? { student_id } : {},
    });
    return res.data;
  },
};
