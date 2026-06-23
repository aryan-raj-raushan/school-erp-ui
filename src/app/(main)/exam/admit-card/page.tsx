"use client";

import { Suspense, useEffect } from "react";
import { Download, FileText, Search } from "lucide-react";
import { useAdmitCard } from "@/hooks/exam/useExamSittingAndAdmit";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  H1,
  H2,
  H3,
  P,
  Button,
  Select,
  Input,
  Spinner,
} from "@/components/ui";
import { ADMIT_CARD_PAGE } from "@/constants/exam.constants";

// ── Admit Card Preview ────────────────────────────────────────────────────────

function AdmitCardPreview({
  data,
}: {
  data: NonNullable<ReturnType<typeof useAdmitCard>["cardData"]>;
}) {
  return (
    <Div
      variant="card"
      className="p-0 overflow-hidden border-2 border-border max-w-2xl"
    >
      {/* Card header */}
      <Div className="bg-primary px-6 py-4 text-center">
        <H2 className="text-primary-foreground text-lg font-bold">
          {data.school.name}
        </H2>
        <P className="text-primary-foreground/80 text-sm">
          {ADMIT_CARD_PAGE.preview.title}
        </P>
      </Div>

      {/* Exam info */}
      <Div className="bg-muted/50 px-6 py-3 border-b border-border text-center">
        <P color="default" className="font-semibold">
          {data.exam.name}
        </P>
        <P color="muted" className="text-xs">
          {data.exam.term} &nbsp;|&nbsp; {data.exam.startDate} –{" "}
          {data.exam.endDate}
        </P>
      </Div>

      {/* Student details */}
      <Div className="px-6 py-4">
        <Div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {[
            [ADMIT_CARD_PAGE.preview.student, data.student.name],
            [ADMIT_CARD_PAGE.preview.admissionNo, data.student.admissionNumber],
            [ADMIT_CARD_PAGE.preview.rollNo, data.student.rollNumber ?? "—"],
            [ADMIT_CARD_PAGE.preview.class, data.student.className],
            [ADMIT_CARD_PAGE.preview.section, data.student.sectionName ?? "—"],
          ].map(([label, value]) => (
            <Div key={label} type="row" justify="between" gap="sm">
              <P color="muted" className="text-xs shrink-0">
                {label}:
              </P>
              <P color="default" className="text-xs font-medium text-right">
                {value}
              </P>
            </Div>
          ))}
        </Div>
      </Div>

      {/* Timetable */}
      <Div className="px-6 pb-4">
        <P
          color="default"
          className="text-xs font-semibold uppercase tracking-wider mb-2"
        >
          {ADMIT_CARD_PAGE.preview.timetable}
        </P>
        <Div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/60 border-b border-border">
                {[
                  ADMIT_CARD_PAGE.preview.subject,
                  ADMIT_CARD_PAGE.preview.date,
                  ADMIT_CARD_PAGE.preview.time,
                  ADMIT_CARD_PAGE.preview.maxMarks,
                  ADMIT_CARD_PAGE.preview.passingMarks,
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.schedules.map((s, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 even:bg-muted/20"
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {s.subjectName}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {s.examDate}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {s.startTime} – {s.endTime}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {s.examMarks}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {s.passingMarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Div>
      </Div>

      {/* Signatures */}
      <Div
        type="row"
        justify="between"
        className="px-6 pb-6 pt-2 border-t border-border"
      >
        <Div type="col" align="center" gap="xs">
          <Div className="h-10 w-32 border-b border-foreground/30" />
          <P color="muted" className="text-xs">
            {ADMIT_CARD_PAGE.preview.principalSign}
          </P>
        </Div>
        <Div type="col" align="center" gap="xs">
          <Div className="h-10 w-32 border-b border-foreground/30" />
          <P color="muted" className="text-xs">
            {ADMIT_CARD_PAGE.preview.studentSign}
          </P>
        </Div>
      </Div>
    </Div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

function AdmitCardContent() {
  const {
    academicYearId,
    setAcademicYearId,
    examId,
    setExamId,
    studentId,
    setStudentId,
    cardData,
    isLoading,
    generate,
    getPdfUrl,
  } = useAdmitCard();

  const {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  const { exams } = useExams(
    selectedAcademicYearId ? { academic_year_id: selectedAcademicYearId, is_published: true } : {}
  );

  useEffect(() => {
    if (selectedAcademicYearId) setAcademicYearId(selectedAcademicYearId);
  }, [selectedAcademicYearId, setAcademicYearId]);

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={ADMIT_CARD_PAGE.pageHeading.title}
        subtitle={ADMIT_CARD_PAGE.pageHeading.subtitle}
      />

      <Div type="col" gap="xl" className="lg:flex-row lg:items-start">
        {/* Left panel — selectors */}
        <Div variant="card" className="p-5 lg:w-80 shrink-0">
          <Div type="col" gap="md">
            <H3 color="default">Generate Admit Card</H3>

            <Div type="col" gap="xs">
              <P color="muted" className="text-xs font-medium">
                {ADMIT_CARD_PAGE.labels.academicYear} *
              </P>
              <Select
                value={selectedAcademicYearId}
                onChange={(e) => {
                  setSelectedAcademicYearId(e.target.value);
                  setExamId("");
                }}
              >
                <option value="">Select year</option>
                {years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                    {y.is_current ? " (Current)" : ""}
                  </option>
                ))}
              </Select>
            </Div>

            <Div type="col" gap="xs">
              <P color="muted" className="text-xs font-medium">
                {ADMIT_CARD_PAGE.labels.exam} *
              </P>
              <Select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                disabled={!selectedAcademicYearId}
              >
                <option value="">Select published exam</option>
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.exam_name}
                  </option>
                ))}
              </Select>
            </Div>

            <Div type="col" gap="xs">
              <P color="muted" className="text-xs font-medium">
                {ADMIT_CARD_PAGE.labels.student} *
              </P>
              <Div type="row" gap="sm">
                <Input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Paste student UUID"
                  disabled={!examId}
                />
              </Div>
            </Div>

            <Button
              fullWidth
              onClick={generate}
              loading={isLoading}
              disabled={!examId || !studentId}
            >
              <Search size={14} /> {ADMIT_CARD_PAGE.buttons.generate}
            </Button>

            {cardData && (
              <Button
                fullWidth
                variant="outline"
                onClick={() => window.open(getPdfUrl(), "_blank")}
              >
                <Download size={14} /> {ADMIT_CARD_PAGE.buttons.download}
              </Button>
            )}
          </Div>
        </Div>

        {/* Right panel — preview */}
        <Div type="col" gap="md" className="flex-1 min-w-0">
          {isLoading ? (
            <Div type="row" justify="center" className="py-20">
              <Spinner size="lg" />
            </Div>
          ) : cardData ? (
            <AdmitCardPreview data={cardData} />
          ) : (
            <Div variant="card-dashed" className="flex-1">
              <Div type="col" align="center" gap="sm" className="py-10">
                <FileText size={40} className="text-muted-foreground/40" />
                <P color="muted">{ADMIT_CARD_PAGE.preview.noData}</P>
              </Div>
            </Div>
          )}
        </Div>
      </Div>
    </Div>
  );
}

export default function AdmitCardPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <AdmitCardContent />
    </Suspense>
  );
}