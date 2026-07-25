'use client';

import { useState, useEffect, useCallback } from 'react';
import { NotificationsService, NotificationItem } from '@/services/notifications.service';

export function useParentNotices() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    setIsLoading(true);
    return NotificationsService.list()
      .then((res) => setItems(res))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load notices'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await NotificationsService.markRead(id);
    } catch {
      void fetchAll();
    }
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await NotificationsService.markAllRead();
    } catch {
      void fetchAll();
    }
  }

  return { items, isLoading, error, markRead, markAllRead, refresh: fetchAll };
}
