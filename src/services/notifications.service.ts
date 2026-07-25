import { apiGateway } from '@/lib/api-gateway/api-gateway.instance';
import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  recipient_id?: string | null;
  recipient_role?: string | null;
  is_read: boolean;
  created_at: string;
}

export const NotificationsService = {
  async list(): Promise<NotificationItem[]> {
    const res = await apiGateway.get<NotificationItem[]>(ENDPOINTS.notifications.list);
    return res.data;
  },

  async markRead(id: string): Promise<void> {
    await apiGateway.patch(ENDPOINTS.notifications.markRead(id), {});
  },

  async markAllRead(): Promise<void> {
    await apiGateway.patch(ENDPOINTS.notifications.markAllRead, {});
  },
};
