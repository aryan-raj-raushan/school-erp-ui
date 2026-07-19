import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { PaginationMeta, SubscriptionPlan, BillingModel, PlanType } from '@/types';

export interface SubscriptionPlanFilters {
  page?: number;
  limit?: number;
  search?: string;
  billing_model?: BillingModel;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface PaginatedSubscriptionPlans {
  items: SubscriptionPlan[];
  pagination: PaginationMeta;
}

export interface CreateSubscriptionPlanPayload {
  name: string;
  billing_model: BillingModel;
  flat_amount?: number;
  price_per_student?: number;
  billing_cycle: PlanType;
  is_active?: boolean;
}

export type UpdateSubscriptionPlanPayload = Partial<CreateSubscriptionPlanPayload>;

export const SubscriptionPlansService = {
  async list(filters: SubscriptionPlanFilters = {}): Promise<PaginatedSubscriptionPlans> {
    const res = await apiGateway.get<SubscriptionPlan[]>(ENDPOINTS.subscriptionPlans.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getById(id: string): Promise<SubscriptionPlan> {
    const res = await apiGateway.get<SubscriptionPlan>(ENDPOINTS.subscriptionPlans.byId(id));
    return res.data;
  },

  async create(payload: CreateSubscriptionPlanPayload): Promise<SubscriptionPlan> {
    const res = await apiGateway.post<SubscriptionPlan>(ENDPOINTS.subscriptionPlans.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSubscriptionPlanPayload): Promise<SubscriptionPlan> {
    const res = await apiGateway.patch<SubscriptionPlan>(ENDPOINTS.subscriptionPlans.byId(id), payload);
    return res.data;
  },
};
