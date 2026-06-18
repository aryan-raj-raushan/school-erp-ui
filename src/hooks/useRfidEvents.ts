'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { RfidService, type RfidScanEvent } from '@/services/rfid.service';

const POLL_MS = 5_000;

export function useRfidEvents() {
  const [events, setEvents] = useState<RfidScanEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await RfidService.getEvents();
      setEvents(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch RFID events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, isLoading, webhookUrl: RfidService.webhookUrl(), refetch: fetchEvents };
}
