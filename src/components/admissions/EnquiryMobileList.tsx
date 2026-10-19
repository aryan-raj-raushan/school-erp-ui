"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ClipboardList, Eye, Pencil, Phone, Trash2 } from "lucide-react";
import {
  ActionSheet,
  Badge,
  ListAvatar,
  MobileListCard,
  MobileListScreen,
} from "@/components/ui";
import { useAdmissionEnquiriesInfinite } from "@/hooks/useAdmissionEnquiriesInfinite";
import { useEnquiryFilterConfig } from "@/hooks/useEnquiryFilterConfig";
import { useAdmissionLookups } from "@/hooks/useAdmissions";
import {
  ADMISSION_PAGE,
  ADMISSION_ROUTES,
  STATUS_BADGE,
} from "@/constants/admission.constants";
import { getTodayDate } from "@/lib/time.utils";
import { formatDate } from "@/lib/utils";
import type {
  AdmissionEnquiry,
  AdmissionEnquiryFilters,
} from "@/types/admissions.types";

function statusLabel(status: AdmissionEnquiry["status"]) {
  return status.replace(/_/g, " ");
}

function phoneOf(enquiry: AdmissionEnquiry) {
  return `${enquiry.dial_code} ${enquiry.phone}`;
}

interface EnquiryCardProps {
  enquiry: AdmissionEnquiry;
  className?: string;
  onOpen: () => void;
  onMore: () => void;
}

function EnquiryCard({ enquiry, className, onOpen, onMore }: EnquiryCardProps) {
  const followUp = enquiry.next_followup_date
    ? `Follow-up ${formatDate(enquiry.next_followup_date)}`
    : null;

  return (
    <MobileListCard
      leading={<ListAvatar name={enquiry.student_name} />}
      title={enquiry.student_name}
      subtitle={[className, phoneOf(enquiry)].filter(Boolean).join(" · ")}
      badge={
        <Badge variant={STATUS_BADGE[enquiry.status]}>
          {statusLabel(enquiry.status)}
        </Badge>
      }
      footer={
        followUp ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock size={12} />
            {followUp}
          </p>
        ) : undefined
      }
      onClick={onOpen}
      onMore={onMore}
      moreLabel={`Actions for ${enquiry.student_name}`}
    />
  );
}

interface EnquiryActionSheetProps {
  target: AdmissionEnquiry | null;
  onClose: () => void;
  onDelete?: (enquiry: AdmissionEnquiry) => void;
}

function EnquiryActionSheet({ target, onClose, onDelete }: EnquiryActionSheetProps) {
  const router = useRouter();

  return (
    <ActionSheet
      isOpen={target !== null}
      onClose={onClose}
      title={target?.student_name}
      subtitle={target ? phoneOf(target) : undefined}
      actions={
        target
          ? [
              {
                label: "View enquiry",
                icon: <Eye size={18} />,
                onClick: () => router.push(ADMISSION_ROUTES.view(target.id)),
              },
              {
                label: "Edit",
                icon: <Pencil size={18} />,
                onClick: () => router.push(ADMISSION_ROUTES.edit(target.id)),
              },
              {
                label: "Call",
                icon: <Phone size={18} />,
                onClick: () => {
                  window.location.href = `tel:${target.dial_code}${target.phone}`;
                },
              },
              {
                label: "Delete",
                icon: <Trash2 size={18} />,
                destructive: true,
                hidden: !onDelete,
                confirm: {
                  title: `Delete enquiry for ${target.student_name}?`,
                  description: "This enquiry and its history will be removed. This cannot be undone.",
                  confirmLabel: "Delete",
                },
                onClick: () => onDelete?.(target),
              },
            ]
          : []
      }
    />
  );
}

export function EnquiryMobileList() {
  const router = useRouter();
  const [actionTarget, setActionTarget] = useState<AdmissionEnquiry | null>(null);

  const list = useAdmissionEnquiriesInfinite();
  const filterConfig = useEnquiryFilterConfig(list.filters, list.updateFilters);

  return (
    <>
      <MobileListScreen
        filterFields={filterConfig.filterFields}
        filterValues={filterConfig.filterValues}
        onFilterChange={(next) =>
          filterConfig.onChange(next as Partial<AdmissionEnquiryFilters>)
        }
        onFilterClear={filterConfig.onClear}
        filterSheetTitle="Filter enquiries"
        onRefresh={list.refresh}
        countLabel={`${list.total} ${list.total === 1 ? "enquiry" : "enquiries"}`}
        isLoading={list.isLoading}
        isEmpty={list.items.length === 0}
        emptyIcon={<ClipboardList size={28} />}
        emptyTitle="No enquiries yet"
        emptyDescription="Add your first admission enquiry to get started."
        emptyFilteredTitle="No matching enquiries"
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        fab={{
          label: ADMISSION_PAGE.buttons.addEnquiry,
          onClick: () => router.push(ADMISSION_ROUTES.createNew),
        }}
      >
        <ul className="flex flex-col gap-2.5">
          {list.items.map((enquiry) => (
            <li key={enquiry.id}>
              <EnquiryCard
                enquiry={enquiry}
                className={filterConfig.classes.find((c) => c.id === enquiry.applying_class_id)?.name}
                onOpen={() => router.push(ADMISSION_ROUTES.view(enquiry.id))}
                onMore={() => setActionTarget(enquiry)}
              />
            </li>
          ))}
        </ul>
      </MobileListScreen>

      <EnquiryActionSheet
        target={actionTarget}
        onClose={() => setActionTarget(null)}
        onDelete={(enquiry) => void list.deleteEnquiry(enquiry)}
      />
    </>
  );
}

export function FollowUpMobileList() {
  const router = useRouter();
  const [actionTarget, setActionTarget] = useState<AdmissionEnquiry | null>(null);

  const list = useAdmissionEnquiriesInfinite({ next_followup_date: getTodayDate() });
  const { classes } = useAdmissionLookups();

  return (
    <>
      <MobileListScreen
        onRefresh={list.refresh}
        countLabel={`${list.total} follow-up${list.total === 1 ? "" : "s"} today`}
        isLoading={list.isLoading}
        isEmpty={list.items.length === 0}
        emptyIcon={<CalendarClock size={28} />}
        emptyTitle="No follow-ups today"
        emptyDescription="Enquiries scheduled for follow-up today will show up here."
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
      >
        <ul className="flex flex-col gap-2.5">
          {list.items.map((enquiry) => (
            <li key={enquiry.id}>
              <EnquiryCard
                enquiry={enquiry}
                className={classes.find((c) => c.id === enquiry.applying_class_id)?.name}
                onOpen={() => router.push(ADMISSION_ROUTES.view(enquiry.id))}
                onMore={() => setActionTarget(enquiry)}
              />
            </li>
          ))}
        </ul>
      </MobileListScreen>

      <EnquiryActionSheet target={actionTarget} onClose={() => setActionTarget(null)} />
    </>
  );
}
