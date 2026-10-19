"use client";

import { Badge, DetailSection, ToggleRow } from "@/components/ui";
import type { NotificationEvent, NotificationRule } from "@/types";

type RulePatch = Partial<
  Pick<NotificationRule, "notify_parent" | "notify_student" | "notify_teacher" | "is_active">
>;

export interface NotificationRulesMobileProps {
  events: ReadonlyArray<NotificationEvent>;
  rules: ReadonlyArray<NotificationRule>;
  savingEvent: string | null;
  onUpdate: (event: NotificationEvent, patch: RulePatch) => void;
}

function eventLabel(event: NotificationEvent) {
  const words = event.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** One collapsible card per event; each switch saves immediately, like the desktop table. */
export function NotificationRulesMobile({
  events,
  rules,
  savingEvent,
  onUpdate,
}: NotificationRulesMobileProps) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      {events.map((event) => {
        const rule = rules.find((r) => r.event_type === event);
        const disabled = savingEvent === event;
        return (
          <DetailSection
            key={event}
            title={eventLabel(event)}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-3">
              {rule?.channel && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Channel <Badge variant="info">{rule.channel}</Badge>
                </div>
              )}
              <ToggleRow
                label="Active"
                description="Send notifications for this event"
                checked={Boolean(rule?.is_active)}
                disabled={disabled}
                onChange={(value) => onUpdate(event, { is_active: value })}
              />
              <ToggleRow
                label="Notify parent"
                checked={Boolean(rule?.notify_parent)}
                disabled={disabled}
                onChange={(value) => onUpdate(event, { notify_parent: value })}
              />
              <ToggleRow
                label="Notify student"
                checked={Boolean(rule?.notify_student)}
                disabled={disabled}
                onChange={(value) => onUpdate(event, { notify_student: value })}
              />
              <ToggleRow
                label="Notify teacher"
                checked={Boolean(rule?.notify_teacher)}
                disabled={disabled}
                onChange={(value) => onUpdate(event, { notify_teacher: value })}
              />
            </div>
          </DetailSection>
        );
      })}
      <p className="px-1 text-xs text-muted-foreground">Changes are saved immediately.</p>
    </div>
  );
}
