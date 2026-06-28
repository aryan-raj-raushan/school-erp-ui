'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { NotificationRulesService } from '@/services/notification-rules.service';
import type { NotificationRule, NotificationEvent } from '@/types';

export function useNotificationRules() {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingEvent, setSavingEvent] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await NotificationRulesService.list();
      setRules(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load rules');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateRule = useCallback(async (eventType: NotificationEvent, patch: Partial<NotificationRule>) => {
    setSavingEvent(eventType);
    try {
      const updated = await NotificationRulesService.upsert({ event_type: eventType, ...patch });
      setRules(prev => {
        const idx = prev.findIndex(r => r.event_type === eventType);
        if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
        return [...prev, updated];
      });
      toast.success('Saved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSavingEvent(null);
    }
  }, []);

  return { rules, isLoading, savingEvent, fetch, updateRule };
}
