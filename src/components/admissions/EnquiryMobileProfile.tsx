"use client";

import {
  CheckCircle2,
  GraduationCap,
  History,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  User,
  Users,
  XCircle,
  ClipboardList,
} from "lucide-react";
import {
  Badge,
  Button,
  DetailField,
  DetailGrid,
  DetailHero,
  DetailSection,
  PullToRefresh,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { STATUS_BADGE } from "@/constants/admission.constants";
import { ACTION_ICON } from "./enquiry-action-icons";
import type {
  AdmissionEnquiry,
  EnquiryAction,
  EnquiryHistory,
} from "@/types/admissions.types";

export interface EnquiryMobileProfileProps {
  enquiry: AdmissionEnquiry;
  history: ReadonlyArray<EnquiryHistory>;
  yearName?: string;
  className?: string;
  sourceName?: string;
  teacherName?: string;
  /** Terminal enquiries are read-only: no follow-up actions or new history. */
  isTerminal: boolean;
  onEdit: () => void;
  onRefresh: () => Promise<unknown> | void;
  onAction: (action: EnquiryAction) => void;
  onAddEntry: () => void;
}

function timeLabel(entry: EnquiryHistory) {
  return entry.next_followup_time ? ` ${entry.next_followup_time}` : "";
}

function HistoryTimeline({ history }: { history: ReadonlyArray<EnquiryHistory> }) {
  if (history.length === 0) {
    return <p className="py-2 text-center text-sm text-muted-foreground">No history yet</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {history.map((entry) => (
        <li key={entry.id} className="flex gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            {ACTION_ICON[entry.action]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{entry.action.replace(/_/g, " ")}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(entry.created_at)}
            </p>
            {entry.action === "NEXT_FOLLOW_UP_UPDATE" && entry.next_followup_date && (
              <p className="mt-1 text-sm">
                Next follow-up: {formatDate(entry.next_followup_date)}
                {timeLabel(entry)}
              </p>
            )}
            {entry.details && <p className="mt-1 whitespace-pre-wrap text-sm">{entry.details}</p>}
            {entry.remarks && (
              <p className="mt-1 text-sm text-muted-foreground">{entry.remarks}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function EnquiryMobileProfile({
  enquiry,
  history,
  yearName,
  className,
  sourceName,
  teacherName,
  isTerminal,
  onEdit,
  onRefresh,
  onAction,
  onAddEntry,
}: EnquiryMobileProfileProps) {
  const phone = `${enquiry.dial_code}${enquiry.phone}`;
  const canAct = enquiry.status === "NEW" || enquiry.status === "FOLLOW_UP";
  const location = [enquiry.city, enquiry.state, enquiry.country].filter(Boolean).join(", ");

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="flex flex-col gap-3 pt-3">
        <DetailHero
          name={enquiry.student_name}
          subtitle={className ? `Applying for ${className}` : undefined}
          meta={`Enquiry from ${formatDate(enquiry.created_at)}`}
          badge={
            <Badge variant={STATUS_BADGE[enquiry.status]}>
              {enquiry.status.replace(/_/g, " ")}
            </Badge>
          }
          actions={[
            { label: "Call", icon: <Phone size={18} />, href: `tel:${phone}` },
            { label: "Message", icon: <MessageSquare size={18} />, href: `sms:${phone}` },
            { label: "Edit", icon: <Pencil size={18} />, onClick: onEdit },
          ]}
        />

        {canAct && (
          <section className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="h-12 flex-col gap-0.5 text-xs" onClick={() => onAction("NEXT_FOLLOW_UP_UPDATE")}>
              <RefreshCw size={16} />
              Follow-up
            </Button>
            <Button className="h-12 flex-col gap-0.5 text-xs" onClick={() => onAction("ADMISSION_CONFIRMED")}>
              <CheckCircle2 size={16} />
              Confirm
            </Button>
            <Button variant="destructive" className="h-12 flex-col gap-0.5 text-xs" onClick={() => onAction("ENQUIRY_REJECTED")}>
              <XCircle size={16} />
              Reject
            </Button>
          </section>
        )}

        <DetailSection title="Student" icon={<User size={18} />}>
          <DetailGrid>
            <DetailField label="Date of birth" value={formatDate(enquiry.date_of_birth)} />
            <DetailField label="Gender" value={enquiry.gender} />
            <DetailField label="Religion" value={enquiry.religion} />
            <DetailField label="Category" value={enquiry.category} />
            <DetailField wide label="Address" value={enquiry.student_current_address} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Parents" icon={<Users size={18} />}>
          <DetailGrid>
            <DetailField label="Father" value={enquiry.father_name} />
            <DetailField label="Mother" value={enquiry.mother_name} />
            <DetailField label="Phone" value={`${enquiry.dial_code} ${enquiry.phone}`} />
            <DetailField label="Email" value={enquiry.email} />
            <DetailField label="Father occupation" value={enquiry.father_occupation} />
            <DetailField label="Mother occupation" value={enquiry.mother_occupation} />
            <DetailField wide label="City / State" value={location} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Admission" icon={<GraduationCap size={18} />}>
          <DetailGrid>
            <DetailField label="Applying year" value={yearName} />
            <DetailField label="Applying class" value={className} />
            <DetailField label="Previous school" value={enquiry.previous_school_name} />
            <DetailField label="Previous class" value={enquiry.previous_class} />
            <DetailField
              label="Registration fee"
              value={enquiry.registration_fee_required ? "Required" : "Not required"}
            />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Enquiry" icon={<ClipboardList size={18} />}>
          <DetailGrid>
            <DetailField label="Source" value={sourceName} />
            <DetailField label="Assigned teacher" value={teacherName} />
            <DetailField label="Next follow-up" value={formatDate(enquiry.next_followup_date)} />
            <DetailField wide label="Remarks" value={enquiry.remarks} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="History" icon={<History size={18} />}>
          <div className="flex flex-col gap-4">
            {isTerminal && (
              <p className="text-xs text-muted-foreground">
                History is locked — this enquiry is{" "}
                {enquiry.status === "ADMISSION_CONFIRMED" ? "confirmed" : "rejected"}.
              </p>
            )}
            <HistoryTimeline history={history} />
            {!isTerminal && (
              <Button variant="outline" size="lg" onClick={onAddEntry}>
                <Plus size={18} /> Add entry
              </Button>
            )}
          </div>
        </DetailSection>
      </div>
    </PullToRefresh>
  );
}
