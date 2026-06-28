import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';
import type { NotificationRule } from '@/types';

export const NotificationRulesService = {
  async list(): Promise<NotificationRule[]> {
    const res = await apiGateway.get<NotificationRule[]>(ENDPOINTS.notificationRules.base);
    return res.data;
  },

  async upsert(rule: Partial<NotificationRule> & { event_type: string }): Promise<NotificationRule> {
    const res = await apiGateway.put<NotificationRule>(ENDPOINTS.notificationRules.base, rule);
    return res.data;
  },
};
