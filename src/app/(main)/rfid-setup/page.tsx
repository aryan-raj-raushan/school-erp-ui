"use client";

import { useState } from "react";
import { Copy, Wifi } from "lucide-react";
import { Div } from "@/components/ui/layout";
import { H1, H3, P } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormCard, WarnBanner } from "@/components/ui/form-card";
import { useRfidEvents } from "@/hooks/useRfidEvents";

export default function RfidSetupPage() {
  const { events, connected, webhookUrl } = useRfidEvents();
  const [copied, setCopied] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Div type="col" gap="lg">
      <Div type="col" gap="xs">
        <H1>RFID Webhook Setup</H1>
        <P color="muted">Configure the RFID card reader to push scan events to this server.</P>
      </Div>

      <FormCard title="Set Service Url">
        <Div type="col" gap="md">
          <P color="muted">
            Open your RFID reader's admin page (<code>http://192.168.1.23/admin_action_page</code>),
            select <strong>Https Url</strong>, and paste the URL below into <strong>Enter server url</strong>.
          </P>

          <Div type="row" gap="sm" align="center">
            <Input value={webhookUrl} readOnly />
            <Button size="icon-sm" variant="outline" onClick={copyUrl}>
              <Copy size={14} />
            </Button>
          </Div>

          {copied && <P size="xs" color="muted">Copied.</P>}

          <WarnBanner>
            Device sends: <code>{"{ \"ses\": [{ \"r\": \"<card_id>\", \"d\": \"<device_id>\", \"t1\": <unix_ts> }] }"}</code>
          </WarnBanner>
        </Div>
      </FormCard>

      <FormCard title="Live Card Taps">
        <Div type="col" gap="sm">
          <Div type="row" align="center" gap="sm">
            <Wifi size={14} className={connected ? "text-emerald-500" : "text-muted-foreground"} />
            <P size="xs" color={connected ? "default" : "muted"}>
              {connected ? "Connected — waiting for taps" : "Connecting…"}
            </P>
          </Div>

          {events.length === 0 ? (
            <P color="muted">No taps received yet.</P>
          ) : (
            <Div type="col" gap="sm">
              {events.map((event, i) => (
                <Div key={i} className="rounded-lg border border-border/50 p-3">
                  <Div type="row" justify="between">
                    <H3 color="default">{event.r}</H3>
                    <P size="xs" color="muted">{new Date(event.receivedAt).toLocaleString()}</P>
                  </Div>
                  <P size="xs" color="muted">Device: {event.d}</P>
                </Div>
              ))}
            </Div>
          )}
        </Div>
      </FormCard>
    </Div>
  );
}
