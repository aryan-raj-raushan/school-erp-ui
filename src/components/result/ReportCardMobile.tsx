"use client";

import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  DetailField,
  DetailGrid,
  DetailHero,
  DetailSection,
  StickyActionBar,
} from "@/components/ui";
import { openExternal } from "@/lib/external-link";
import { formatDate } from "@/lib/utils";
import { EXAM_TERM_LABELS, REPORT_CARD_PAGE } from "@/constants/result.constants";
import type { ReportCardItem } from "@/types/result.types";

export interface ReportCardMobileProps {
  reportCard: ReportCardItem;
  isPublishing: boolean;
  onPublish: (publish: boolean) => void;
}

function ScoreTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-3 dark:bg-neutral-900">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-xl font-bold ${accent ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * Phone view of a report card: identity header, score tiles, details and a
 * pinned publish bar. The PDF opens in the in-app browser — embedded PDF
 * frames don't render in mobile WebViews.
 */
export function ReportCardMobile({ reportCard, isPublishing, onPublish }: ReportCardMobileProps) {
  const term = reportCard.exam_term
    ? (EXAM_TERM_LABELS[reportCard.exam_term] ?? reportCard.exam_term)
    : null;
  const statusVariant = REPORT_CARD_PAGE.statusBadge[reportCard.status] ?? "default";

  return (
    <div className="flex flex-col gap-3 pt-3">
      <DetailHero
        name={reportCard.student_name}
        subtitle={[reportCard.exam_name, term].filter(Boolean).join(" · ")}
        meta={[reportCard.class_name, reportCard.section_name].filter(Boolean).join(" - ")}
        badge={
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={statusVariant}>{reportCard.status}</Badge>
            <Badge variant={reportCard.is_published ? "success" : "default"}>
              {reportCard.is_published ? "Published" : "Draft"}
            </Badge>
          </div>
        }
        actions={[
          {
            label: "Open PDF",
            icon: <ExternalLink size={18} />,
            onClick: () => void openExternal(reportCard.pdf_url ?? ""),
            hidden: !reportCard.pdf_url,
          },
        ]}
      />

      <section className="grid grid-cols-2 gap-2.5">
        <ScoreTile label="Total marks" value={String(reportCard.total_marks ?? "—")} />
        <ScoreTile label="Marks obtained" value={String(reportCard.marks_obtained ?? "—")} accent />
        <ScoreTile
          label="Percentage"
          value={reportCard.percentage ? `${reportCard.percentage}%` : "—"}
        />
        <ScoreTile label="Grade" value={String(reportCard.grade ?? "—")} />
        <ScoreTile label="Class rank" value={String(reportCard.rank ?? "—")} />
      </section>

      <DetailSection title="Student">
        <DetailGrid>
          <DetailField label="Name" value={reportCard.student_name} wide />
          <DetailField label="Roll no." value={reportCard.roll_number} />
          <DetailField label="Class" value={reportCard.class_name} />
          <DetailField label="Section" value={reportCard.section_name} />
          <DetailField label="Academic year" value={reportCard.academic_year_name} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Exam" defaultOpen={false}>
        <DetailGrid>
          <DetailField label="Exam" value={reportCard.exam_name} wide />
          <DetailField label="Term" value={term} />
          <DetailField label="Generated" value={formatDate(reportCard.created_at)} />
        </DetailGrid>
      </DetailSection>

      {reportCard.status === "FAILED" && (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          PDF generation failed. Please try regenerating the report card.
        </p>
      )}

      <StickyActionBar>
        {reportCard.is_published ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            loading={isPublishing}
            onClick={() => onPublish(false)}
          >
            <XCircle size={18} /> Unpublish
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="flex-1"
            loading={isPublishing}
            disabled={reportCard.status !== "GENERATED"}
            onClick={() => onPublish(true)}
          >
            <CheckCircle2 size={18} /> Publish
          </Button>
        )}
      </StickyActionBar>
    </div>
  );
}
