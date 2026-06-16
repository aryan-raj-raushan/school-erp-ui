"use client";

import { useEffect, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { Div } from "@/components/ui/layout";
import { H1, H3, P } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormCard, WarnBanner } from "@/components/ui/form-card";

type RfidTapEvent = {
  receivedAt: string;
  method: "GET" | "POST";
  query: Record<string, string>;
  body: unknown;
};

export default function RfidSetupPage() {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [events, setEvents] = useState<RfidTapEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const webhookUrl = origin ? `${origin}/api/rfid/webhook` : "";

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/rfid/webhook?list=1");
      const data = await res.json();
      setEvents(data.events ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  function copyUrl() {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Div type="col" gap="lg">
      <Div type="col" gap="xs">
        <H1>RFID Webhook Setup</H1>
        <P color="muted">
          Configure the RFID card reader to send card-tap events to this server.
        </P>
      </Div>

      <FormCard title="Set Service Url">
        <Div type="col" gap="md">
          <P color="muted">
            On your RFID reader's admin page (e.g. <code>http://192.168.1.23/admin_action_page</code>),
            open <strong>Set Service Url</strong> and paste the URL below.
          </P>

          <Div type="row" gap="sm" align="center">
            <Input value={webhookUrl} readOnly placeholder="Enter server url" />
            <Button size="icon-sm" variant="outline" onClick={copyUrl}>
              <Copy size={14} />
            </Button>
          </Div>
          {copied && <P size="xs" color="muted">Copied.</P>}

          <WarnBanner>
            Payload shape from the reader is unconfirmed. Tap a card once after pasting the
            URL into the device, then check the log below to see the exact data it sends.
          </WarnBanner>
        </Div>
      </FormCard>

      <FormCard title="Recent Card Taps">
        <Div type="col" gap="sm">
          <Div type="row" justify="between" align="center">
            <P color="muted">Last {events.length} event(s) received on the webhook.</P>
            <Button size="icon-xs" variant="ghost" onClick={fetchEvents} loading={loading}>
              <RefreshCw size={14} />
            </Button>
          </Div>

          {events.length === 0 ? (
            <P color="muted">No taps received yet.</P>
          ) : (
            <Div type="col" gap="sm">
              {events.map((event, i) => (
                <Div key={i} className="rounded-lg border border-border/50 p-3">
                  <Div type="row" justify="between">
                    <H3 color="default">{event.method}</H3>
                    <P size="xs" color="muted">{event.receivedAt}</P>
                  </Div>
                  <pre className="mt-2 overflow-x-auto text-xs">
                    {JSON.stringify({ query: event.query, body: event.body }, null, 2)}
                  </pre>
                </Div>
              ))}
            </Div>
          )}
        </Div>
      </FormCard>
    </Div>
  );
}
