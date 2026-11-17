"use client";

import { Fingerprint, MapPin } from "lucide-react";
import { Badge, Button, Div, P } from "@/components/ui";
import { useStaffPunchIn } from "@/hooks/useStaffPunchIn";
import { ATTENDANCE_MODE_LABEL, formatMarkedTime, mapLink } from "@/lib/attendance-mode";

export function PunchInCard() {
  const { canPunch, today, isLoading, isPunching, punchIn } = useStaffPunchIn();
  if (!canPunch || isLoading) return null;

  return (
    <Div
      type="row"
      align="center"
      justify="between"
      gap="sm"
      className="flex-wrap rounded-2xl border border-border bg-card px-4 py-3"
    >
      <Div type="row" align="center" gap="sm">
        <Div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Fingerprint size={20} />
        </Div>
        <Div type="col">
          <P className="text-sm font-semibold">My attendance today</P>
          {today ? (
            <Div type="row" align="center" gap="xs" className="flex-wrap">
              <P color="muted" className="text-xs">
                {today.mode === "APP" ? "Punched in from app" : `Marked (${ATTENDANCE_MODE_LABEL[today.mode]})`} at{" "}
                {formatMarkedTime(today.marked_at)}
              </P>
              <Badge variant={today.is_late ? "warning" : "success"}>{today.is_late ? "Late" : today.status}</Badge>
              {today.latitude && today.longitude && (
                <a
                  href={mapLink(today.latitude, today.longitude)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <MapPin size={12} /> Location
                </a>
              )}
            </Div>
          ) : (
            <P color="muted" className="text-xs">Not punched in yet — your location is recorded with the punch.</P>
          )}
        </Div>
      </Div>
      {!today && (
        <Button onClick={() => void punchIn()} loading={isPunching}>
          <Fingerprint size={16} /> Punch in
        </Button>
      )}
    </Div>
  );
}
