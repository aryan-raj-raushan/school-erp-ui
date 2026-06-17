'use client';

import { useState, useEffect } from 'react';
import { RfidService, type RfidScanEvent } from '@/services/rfid.service';

export function useRfidEvents() {
  const [events, setEvents] = useState<RfidScanEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const close = RfidService.openEventStream(
      (scan) => setEvents((prev) => [scan, ...prev].slice(0, 100)),
      () => setConnected(true),
      () => setConnected(false),
    );
    return close;
  }, []);

  return { events, connected, webhookUrl: RfidService.webhookUrl() };
}
