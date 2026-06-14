import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta } from '@/types';

// ─── Account ────────────────────────────────────────────────────────────────

export type FinanceAccountType = 'Bank' | 'Cash' | 'E-Wallet';
export const ACCOUNT_TYPES: FinanceAccountType[] = ['Bank', 'Cash', 'E-Wallet'];

export interface FinanceAccount {
  id: string;
  school_id: string;
  name: string;
  account_type: string;
  opening_balance: string;
  current_balance: string;
  is_enabled: boolean;
  account_start_date: string;
  created_at: string;
}

export interface CreateAccountPayload {
  name: string;
  account_type: string;
  opening_balance?: number;
  account_start_date: string;
  is_enabled?: boolean;
}

export interface UpdateAccountPayload {
  name?: string;
  account_type?: string;
  is_enabled?: boolean;
}

// ─── Head ────────────────────────────────────────────────────────────────────

export type FinanceHeadType = 'Income' | 'Expense';
export const HEAD_TYPES: FinanceHeadType[] = ['Income', 'Expense'];

export interface FinanceHead {
  id: string;
  school_id: string;
  name: string;
  head_type: string;
  is_enabled: boolean;
  created_at: string;
}

export interface CreateHeadPayload {
  name: string;
  head_type: string;
  is_enabled?: boolean;
}

export interface UpdateHeadPayload {
  name?: string;
  head_type?: string;
  is_enabled?: boolean;
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export interface FinanceExpense {
  id: string;
  school_id: string;
  expense_head_id: string;
  from_account_id: string;
  employee_id?: string | null;
  total_amount: string;
  date_of_expense: string;
  remarks?: string | null;
  created_at: string;
  expense_head_name?: string;
  from_account_name?: string;
}

export interface CreateExpensePayload {
  expense_head_id: string;
  from_account_id: string;
  total_amount: number;
  date_of_expense: string;
  employee_id?: string;
  remarks?: string;
}

// ─── Income ──────────────────────────────────────────────────────────────────

export interface FinanceIncomeRecord {
  id: string;
  school_id: string;
  income_head_id: string;
  to_account_id: string;
  student_id?: string | null;
  amount: string;
  date_of_income: string;
  remarks?: string | null;
  created_at: string;
  income_head_name?: string;
  to_account_name?: string;
}

export interface CreateIncomePayload {
  income_head_id: string;
  to_account_id: string;
  amount: number;
  date_of_income: string;
  student_id?: string;
  remarks?: string;
}

// ─── Transfer ────────────────────────────────────────────────────────────────

export interface FinanceTransfer {
  id: string;
  school_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: string;
  date_of_transaction: string;
  remarks?: string | null;
  created_at: string;
  from_account_name?: string;
  to_account_name?: string;
}

export interface CreateTransferPayload {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  date_of_transaction: string;
  remarks?: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface StatementEntry {
  txn_date: string;
  value_date: string;
  description: string;
  debit: string | null;
  credit: string | null;
  balance: string;
  type: string;
}

export interface AccountStatement {
  account: FinanceAccount;
  opening_balance: string;
  closing_balance: string;
  current_balance: string;
  entries: StatementEntry[];
}

export interface RegisterEntry {
  id: string;
  created_at: string;
  transaction_date: string;
  head_name: string;
  head_type: string;
  account_name: string;
  amount: string;
  payee_id?: string | null;
  remarks?: string | null;
  type: 'income' | 'expense';
}

export interface ProfitLossSummary {
  total_income: string;
  total_expense: string;
  net_profit: string;
  income_heads: { head_name: string; amount: string }[];
  expense_heads: { head_name: string; amount: string }[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const FinanceService = {
  // Accounts
  async listAccounts(params: Record<string, unknown> = {}): Promise<{ items: FinanceAccount[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<FinanceAccount[]>(ENDPOINTS.financeAccounts.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },
  async createAccount(payload: CreateAccountPayload): Promise<FinanceAccount> {
    const res = await apiGateway.post<FinanceAccount>(ENDPOINTS.financeAccounts.list, payload);
    return res.data;
  },
  async updateAccount(id: string, payload: UpdateAccountPayload): Promise<FinanceAccount> {
    const res = await apiGateway.patch<FinanceAccount>(ENDPOINTS.financeAccounts.byId(id), payload);
    return res.data;
  },
  async deleteAccount(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.financeAccounts.byId(id));
  },

  // Heads
  async listHeads(params: Record<string, unknown> = {}): Promise<{ items: FinanceHead[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<FinanceHead[]>(ENDPOINTS.financeHeads.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },
  async createHead(payload: CreateHeadPayload): Promise<FinanceHead> {
    const res = await apiGateway.post<FinanceHead>(ENDPOINTS.financeHeads.list, payload);
    return res.data;
  },
  async updateHead(id: string, payload: UpdateHeadPayload): Promise<FinanceHead> {
    const res = await apiGateway.patch<FinanceHead>(ENDPOINTS.financeHeads.byId(id), payload);
    return res.data;
  },
  async deleteHead(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.financeHeads.byId(id));
  },

  // Expenses
  async listExpenses(params: Record<string, unknown> = {}): Promise<{ items: FinanceExpense[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<FinanceExpense[]>(ENDPOINTS.financeExpenses.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },
  async createExpense(payload: CreateExpensePayload): Promise<FinanceExpense> {
    const res = await apiGateway.post<FinanceExpense>(ENDPOINTS.financeExpenses.list, payload);
    return res.data;
  },
  async deleteExpense(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.financeExpenses.byId(id));
  },

  // Income
  async listIncome(params: Record<string, unknown> = {}): Promise<{ items: FinanceIncomeRecord[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<FinanceIncomeRecord[]>(ENDPOINTS.financeIncome.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },
  async createIncome(payload: CreateIncomePayload): Promise<FinanceIncomeRecord> {
    const res = await apiGateway.post<FinanceIncomeRecord>(ENDPOINTS.financeIncome.list, payload);
    return res.data;
  },
  async deleteIncome(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.financeIncome.byId(id));
  },

  // Transfers
  async listTransfers(params: Record<string, unknown> = {}): Promise<{ items: FinanceTransfer[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<FinanceTransfer[]>(ENDPOINTS.financeTransfers.list, { params });
    return { items: res.data, pagination: res.pagination! };
  },
  async createTransfer(payload: CreateTransferPayload): Promise<FinanceTransfer> {
    const res = await apiGateway.post<FinanceTransfer>(ENDPOINTS.financeTransfers.list, payload);
    return res.data;
  },
  async deleteTransfer(id: string): Promise<void> {
    await apiGateway.delete(ENDPOINTS.financeTransfers.byId(id));
  },

  // Reports
  async getStatement(params: { account_id: string; start_date: string; end_date: string }): Promise<AccountStatement> {
    const res = await apiGateway.get<AccountStatement>(ENDPOINTS.financeReports.statement, { params });
    return res.data;
  },
  async getRegister(params: { start_date?: string; end_date?: string; account_id?: string; head_type?: string }): Promise<RegisterEntry[]> {
    const res = await apiGateway.get<RegisterEntry[]>(ENDPOINTS.financeReports.register, { params });
    return res.data;
  },
  async getProfitLoss(params: { start_date: string; end_date: string }): Promise<ProfitLossSummary> {
    const res = await apiGateway.get<ProfitLossSummary>(ENDPOINTS.financeReports.profitLoss, { params });
    return res.data;
  },
};
