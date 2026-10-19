"use client";

import { useState } from "react";
import { MessageSquare, Phone, Trash2, Users } from "lucide-react";
import {
  ActionSheet,
  Badge,
  ListAvatar,
  MobileListCard,
  MobileListScreen,
  type FilterField,
} from "@/components/ui";
import { PARENT_RELATION_OPTIONS } from "@/constants/students.constants";
import type { GuardianRow } from "@/services/students-v2.service";

export interface ParentsMobileListProps {
  parents: GuardianRow[];
  isLoading: boolean;
  filterFields: FilterField[];
  filterValues: Record<string, string | undefined>;
  onFilterChange: (next: Record<string, string | undefined>) => void;
  onFilterClear: () => void;
  onRefresh: () => Promise<unknown> | void;
  onDelete: (id: string) => void;
}

function fullName(parent: GuardianRow) {
  return `${parent.first_name} ${parent.last_name ?? ""}`.trim();
}

function relationLabel(parent: GuardianRow) {
  return (
    PARENT_RELATION_OPTIONS.find((o) => o.value === parent.relation)?.label ??
    parent.relation
  );
}

function phoneNumber(parent: GuardianRow) {
  return parent.phone_number ? `${parent.dial_code ?? ""}${parent.phone_number}` : null;
}

export function ParentsMobileList({
  parents,
  isLoading,
  filterFields,
  filterValues,
  onFilterChange,
  onFilterClear,
  onRefresh,
  onDelete,
}: ParentsMobileListProps) {
  const [actionTarget, setActionTarget] = useState<GuardianRow | null>(null);
  const phone = actionTarget ? phoneNumber(actionTarget) : null;

  return (
    <>
      <MobileListScreen
        filterFields={filterFields}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        onFilterClear={onFilterClear}
        filterSheetTitle="Filter guardians"
        onRefresh={onRefresh}
        countLabel={`${parents.length} guardian ${parents.length === 1 ? "record" : "records"}`}
        isLoading={isLoading}
        isEmpty={parents.length === 0}
        emptyIcon={<Users size={28} />}
        emptyTitle="No guardians found"
        emptyDescription="Guardians appear here once added to a student."
        emptyFilteredTitle="No matching guardians"
      >
        <ul className="flex flex-col gap-2.5">
          {parents.map((parent) => (
            <li key={parent.id}>
              <MobileListCard
                leading={<ListAvatar name={fullName(parent)} />}
                title={fullName(parent)}
                subtitle={`${relationLabel(parent)} of ${parent.student_name}`}
                badge={parent.is_primary ? <Badge variant="success">Primary</Badge> : undefined}
                footer={
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[phoneNumber(parent), parent.can_pickup ? "Can pick up" : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                }
                onClick={() => setActionTarget(parent)}
                onMore={() => setActionTarget(parent)}
                moreLabel={`Actions for ${fullName(parent)}`}
              />
            </li>
          ))}
        </ul>
      </MobileListScreen>

      <ActionSheet
        isOpen={actionTarget !== null}
        onClose={() => setActionTarget(null)}
        title={actionTarget ? fullName(actionTarget) : undefined}
        subtitle={actionTarget ? `${relationLabel(actionTarget)} of ${actionTarget.student_name}` : undefined}
        actions={
          actionTarget
            ? [
                {
                  label: "Call",
                  icon: <Phone size={18} />,
                  hidden: !phone,
                  onClick: () => {
                    window.location.href = `tel:${phone}`;
                  },
                },
                {
                  label: "Message",
                  icon: <MessageSquare size={18} />,
                  hidden: !phone,
                  onClick: () => {
                    window.location.href = `sms:${phone}`;
                  },
                },
                {
                  label: "Remove guardian",
                  icon: <Trash2 size={18} />,
                  destructive: true,
                  confirm: {
                    title: `Remove ${fullName(actionTarget)}?`,
                    description: "They will no longer be a guardian of this student.",
                    confirmLabel: "Remove",
                  },
                  onClick: () => onDelete(actionTarget.id),
                },
              ]
            : []
        }
      />
    </>
  );
}
