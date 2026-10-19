"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Pencil,
  Phone,
  Send,
  Trash2,
  UserCheck,
  UserCog,
  UserX,
  Eye,
} from "lucide-react";
import {
  ActionSheet,
  Badge,
  ListAvatar,
  MobileListCard,
  MobileListScreen,
} from "@/components/ui";
import { useStaffInfinite } from "@/hooks/useStaffInfinite";
import { useStaffFilterConfig } from "@/hooks/useStaffFilterConfig";
import { getStaffRoleLabel } from "@/hooks/useStaffDetail";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES, STAFF_PAGE } from "@/constants";
import type { StaffFilters } from "@/services/staff.service";
import { Role, type Staff } from "@/types";

function fullName(staff: Staff) {
  return `${staff.first_name} ${staff.last_name ?? ""}`.trim();
}

export function StaffMobileList() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === Role.SCHOOL_ADMIN || String(user?.role) === "PRINCIPAL";
  const [actionTarget, setActionTarget] = useState<Staff | null>(null);

  const list = useStaffInfinite();
  const filterConfig = useStaffFilterConfig(list.filters, list.updateFilters);

  const roleLabel = (staff: Staff) =>
    getStaffRoleLabel(staff, filterConfig.roles) ?? "No role";

  const subtitle = (staff: Staff) =>
    [roleLabel(staff), staff.employee_code].filter(Boolean).join(" · ");

  return (
    <>
      <MobileListScreen
        filterFields={filterConfig.filterFields}
        filterValues={filterConfig.filterValues}
        onFilterChange={(next) => filterConfig.onChange(next as Partial<StaffFilters>)}
        onFilterClear={filterConfig.onClear}
        filterSheetTitle="Filter staff"
        onRefresh={list.refresh}
        countLabel={`${list.total} ${list.total === 1 ? "staff member" : "staff members"}`}
        isLoading={list.isLoading}
        isEmpty={list.items.length === 0}
        emptyIcon={<UserCog size={28} />}
        emptyTitle="No staff yet"
        emptyDescription={STAFF_PAGE.empty}
        emptyFilteredTitle="No matching staff"
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        fab={{
          label: STAFF_PAGE.addButton,
          onClick: () => router.push(ROUTES.staffNew),
          hidden: !isAdmin,
        }}
      >
        <ul className="flex flex-col gap-2.5">
          {list.items.map((staff) => (
            <li key={staff.id}>
              <MobileListCard
                leading={<ListAvatar src={staff.profile_image} name={fullName(staff)} />}
                title={fullName(staff)}
                subtitle={subtitle(staff)}
                badge={!staff.is_active ? <Badge variant="default">Inactive</Badge> : undefined}
                muted={!staff.is_active}
                onClick={() => router.push(ROUTES.staffView(staff.id))}
                onMore={() => setActionTarget(staff)}
                moreLabel={`Actions for ${fullName(staff)}`}
              />
            </li>
          ))}
        </ul>
      </MobileListScreen>

      <ActionSheet
        isOpen={actionTarget !== null}
        onClose={() => setActionTarget(null)}
        title={actionTarget ? fullName(actionTarget) : undefined}
        subtitle={actionTarget ? subtitle(actionTarget) : undefined}
        actions={
          actionTarget
            ? [
                {
                  label: "View profile",
                  icon: <Eye size={18} />,
                  onClick: () => router.push(ROUTES.staffView(actionTarget.id)),
                },
                {
                  label: "Edit",
                  icon: <Pencil size={18} />,
                  hidden: !isAdmin,
                  onClick: () => router.push(ROUTES.staffEdit(actionTarget.id)),
                },
                {
                  label: "Call",
                  icon: <Phone size={18} />,
                  hidden: !actionTarget.phone_number,
                  onClick: () => {
                    window.location.href = `tel:${actionTarget.dial_code ?? ""}${actionTarget.phone_number}`;
                  },
                },
                {
                  label: "Email",
                  icon: <Mail size={18} />,
                  hidden: !actionTarget.email,
                  onClick: () => {
                    window.location.href = `mailto:${actionTarget.email}`;
                  },
                },
                {
                  label: "Resend invite",
                  icon: <Send size={18} />,
                  hidden: !isAdmin,
                  onClick: () => void list.resendInvite(actionTarget),
                },
                {
                  label: "Offboard",
                  icon: <UserX size={18} />,
                  hidden: !isAdmin || !actionTarget.is_active,
                  confirm: {
                    title: `Offboard ${fullName(actionTarget)}?`,
                    description: "They will lose access to the system.",
                    confirmLabel: "Offboard",
                  },
                  onClick: () => void list.setActive(actionTarget, false),
                },
                {
                  label: "Re-onboard",
                  icon: <UserCheck size={18} />,
                  hidden: !isAdmin || actionTarget.is_active,
                  onClick: () => void list.setActive(actionTarget, true),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={18} />,
                  destructive: true,
                  hidden: !isAdmin,
                  confirm: {
                    title: `Delete ${fullName(actionTarget)}?`,
                    description: "This cannot be undone.",
                    confirmLabel: "Delete",
                  },
                  onClick: () => void list.deleteStaff(actionTarget),
                },
              ]
            : []
        }
      />
    </>
  );
}
