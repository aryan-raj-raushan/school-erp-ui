"use client";

import { Div, H1, P, Badge, Button, Spinner, EmptyState } from "@/components/ui";
import { Megaphone } from "lucide-react";
import { useParentNotices } from "@/hooks/useParentNotices";

export default function ParentNoticesPage() {
  const { items, isLoading, error, markRead, markAllRead } = useParentNotices();
  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <Div type="col" gap="lg" className="p-4 sm:p-6">
      <Div type="row" justify="between" align="center">
        <H1 className="text-2xl font-bold">Notices</H1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead()}>
            Mark all read
          </Button>
        )}
      </Div>

      {isLoading ? (
        <Div type="row" align="center" justify="center" className="py-16"><Spinner /></Div>
      ) : error ? (
        <Badge variant="danger">{error}</Badge>
      ) : items.length === 0 ? (
        <EmptyState icon={<Megaphone size={28} />} title="No notices yet" />
      ) : (
        <Div type="col" gap="sm">
          {items.map((n) => (
            <Div
              key={n.id}
              type="col"
              gap="xs"
              className={`rounded-xl border p-4 cursor-pointer ${n.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <Div type="row" justify="between" align="center">
                <P className="font-semibold">{n.title}</P>
                {!n.is_read && <Badge variant="primary">New</Badge>}
              </Div>
              <P color="muted" className="text-sm">{n.message}</P>
              <P color="muted" className="text-xs">{new Date(n.created_at).toLocaleString("en-IN")}</P>
            </Div>
          ))}
        </Div>
      )}
    </Div>
  );
}
