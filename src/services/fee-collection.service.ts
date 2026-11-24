import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { OnlinePaymentMode, UpiPaymentClaim } from '@/services/parent-portal.service';

export interface PaymentCollectionSettings {
  online_payment_mode: OnlinePaymentMode;
  upi_id: string | null;
  upi_payee_name: string | null;
  razorpay_key_id: string | null;
  razorpay_key_secret_set: boolean;
}

export interface UpdatePaymentCollectionPayload {
  online_payment_mode: OnlinePaymentMode;
  upi_id?: string | null;
  upi_payee_name?: string | null;
  razorpay_key_id?: string | null;
  razorpay_key_secret?: string;
}

export type ClaimStatus = UpiPaymentClaim['status'];

export interface ReminderFilters {
  class_id?: string;
  section_id?: string;
  overdue_only?: boolean;
}

export interface ReminderRecipient {
  student_id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  email: string | null;
  amount_due: number;
  message: string;
  whatsapp_url: string;
  email_url: string | null;
}

export interface ReminderList {
  students: number;
  parents: number;
  total_due: number;
  recipients: ReminderRecipient[];
}

export const FeeCollectionService = {
  async getSettings(): Promise<PaymentCollectionSettings> {
    const res = await apiGateway.get<PaymentCollectionSettings>(ENDPOINTS.feeCollection.settings);
    return res.data;
  },

  async saveSettings(payload: UpdatePaymentCollectionPayload): Promise<PaymentCollectionSettings> {
    const res = await apiGateway.put<PaymentCollectionSettings>(ENDPOINTS.feeCollection.settings, payload);
    return res.data;
  },

  async listPayments(status: ClaimStatus): Promise<UpiPaymentClaim[]> {
    const res = await apiGateway.get<UpiPaymentClaim[]>(ENDPOINTS.feeCollection.payments, { params: { status } });
    return res.data;
  },

  async approve(id: string, note?: string): Promise<void> {
    await apiGateway.post(ENDPOINTS.feeCollection.approve(id), note ? { note } : {});
  },

  async reject(id: string, note?: string): Promise<void> {
    await apiGateway.post(ENDPOINTS.feeCollection.reject(id), note ? { note } : {});
  },

  async listReminders(filters: ReminderFilters): Promise<ReminderList> {
    const res = await apiGateway.get<ReminderList>(ENDPOINTS.feeCollection.reminders, { params: filters });
    return res.data;
  },
};
