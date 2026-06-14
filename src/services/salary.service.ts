import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

// ─── Salary Heads ────────────────────────────────────────────────────────────

export type SalaryHeadType = 'Earning' | 'Deduction';
export const SALARY_HEAD_TYPES: SalaryHeadType[] = ['Earning', 'Deduction'];

export interface SalaryHead {
  id: string;
  school_id: string;
  name: string;
  head_type: string;
  code: string;
  is_enabled: boolean;
  created_at: string;
}

export interface CreateSalaryHeadPayload {
  name: string;
  head_type: SalaryHeadType;
  code: string;
  is_enabled?: boolean;
}

export interface UpdateSalaryHeadPayload {
  name?: string;
  head_type?: SalaryHeadType;
  code?: string;
  is_enabled?: boolean;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export interface SalaryStructureItem {
  id: string;
  template_id: string;
  salary_head_id: string;
  default_amount: string;
  head_name: string;
  head_type: string;
  head_code: string;
}

export interface SalaryTemplate {
  id: string;
  school_id: string;
  name: string;
  is_enabled: boolean;
  created_at: string;
  items: SalaryStructureItem[];
}

export interface SalaryTemplateItemPayload {
  salary_head_id: string;
  default_amount?: number;
}

export interface CreateSalaryTemplatePayload {
  name: string;
  is_enabled?: boolean;
  items: SalaryTemplateItemPayload[];
}

export interface UpdateSalaryTemplatePayload {
  name?: string;
  is_enabled?: boolean;
  items?: SalaryTemplateItemPayload[];
}

// ─── Assignments ─────────────────────────────────────────────────────────────

export interface SalaryAssignment {
  id: string;
  school_id: string;
  employee_id: string;
  template_id: string;
  effective_from: string;
  remarks?: string | null;
  is_active: boolean;
  created_at: string;
  template_name: string;
  items: SalaryStructureItem[];
}

export interface AssignSalaryPayload {
  employee_id: string;
  template_id: string;
  effective_from: string;
  remarks?: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type SalaryPaymentMode = 'CASH' | 'BANK' | 'CHEQUE' | 'UPI';
export const SALARY_PAYMENT_MODES: SalaryPaymentMode[] = ['CASH', 'BANK', 'CHEQUE', 'UPI'];
export type SalaryTransactionStatus = 'PENDING' | 'PROCESSED' | 'PAID';

export interface SalaryTransaction {
  id: string;
  school_id: string;
  employee_id: string;
  salary_month: string;
  total_amount: string;
  deduction_amount: string;
  payment_mode: string;
  payment_release_date: string;
  from_account_id?: string | null;
  expense_head_id?: string | null;
  remarks?: string | null;
  status: SalaryTransactionStatus;
  created_at: string;
  from_account_name?: string | null;
  expense_head_name?: string | null;
}

export interface CreateSalaryTransactionPayload {
  employee_id: string;
  salary_month: string;
  total_amount: number;
  deduction_amount?: number;
  payment_mode: SalaryPaymentMode;
  payment_release_date: string;
  from_account_id?: string;
  expense_head_id?: string;
  remarks?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const SalaryService = {
  // Heads
  async listHeads(params: Record<string, unknown> = {}): Promise<{ items: SalaryHead[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<SalaryHead[]>(ENDPOINTS.salaryHeads.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },
  async createHead(payload: CreateSalaryHeadPayload): Promise<SalaryHead> {
    const res = await apiGateway.post<SalaryHead>(ENDPOINTS.salaryHeads.list, payload);
    return res.data;
  },
  async updateHead(id: string, payload: UpdateSalaryHeadPayload): Promise<SalaryHead> {
    const res = await apiGateway.patch<SalaryHead>(ENDPOINTS.salaryHeads.byId(id), payload);
    return res.data;
  },
  async deleteHead(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.salaryHeads.byId(id));
  },

  // Templates
  async listTemplates(): Promise<SalaryTemplate[]> {
    const res = await apiGateway.get<SalaryTemplate[]>(ENDPOINTS.salaryTemplates.list);
    return res.data;
  },
  async createTemplate(payload: CreateSalaryTemplatePayload): Promise<SalaryTemplate> {
    const res = await apiGateway.post<SalaryTemplate>(ENDPOINTS.salaryTemplates.list, payload);
    return res.data;
  },
  async updateTemplate(id: string, payload: UpdateSalaryTemplatePayload): Promise<SalaryTemplate> {
    const res = await apiGateway.patch<SalaryTemplate>(ENDPOINTS.salaryTemplates.byId(id), payload);
    return res.data;
  },
  async deleteTemplate(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.salaryTemplates.byId(id));
  },

  // Assignments
  async listAssignments(): Promise<SalaryAssignment[]> {
    const res = await apiGateway.get<SalaryAssignment[]>(ENDPOINTS.salaryAssignments.list);
    return res.data;
  },
  async listAssignmentsByEmployee(employeeId: string): Promise<SalaryAssignment[]> {
    const res = await apiGateway.get<SalaryAssignment[]>(ENDPOINTS.salaryAssignments.byEmployee(employeeId));
    return res.data;
  },
  async assignStructure(payload: AssignSalaryPayload): Promise<SalaryAssignment> {
    const res = await apiGateway.post<SalaryAssignment>(ENDPOINTS.salaryAssignments.list, payload);
    return res.data;
  },
  async deactivateAssignment(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.salaryAssignments.byId(id));
  },

  // Transactions
  async listTransactions(params: Record<string, unknown> = {}): Promise<{ items: SalaryTransaction[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<SalaryTransaction[]>(ENDPOINTS.salaryTransactions.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },
  async createTransaction(payload: CreateSalaryTransactionPayload): Promise<SalaryTransaction> {
    const res = await apiGateway.post<SalaryTransaction>(ENDPOINTS.salaryTransactions.list, payload);
    return res.data;
  },
  async processTransaction(id: string): Promise<SalaryTransaction> {
    const res = await apiGateway.post<SalaryTransaction>(ENDPOINTS.salaryTransactions.process(id));
    return res.data;
  },
  async deleteTransaction(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.salaryTransactions.byId(id));
  },
};
