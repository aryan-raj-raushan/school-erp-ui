'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { RfidService, type RfidScanEvent, type PersonResult } from '@/services/rfid.service';

export function useRfidEvents() {
  const [events, setEvents] = useState<RfidScanEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults] = useState<PersonResult[]>([]);

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
  }, [fetchEvents]);

  const assignCard = useCallback(async (rfidCardId: string, personType: 'staff' | 'student', personId: string) => {
    await RfidService.assignCard(rfidCardId, personType, personId);
    toast.success('RFID card assigned');
    await fetchEvents();
  }, [fetchEvents]);

  const unassignCard = useCallback(async (personType: 'staff' | 'student', personId: string) => {
    await RfidService.unassignCard(personType, personId);
    toast.success('RFID card unassigned');
    await fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, refetch: fetchEvents, searchResults, assignCard, unassignCard };
}
