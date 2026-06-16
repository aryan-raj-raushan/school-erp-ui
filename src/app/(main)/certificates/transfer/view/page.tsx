'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import {
  Div,
  H1,
  H3,
  P,
  Button,
  Badge,
  Spinner,
  InfoRow,
  Modal,
  ModalBody,
} from '@/components/ui';
import { useTransferCertificateDetail } from '@/hooks/useCertificates';
import { CERTIFICATE_PAGE, CERTIFICATE_VIEW } from '@/constants/certificate.constants';

function TransferCertificateViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? undefined;
  const [showPdf, setShowPdf] = useState(false);

  const { certificate, isLoading } = useTransferCertificateDetail(id);

  if (isLoading) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  if (!certificate) {
    return (
      <Div type="col" align="center" justify="center" className="py-32" gap="md">
        <P color="muted">Certificate not found.</P>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft size={16} /> {CERTIFICATE_VIEW.back}
        </Button>
      </Div>
    );
  }

  const studentName = [certificate.student.first_name, certificate.student.last_name]
    .filter(Boolean)
    .join(' ');

  return (
    <Div type="col" gap="lg" className="max-w-4xl">
      {/* Header */}
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} /> {CERTIFICATE_VIEW.back}
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <Div type="row" align="center" gap="sm">
            <H1>{studentName}</H1>
            <Badge variant={CERTIFICATE_PAGE.statusBadge[certificate.status]}>
              {CERTIFICATE_PAGE.status[certificate.status]}
            </Badge>
          </Div>
          <P color="muted">
            Ref: <Badge className="font-mono">{certificate.reference_no}</Badge> ·{' '}
            {new Date(certificate.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </P>
        </Div>
        <Button
          size="sm"
          onClick={() => setShowPdf(true)}
          disabled={!certificate.pdf_url}
        >
          <Download size={14} />
          {CERTIFICATE_VIEW.downloadButton}
        </Button>
      </Div>

      <Div type="grid" cols={2} gap="lg">
        {/* Student Info */}
        <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
          <H3 color="muted" className="uppercase tracking-wider text-xs font-semibold mb-2">
            {CERTIFICATE_VIEW.transfer.sections.student}
          </H3>
          <InfoRow label={CERTIFICATE_VIEW.transfer.labels.studentName} value={studentName} />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.dateOfBirth}
            value={
              certificate.student.date_of_birth
                ? new Date(certificate.student.date_of_birth).toLocaleDateString('en-IN')
                : '—'
            }
          />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.class}
            value={certificate.class?.name ?? '—'}
          />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.section}
            value={certificate.section?.name ?? '—'}
          />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.academicYear}
            value={certificate.academic_year?.name ?? '—'}
          />
        </Div>

        {/* Certificate Details */}
        <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
          <H3 color="muted" className="uppercase tracking-wider text-xs font-semibold mb-2">
            {CERTIFICATE_VIEW.transfer.sections.certificate}
          </H3>
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.qualifiedForHigher}
            value={certificate.qualified_for_higher_class}
          />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.leavingDate}
            value={certificate.leaving_date}
          />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.candidateCharacter}
            value={certificate.candidate_character}
          />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.leavingReason}
            value={certificate.leaving_reason}
          />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.feesDue}
            value={certificate.fees_due}
          />
          {certificate.extra_activities && (
            <InfoRow
              label={CERTIFICATE_VIEW.transfer.labels.extraActivities}
              value={certificate.extra_activities}
            />
          )}
        </Div>

        {/* Attendance */}
        <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
          <H3 color="muted" className="uppercase tracking-wider text-xs font-semibold mb-2">
            {CERTIFICATE_VIEW.transfer.sections.attendance}
          </H3>
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.totalWorkingDays}
            value={String(certificate.total_working_days)}
          />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.totalPresent}
            value={String(certificate.total_present)}
          />
        </Div>

        {/* Status Info */}
        <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
          <H3 color="muted" className="uppercase tracking-wider text-xs font-semibold mb-2">
            Audit
          </H3>
          <InfoRow label={CERTIFICATE_VIEW.transfer.labels.referenceNo} value={certificate.reference_no} />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.status}
            value={CERTIFICATE_PAGE.status[certificate.status]}
          />
          <InfoRow
            label={CERTIFICATE_VIEW.transfer.labels.issuedOn}
            value={new Date(certificate.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          />
        </Div>
      </Div>

      {/* PDF Modal */}
      {showPdf && (
        <Modal
          title={CERTIFICATE_VIEW.pdfModalTitle}
          size="lg"
          onClose={() => setShowPdf(false)}
        >
          <ModalBody>
            {certificate.pdf_url ? (
              <iframe
                src={certificate.pdf_url}
                className="w-full rounded"
                style={{ height: '65vh' }}
                title={`Transfer Certificate - ${studentName}`}
              />
            ) : (
              <Div type="col" align="center" justify="center" className="py-12">
                <P color="muted">{CERTIFICATE_VIEW.pdfNotAvailable}</P>
              </Div>
            )}
          </ModalBody>
        </Modal>
      )}
    </Div>
  );
}

export default function TransferCertificateViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <TransferCertificateViewContent />
    </Suspense>
  );
}