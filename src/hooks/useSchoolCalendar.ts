'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CalendarService } from '@/services/calendar.service';
import type { CalendarEvent } from '@/types';

function monthRange(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const last = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${last}`;
  return { from, to };
}

export function useSchoolCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const { from, to } = monthRange(year, month);
    try {
      const data = await CalendarService.getUnified(from, to);
      setEvents(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load calendar');
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  const prevMonth = useCallback(() => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }, [month]);

  return { year, month, events, isLoading, fetch, prevMonth, nextMonth, setYear, setMonth };
}
