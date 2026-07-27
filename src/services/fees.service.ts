import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

// ─── Enums & Constants ───────────────────────────────────────────────────────

export type FeeCategory = 'Class' | 'Transport' | 'Other';
export type FeeFrequency = 'Monthly' | 'Quarterly' | 'Session' | 'NA';
export type FeeBillStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WAIVED';
export type PaymentMode = 'CASH' | 'ONLINE' | 'CHEQUE' | 'DD' | 'NEFT' | 'UPI';
export type FeePlanType = 'Regular' | 'PromotionFree' | 'Admission';

export const FEE_CATEGORIES: FeeCategory[] = ['Class', 'Transport', 'Other'];
export const FEE_FREQUENCIES: FeeFrequency[] = ['Monthly', 'Quarterly', 'Session', 'NA'];
export const FEE_BILL_STATUSES: FeeBillStatus[] = ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED'];
export const PAYMENT_MODES: PaymentMode[] = ['CASH', 'ONLINE', 'CHEQUE', 'DD', 'NEFT', 'UPI'];
export const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// ─── Fee Types ───────────────────────────────────────────────────────────────

export interface FeeType {
  id: string;
  school_id: string;
  name: string;
  fee_category: FeeCategory;
  frequency: FeeFrequency;
  applicable_months: string[] | null;
  income_head_id: string | null;
  income_head_name?: string | null;
  is_active: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateFeeTypePayload {
  name: string;
  fee_category: FeeCategory;
  frequency: FeeFrequency;
  applicable_months?: string[];
  income_head_id?: string;
}

export interface UpdateFeeTypePayload {
  name?: string;
  frequency?: FeeFrequency;
  applicable_months?: string[];
  income_head_id?: string;
  is_active?: boolean;
}

export interface FilterFeeTypeParams {
  fee_category?: FeeCategory;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// ─── Fee Plans ───────────────────────────────────────────────────────────────

export interface FeePlan {
  id: string;
  school_id: string;
  name: string;
  plan_type: FeePlanType;
  description: string | null;
  is_active: boolean;
  deleted: boolean;
  created_at: string;
}

export interface UpdateFeePlanPayload {
  is_active?: boolean;
  description?: string;
}

// ─── Class Fee Structure ─────────────────────────────────────────────────────

export interface FeeClassStructureItem {
  fee_type_id: string;
  fee_type_name: string;
  fee_category: FeeCategory;
  frequency: FeeFrequency;
  applicable_months: string[] | null;
  fee_type_active: boolean;
  structure_id: string | null;
  amount: string | null;
  is_enabled: boolean | null;
}

export interface UpsertClassStructurePayload {
  academic_year_id: string;
  fee_plan_id: string;
  class_id: string;
  items: { fee_type_id: string; amount: number; is_enabled: boolean }[];
}

export interface FilterClassStructureParams {
  academic_year_id: string;
  fee_plan_id: string;
  class_id: string;
}

// ─── Transport Routes ─────────────────────────────────────────────────────────

export interface TransportRoute {
  id: string;
  school_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  deleted: boolean;
  created_at: string;
}

export interface CreateTransportRoutePayload {
  name: string;
  description?: string;
}

export interface TransportRouteFeeItem {
  id: string;
  fee_type_id: string;
  fee_type_name: string;
  frequency: FeeFrequency;
  applicable_months: string[] | null;
  amount: string;
  is_enabled: boolean;
}

export interface UpsertRouteFeePayload {
  academic_year_id: string;
  items: { fee_type_id: string; amount: number; is_enabled?: boolean }[];
}

// ─── Fee Bills ───────────────────────────────────────────────────────────────

export interface FeeBill {
  id: string;
  school_id: string;
  student_id: string;
  academic_year_id: string;
  fee_type_id: string;
  fee_type_name: string;
  fee_category: FeeCategory;
  frequency: FeeFrequency;
  fee_plan_id: string | null;
  fee_plan_name?: string | null;
  bill_month: string | null;
  due_date: string | null;
  total_amount: string;
  discount_amount: string;
  paid_amount: string;
  late_fine_amount: string;
  status: FeeBillStatus;
  is_manual: boolean;
  notes: string | null;
  created_at: string;
}

export interface CreateFeeBillPayload {
  student_id: string;
  academic_year_id: string;
  fee_type_id: string;
  fee_plan_id?: string;
  bill_month?: string;
  due_date?: string;
  total_amount: number;
  notes?: string;
}

export interface BulkCreateFeeBillPayload {
  academic_year_id: string;
  class_id: string;
  fee_plan_id: string;
  fee_type_id: string;
  bill_month?: string;
  due_date?: string;
}

export interface GenerateStudentBillsPayload {
  student_id: string;
  academic_year_id: string;
  fee_plan_id: string;
  class_id: string;
}

export interface FilterFeeBillParams {
  student_id?: string;
  academic_year_id?: string;
  month?: string;
  status?: FeeBillStatus;
  page?: number;
  limit?: number;
}

// ─── Fee Payments ─────────────────────────────────────────────────────────────

export interface FeeBillPayment {
  id: string;
  bill_id: string;
  amount: string;
  payment_mode: PaymentMode;
  to_account_id: string | null;
  transaction_id: string | null;
  bank_name: string | null;
  payment_date: string;
  finance_income_id: string | null;
  remarks: string | null;
  created_at: string;
}

export interface CreateFeePaymentPayload {
  amount: number;
  payment_mode: PaymentMode;
  payment_date: string;
  to_account_id?: string;
  transaction_id?: string;
  bank_name?: string;
  remarks?: string;
}

// ─── Monthly Dues ─────────────────────────────────────────────────────────────

export interface StudentMonthlyDue {
  student_id: string;
  student_name: string;
  father_name: string | null;
  phone: string | null;
  admission_number: string | null;
  roll_no: string | null;
  month: string;
  due_amount: string;
  bill_ids: string[];
}

export interface FilterMonthlyDuesParams {
  academic_year_id: string;
  class_id: string;
  month: string;
}

// ─── Bulk Ops ────────────────────────────────────────────────────────────────

export interface BulkDiscountPayload {
  academic_year_id: string;
  class_id?: string;
  student_ids?: string[];
  fee_type_id: string;
  discount_amount: number;
  reason?: string;
}

export interface BulkExtraPayload {
  academic_year_id: string;
  class_id?: string;
  student_ids?: string[];
  fee_type_id: string;
  amount: number;
  bill_month?: string;
  due_date?: string;
  notes?: string;
}

// ─── Demand Receipt ───────────────────────────────────────────────────────────

export interface DemandReceiptStudent {
  student_id: string;
  student_name: string;
  father_name: string | null;
  admission_number: string | null;
  roll_no: string | null;
  bills: {
    fee_type_name: string;
    frequency: string;
    bill_month: string | null;
    total_amount: string;
    paid_amount: string;
    due_amount: string;
    due_date: string | null;
  }[];
  total_due: string;
}

export interface GenerateDemandReceiptParams {
  academic_year_id: string;
  class_id: string;
  month_from: string;
  month_to: string;
  due_date?: string;
}

// ─── Late Rules ───────────────────────────────────────────────────────────────

export interface FeeLateRule {
  id: string;
  school_id: string;
  name: string;
  academic_year_id: string;
  applicable_fee_type_ids: string[];
  late_fine_fee_type_id: string;
  late_fee_amount: string;
  days_after_due: number;
  start_from_current_month: boolean;
  is_enabled: boolean;
  created_at: string;
}

export interface CreateFeeLateRulePayload {
  name: string;
  academic_year_id: string;
  applicable_fee_type_ids: string[];
  late_fine_fee_type_id: string;
  late_fee_amount: number;
  days_after_due: number;
  start_from_current_month?: boolean;
}

// ─── API Service Functions ───────────────────────────────────────────────────

export const feeTypeService = {
  list: (params?: FilterFeeTypeParams) =>
    apiGateway.get<{ data: FeeType[]; meta: PaginationMeta }>(ENDPOINTS.fees.types, { params }),
  getById: (id: string) =>
    apiGateway.get<{ data: FeeType }>(ENDPOINTS.fees.typeById(id)),
  create: (payload: CreateFeeTypePayload) =>
    apiGateway.post<{ data: FeeType }>(ENDPOINTS.fees.types, payload),
  update: (id: string, payload: UpdateFeeTypePayload) =>
    apiGateway.patch<{ data: FeeType }>(ENDPOINTS.fees.typeById(id), payload),
  delete: (id: string) =>
    apiGateway.delete(ENDPOINTS.fees.typeById(id)),
};

export const feePlanService = {
  list: () =>
    apiGateway.get<{ data: FeePlan[] }>(ENDPOINTS.fees.plans),
  update: (id: string, payload: UpdateFeePlanPayload) =>
    apiGateway.patch<{ data: FeePlan }>(ENDPOINTS.fees.planById(id), payload),
};

export const feeClassStructureService = {
  get: (params: FilterClassStructureParams) =>
    apiGateway.get<{ data: FeeClassStructureItem[] }>(ENDPOINTS.fees.classStructure, { params }),
  upsert: (payload: UpsertClassStructurePayload) =>
    apiGateway.put<{ data: FeeClassStructureItem[] }>(ENDPOINTS.fees.classStructure, payload),
};

export const transportRouteService = {
  list: () =>
    apiGateway.get<{ data: TransportRoute[] }>(ENDPOINTS.fees.transportRoutes),
  create: (payload: CreateTransportRoutePayload) =>
    apiGateway.post<{ data: TransportRoute }>(ENDPOINTS.fees.transportRoutes, payload),
  update: (id: string, payload: Partial<CreateTransportRoutePayload> & { is_active?: boolean }) =>
    apiGateway.patch<{ data: TransportRoute }>(ENDPOINTS.fees.transportRouteById(id), payload),
  delete: (id: string) =>
    apiGateway.delete(ENDPOINTS.fees.transportRouteById(id)),
  getFees: (id: string, academic_year_id: string) =>
    apiGateway.get<{ data: TransportRouteFeeItem[] }>(ENDPOINTS.fees.transportRouteFees(id), { params: { academic_year_id } }),
  upsertFees: (id: string, payload: UpsertRouteFeePayload) =>
    apiGateway.put<{ data: TransportRouteFeeItem[] }>(ENDPOINTS.fees.transportRouteFees(id), payload),
};

export const feeBillService = {
  list: (params?: FilterFeeBillParams) =>
    apiGateway.get<{ data: FeeBill[]; meta: PaginationMeta }>(ENDPOINTS.fees.bills, { params }),
  studentBills: (studentId: string, academic_year_id: string) =>
    apiGateway.get<{ data: FeeBill[] }>(ENDPOINTS.fees.studentBills(studentId), { params: { academic_year_id } }),
  create: (payload: CreateFeeBillPayload) =>
    apiGateway.post<{ data: FeeBill }>(ENDPOINTS.fees.bills, payload),
  generateClass: (payload: BulkCreateFeeBillPayload) =>
    apiGateway.post<{ data: { created: number } }>(ENDPOINTS.fees.generateClass, payload),
  generateForStudent: (payload: GenerateStudentBillsPayload) =>
    apiGateway.post<{ data: { created: number; skipped: number } }>(ENDPOINTS.fees.generateForStudent, payload),
  pay: (id: string, payload: CreateFeePaymentPayload) =>
    apiGateway.post<{ data: FeeBillPayment }>(ENDPOINTS.fees.payBill(id), payload),
  payments: (id: string) =>
    apiGateway.get<{ data: FeeBillPayment[] }>(ENDPOINTS.fees.billPayments(id)),
  deletePayment: (id: string) =>
    apiGateway.delete(ENDPOINTS.fees.deletePayment(id)),
};

export const monthlyDuesService = {
  get: (params: FilterMonthlyDuesParams) =>
    apiGateway.get<{ data: StudentMonthlyDue[] }>(ENDPOINTS.fees.monthlyDues, { params }),
};

export const feeBulkService = {
  discount: (payload: BulkDiscountPayload) =>
    apiGateway.post<{ data: { applied: number } }>(ENDPOINTS.fees.bulkDiscount, payload),
  extra: (payload: BulkExtraPayload) =>
    apiGateway.post<{ data: { created: number } }>(ENDPOINTS.fees.bulkExtra, payload),
};

export const demandReceiptService = {
  get: (params: GenerateDemandReceiptParams) =>
    apiGateway.get<{ data: DemandReceiptStudent[] }>(ENDPOINTS.fees.demandReceipt, { params }),
};

export const feeLateRuleService = {
  list: (academic_year_id?: string) =>
    apiGateway.get<{ data: FeeLateRule[] }>(ENDPOINTS.fees.lateRules, { params: academic_year_id ? { academic_year_id } : undefined }),
  create: (payload: CreateFeeLateRulePayload) =>
    apiGateway.post<{ data: FeeLateRule }>(ENDPOINTS.fees.lateRules, payload),
  update: (id: string, payload: Partial<CreateFeeLateRulePayload> & { is_enabled?: boolean }) =>
    apiGateway.patch<{ data: FeeLateRule }>(ENDPOINTS.fees.lateRuleById(id), payload),
  delete: (id: string) =>
    apiGateway.delete(ENDPOINTS.fees.lateRuleById(id)),
};
