'use client';

import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { useReportCardDetail, useReportCards } from '@/hooks/result/useReportCards';
import {
  Div,
  H1,
  H2,
  H3,
  P,
  Button,
  Badge,
  Spinner,
  InfoRow,
} from '@/components/ui';
import {
  REPORT_CARD_PAGE,
  EXAM_TERM_LABELS,
} from '@/constants/result.constants';

export default function ReportCardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') ?? slug;

  const { reportCard, isLoading } = useReportCardDetail(queryId);
  const { publishReportCards, removeReportCard, isPublishing } = useReportCards();

  if (isLoading) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  if (!reportCard) {
    return (
      <Div type="col" gap="md" align="center" className="py-32">
        <FileText size={40} className="text-muted-foreground/40" />
        <P color="muted">Report card not found.</P>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Go Back
        </Button>
      </Div>
    );
  }

  const statusVariant = REPORT_CARD_PAGE.statusBadge[reportCard.status] ?? 'default';

  return (
    <Div type="col" gap="lg" className="max-w-4xl">
      {/* Header */}
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} /> {REPORT_CARD_PAGE.buttons.back}
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <Div type="row" align="center" gap="sm">
            <H1>{reportCard.student_name}</H1>
            <Badge variant={statusVariant}>{reportCard.status}</Badge>
            {reportCard.is_published ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <Badge variant="default">Draft</Badge>
            )}
          </Div>
          <P color="muted">
            {reportCard.exam_name}
            {reportCard.exam_term
              ? ` · ${EXAM_TERM_LABELS[reportCard.exam_term] ?? reportCard.exam_term}`
              : ''}
          </P>
        </Div>

        {/* Actions */}
        <Div type="row" gap="sm">
          {reportCard.pdf_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(reportCard.pdf_url!, '_blank')}
            >
              <ExternalLink size={14} />
              {REPORT_CARD_PAGE.buttons.viewPdf}
            </Button>
          )}
          {reportCard.is_published ? (
            <Button
              variant="outline"
              size="sm"
              loading={isPublishing}
              onClick={() =>
                publishReportCards(
                  reportCard.exam_id ?? '',
                  false,
                  { studentId: reportCard.student_id },
                )
              }
            >
              <XCircle size={14} />
              Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              loading={isPublishing}
              disabled={reportCard.status !== 'GENERATED'}
              onClick={() =>
                publishReportCards(
                  reportCard.exam_id ?? '',
                  true,
                  { studentId: reportCard.student_id },
                )
              }
            >
              <CheckCircle2 size={14} />
              Publish
            </Button>
          )}
        </Div>
      </Div>

      {/* Details */}
      <Div type="grid" cols={2} gap="lg">
        {/* Student Info */}
        <Div className="rounded-xl border border-border bg-card p-5" type="col" gap="sm">
          <H3 className="text-xs font-semibold uppercase tracking-wider mb-2">
            Student Information
          </H3>
          <InfoRow label="Name" value={reportCard.student_name} />
          <InfoRow label="Roll No." value={reportCard.roll_number ?? '—'} />
          <InfoRow label="Class" value={reportCard.class_name ?? '—'} />
          <InfoRow label="Section" value={reportCard.section_name ?? '—'} />
          <InfoRow label="Academic Year" value={reportCard.academic_year_name ?? '—'} />
        </Div>

        {/* Exam Info */}
        <Div className="rounded-xl border border-border bg-card p-5" type="col" gap="sm">
          <H3 className="text-xs font-semibold uppercase tracking-wider mb-2">
            Exam Information
          </H3>
          <InfoRow label="Exam" value={reportCard.exam_name ?? '—'} />
          <InfoRow
            label="Term"
            value={
              reportCard.exam_term
                ? (EXAM_TERM_LABELS[reportCard.exam_term] ?? reportCard.exam_term)
                : '—'
            }
          />
          <InfoRow
            label="Generated On"
            value={new Date(reportCard.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          />
        </Div>
      </Div>

      {/* Score Summary */}
      <Div className="rounded-xl border border-border bg-card p-5" type="col" gap="md">
        <H3 className="text-xs font-semibold uppercase tracking-wider">
          Score Summary
        </H3>
        <Div type="grid" cols={4} gap="md">
          <Div color="default">
            <P color="muted" className="text-xs mb-1">Total Marks</P>
            <H2>{reportCard.total_marks ?? '—'}</H2>
          </Div>
          <Div color="green">
            <P color="muted" className="text-xs mb-1">Marks Obtained</P>
            <H2>{reportCard.marks_obtained ?? '—'}</H2>
          </Div>
          <Div color="default">
            <P color="muted" className="text-xs mb-1">Percentage</P>
            <H2>{reportCard.percentage ? `${reportCard.percentage}%` : '—'}</H2>
          </Div>
          <Div color="default">
            <P color="muted" className="text-xs mb-1">Grade</P>
            <H2>{reportCard.grade ?? '—'}</H2>
          </Div>
        </Div>
        <Div type="row" gap="md" className="mt-2">
          <Div color="default" className="flex-1">
            <P color="muted" className="text-xs mb-1">Class Rank</P>
            <H2>{reportCard.rank ?? '—'}</H2>
          </Div>
          <Div className="flex-1" />
          <Div className="flex-1" />
          <Div className="flex-1" />
        </Div>
      </Div>

      {/* PDF Preview */}
      {reportCard.pdf_url && (
        <Div className="rounded-xl border border-border bg-card p-5" type="col" gap="md">
          <Div type="row" justify="between" align="center">
            <H3 className="text-xs font-semibold uppercase tracking-wider">
              Report Card PDF
            </H3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(reportCard.pdf_url!, '_blank')}
            >
              <ExternalLink size={14} />
              Open PDF
            </Button>
          </Div>
          <iframe
            src={reportCard.pdf_url}
            className="w-full rounded-lg border border-border"
            style={{ height: '600px' }}
            title="Report Card PDF"
          />
        </Div>
      )}

      {reportCard.status === 'FAILED' && (
        <Div
          type="row"
          align="center"
          gap="sm"
          className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3"
        >
          <XCircle size={16} className="text-destructive" />
          <P color="danger" className="text-sm">
            PDF generation failed. Please try regenerating the report card.
          </P>
        </Div>
      )}
    </Div>
  );
}
