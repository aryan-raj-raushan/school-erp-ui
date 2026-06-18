"use client";

import { RefreshCw } from "lucide-react";
import { Div } from "@/components/ui/layout";
import { H1, H3, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { FormCard } from "@/components/ui/form-card";
import { useRfidEvents } from "@/hooks/useRfidEvents";

export default function RfidSetupPage() {
  const { events, isLoading, refetch } = useRfidEvents();

  return (
    <Div type="col" gap="lg">
      <H1>RFID Setup</H1>

      <FormCard title="Card Taps">
        <Div type="col" gap="sm">
          <Div type="row" justify="between" align="center">
            <P color="muted">{events.length} tap(s)</P>
            <Button size="icon-xs" variant="ghost" onClick={refetch} loading={isLoading}>
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
