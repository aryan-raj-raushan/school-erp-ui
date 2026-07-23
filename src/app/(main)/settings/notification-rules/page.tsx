"use client";

import { useNotificationRules } from "@/hooks/useNotificationRules";
import {
  PageCol,
  PageHeader,
  Div,
  Button,
  Badge,
  DataTable,
  Spinner,
  P,
  type ColumnDef,
  PageHeaderConfig,
} from "@/components/ui";
import type { NotificationRule, NotificationEvent } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

const ALL_EVENTS: NotificationEvent[] = [
  "ABSENT",
  "LATE",
  "HOLIDAY",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",
  "EARLY_EXIT",
  "MISSING_PUNCH",
  "GATE_PASS_APPROVED",
];

export default function NotificationRulesPage() {
  const isMobile = useIsMobile();
  const { rules, isLoading, savingEvent, updateRule } = useNotificationRules();

  const findRule = (evt: NotificationEvent): Partial<NotificationRule> =>
    rules.find((r) => r.event_type === evt) ?? {};

  const columns: ColumnDef<{ event: NotificationEvent }>[] = [
    { header: "Event", accessorKey: "event" },
    {
      header: "Parent",
      id: "parent",
      cell: ({ row }) => {
        const rule = findRule(row.original.event);
        return (
          <Button
            size="sm"
            variant={rule.notify_parent ? "default" : "outline"}
            loading={savingEvent === row.original.event}
            onClick={() =>
              updateRule(row.original.event, {
                notify_parent: !rule.notify_parent,
              })
            }
          >
            {rule.notify_parent ? "ON" : "OFF"}
          </Button>
        );
      },
    },
    {
      header: "Student",
      id: "student",
      cell: ({ row }) => {
        const rule = findRule(row.original.event);
        return (
          <Button
            size="sm"
            variant={rule.notify_student ? "default" : "outline"}
            loading={savingEvent === row.original.event}
            onClick={() =>
              updateRule(row.original.event, {
                notify_student: !rule.notify_student,
              })
            }
          >
            {rule.notify_student ? "ON" : "OFF"}
          </Button>
        );
      },
    },
    {
      header: "Teacher",
      id: "teacher",
      cell: ({ row }) => {
        const rule = findRule(row.original.event);
        return (
          <Button
            size="sm"
            variant={rule.notify_teacher ? "default" : "outline"}
            loading={savingEvent === row.original.event}
            onClick={() =>
              updateRule(row.original.event, {
                notify_teacher: !rule.notify_teacher,
              })
            }
          >
            {rule.notify_teacher ? "ON" : "OFF"}
          </Button>
        );
      },
    },
    {
      header: "Channel",
      id: "channel",
      cell: ({ row }) => {
        const rule = findRule(row.original.event);
        return <Badge variant="info">{rule.channel ?? "—"}</Badge>;
      },
    },
    {
      header: "Active",
      id: "active",
      cell: ({ row }) => {
        const rule = findRule(row.original.event);
        return (
          <Button
            size="sm"
            variant={rule.is_active ? "default" : "outline"}
            loading={savingEvent === row.original.event}
            onClick={() =>
              updateRule(row.original.event, { is_active: !rule.is_active })
            }
          >
            {rule.is_active ? "Active" : "Inactive"}
          </Button>
        );
      },
    },
  ];

  const tableData = ALL_EVENTS.map((event) => ({ event }));

  const pageHeaderConfig: PageHeaderConfig = {
    title: "Notification Rules",
    subtitle: "Configure when and how notifications are sent",
    backButton: isMobile,
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      {isLoading ? (
        <Spinner />
      ) : (
        <DataTable columns={columns} data={tableData} />
      )}

      <P>Changes are saved immediately on toggle.</P>
    </PageCol>
  );
}
