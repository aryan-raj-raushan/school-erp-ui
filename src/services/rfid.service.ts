import { ENDPOINTS } from '@/lib/api-gateway/endpoints';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export type RfidScanEvent = {
  r: string;
  d: string;
  t1: number;
  receivedAt: string;
};

export const RfidService = {
  webhookUrl(): string {
    return `${BASE_URL}${ENDPOINTS.rfid.webhook}`;
  },

  openEventStream(
    onEvent: (scan: RfidScanEvent) => void,
    onConnect: () => void,
    onDisconnect: () => void,
  ): () => void {
    const es = new EventSource(`${BASE_URL}${ENDPOINTS.rfid.events}`);

    es.onopen = onConnect;
    es.onerror = onDisconnect;
    es.onmessage = (e) => {
      try {
        onEvent(JSON.parse(e.data) as RfidScanEvent);
      } catch {}
    };

    return () => es.close();
  },
};
