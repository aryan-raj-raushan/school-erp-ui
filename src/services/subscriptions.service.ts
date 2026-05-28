import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { Subscription, PaginationMeta, PlanType } from '@/types';

export interface SubscriptionFilters {
  page?: number;
  limit?: number;
  school_id?: string;
  status?: string;
}

export interface CreateSubscriptionPayload {
  school_id: string;
  plan_name: string;
  plan_type: PlanType;
  amount: number;
  currency?: string;
  max_students?: number;
  max_staff?: number;
  start_date?: string;
  end_date?: string;
  is_trial?: boolean;
  auto_renew?: boolean;
}

export interface UpdateSubscriptionPayload extends Partial<CreateSubscriptionPayload> {}

export const SubscriptionsService = {
  async list(filters: SubscriptionFilters = {}): Promise<{ items: Subscription[]; pagination: PaginationMeta }> {
    const res = await apiGateway.get<Subscription[]>(ENDPOINTS.subscriptions.list, { params: filters });
    return { items: res.data, pagination: res.pagination! };
  },

  async getMy(): Promise<Subscription | null> {
    try {
      const res = await apiGateway.get<Subscription>(ENDPOINTS.subscriptions.my);
      return res.data;
    } catch {
      return null;
    }
  },

  async getById(id: string): Promise<Subscription> {
    const res = await apiGateway.get<Subscription>(ENDPOINTS.subscriptions.byId(id));
    return res.data;
  },

  async create(payload: CreateSubscriptionPayload): Promise<Subscription> {
    const res = await apiGateway.post<Subscription>(ENDPOINTS.subscriptions.list, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateSubscriptionPayload): Promise<Subscription> {
    const res = await apiGateway.patch<Subscription>(ENDPOINTS.subscriptions.byId(id), payload);
    return res.data;
  },

  async cancel(id: string, reason?: string): Promise<Subscription> {
    const res = await apiGateway.post<Subscription>(ENDPOINTS.subscriptions.cancel(id), { cancellation_reason: reason });
    return res.data;
  },
};
