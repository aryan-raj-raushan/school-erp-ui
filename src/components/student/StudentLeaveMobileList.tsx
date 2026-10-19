"use client";

import { CalendarDays } from "lucide-react";
import {
  Badge,
  EmptyState,
  FloatingActionButton,
  ListAvatar,
  MobileListCard,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { LEAVE_STATUS_BADGE } from "@/constants/leave.constants";
import type { StudentLeaveRequest } from "@/types";

export interface StudentLeaveMobileListProps {
  requests: StudentLeaveRequest[];
  onReview: (request: StudentLeaveRequest) => void;
  onApply: () => void;
}

function periodLabel(request: StudentLeaveRequest) {
  const days = `${request.total_days} ${request.total_days === 1 ? "day" : "days"}`;
  const from = formatDate(request.from_date);
  const to = formatDate(request.to_date);
  return from === to ? `${from} · ${days}` : `${from} → ${to} · ${days}`;
}

/** Card list of student leave requests; pending ones open the review sheet on tap. */
export function StudentLeaveMobileList({
  requests,
  onReview,
  onApply,
}: StudentLeaveMobileListProps) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays size={28} />}
        title="No leave requests"
        description="No student leave requests found"
        action={{ label: "Apply on behalf", onClick: onApply }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-3">
      <ul className="flex flex-col gap-2.5">
        {requests.map((request) => {
          const name = request.student_name ?? request.student_id;
          const isPending = request.status === "PENDING";
          return (
            <li key={request.id}>
              <MobileListCard
                leading={<ListAvatar name={name} size={44} />}
                title={name}
                subtitle={periodLabel(request)}
                badge={
                  <Badge variant={LEAVE_STATUS_BADGE[request.status]}>
                    {request.status}
                  </Badge>
                }
                footer={
                  <p className="mt-1 line-clamp-2 text-[13px]">
                    {request.reason}
                  </p>
                }
                onClick={isPending ? () => onReview(request) : undefined}
              />
              {isPending && (
                <p className="px-2 pt-1 text-[11px] text-muted-foreground">
                  Tap to review
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <FloatingActionButton label="Apply on behalf" onClick={onApply} />
    </div>
  );
}
