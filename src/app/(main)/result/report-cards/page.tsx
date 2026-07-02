'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useReportCards } from '@/hooks/result/useReportCards';
import { useAcademicClassSection } from '@/hooks/useAcademicClassSection';
import { useExams } from '@/hooks/exam/useExams';
import { useStudents } from '@/hooks/useStudents';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div,
  H1,
  H2,
  H3,
  P,
  Button,
  Input,
  FormField,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  TablePagination,
  Badge,
  Spinner,
  ResponsiveSelect,
  ResponsiveModalContainer,
} from '@/components/ui';
import {
  REPORT_CARD_PAGE,
  EXAM_TERM_LABELS,
  RESULT_ROUTES,
} from '@/constants/result.constants';
import type { ReportCardItem } from '@/types/result.types';

// ── Generate Modal ────────────────────────────────────────────────────────────

function GenerateModal({
  isOpen,
  onClose,
  years,
  classes,
  sections,
  exams,
  students,
  generateForm,
  handleGenerate,
  isGenerating,
  scope,
  selectedAcademicYearId,
  setSelectedAcademicYearId,
  selectedClassId,
  handleClassChange,
  handleSectionChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  years: any[];
  classes: any[];
  sections: any[];
  exams: any[];
  students: any[];
  generateForm: any;
  handleGenerate: () => void;
  isGenerating: boolean;
  scope: string;
  selectedAcademicYearId: string;
  setSelectedAcademicYearId: (id: string) => void;
  selectedClassId: string;
  handleClassChange: (id: string) => void;
  handleSectionChange: (id: string) => void;
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = generateForm;

  const watchedClassId = watch('class_id');
  const watchedSectionId = watch('section_id');

  return (
    <ResponsiveModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title={REPORT_CARD_PAGE.generateModal.title}
    >
      <form onSubmit={handleGenerate}>
        <div className="px-4 py-4">
          <Div type="col" gap="md">
            {/* Scope toggle */}
            <Div type="row" gap="sm">
              <Button
                type="button"
                onClick={() => setValue('scope', 'class')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  scope === 'class'
                    ? 'border-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {REPORT_CARD_PAGE.generateModal.classLabel}
              </Button>
              <Button
                type="button"
                onClick={() => setValue('scope', 'student')}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  scope === 'student'
                    ? 'border-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {REPORT_CARD_PAGE.generateModal.singleLabel}
              </Button>
            </Div>

            {/* Academic Year */}
            <FormField label="Academic Year *" error={errors.academic_year_id?.message}>
              <ResponsiveSelect
                value={selectedAcademicYearId}
                onChange={(e) => {
                  setSelectedAcademicYearId(e.target.value);
                  handleClassChange('');
                  setValue('class_id', '');
                  setValue('exam_id', '');
                }}
                customPlaceholder="Select Year"
                options={years.map((y: any) => ({ value: y.id, label: y.name }))}
              />
            </FormField>

            {/* Class */}
            <FormField label="Class *" error={errors.class_id?.message}>
              <ResponsiveSelect
                {...register('class_id')}
                value={watchedClassId}
                onChange={(e) => {
                  setValue('class_id', e.target.value);
                  handleClassChange(e.target.value);
                  setValue('section_id', '');
                }}
                customPlaceholder="Select Class"
                options={classes.map((c: any) => ({ value: c.id, label: c.name }))}
              />
            </FormField>

            {/* Section */}
            <FormField label="Section">
              <ResponsiveSelect
                {...register('section_id')}
                value={watchedSectionId}
                onChange={(e) => {
                  setValue('section_id', e.target.value);
                  handleSectionChange(e.target.value);
                }}
                customPlaceholder="All Sections"
                options={sections.map((s: any) => ({ value: s.id, label: s.name }))}
              />
            </FormField>

            {/* Exam */}
            <FormField label="Exam *" error={errors.exam_id?.message}>
              <ResponsiveSelect
                {...register('exam_id')}
                customPlaceholder="Select Exam"
                options={exams.map((e: any) => ({ value: e.id, label: `${e.exam_name} — ${EXAM_TERM_LABELS[e.exam_term] ?? e.exam_term}` }))}
              />
            </FormField>

            {/* Student (single scope) */}
            {scope === 'student' && (
              <FormField label="Student *" error={errors.student_id?.message}>
                <ResponsiveSelect
                  {...register('student_id')}
                  customPlaceholder="Select Student"
                  options={students.map((s: any) => ({ value: s.id, label: `${s.first_name} ${s.last_name ?? ''} ${s.roll_number ? `(Roll: ${s.roll_number})` : ''}` }))}
                />
              </FormField>
            )}

            {/* Remarks */}
            <FormField label={REPORT_CARD_PAGE.generateModal.remarksLabel}>
              <textarea
                rows={2}
                placeholder={REPORT_CARD_PAGE.generateModal.remarksPlaceholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                {...register('remarks')}
              />
            </FormField>
          </Div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>
            {REPORT_CARD_PAGE.buttons.cancel}
          </Button>
          <Button type="submit" loading={isGenerating}>
            {REPORT_CARD_PAGE.generateModal.submitLabel}
          </Button>
        </div>
      </form>
    </ResponsiveModalContainer>
  );
}

// ── Main Content ──────────────────────────────────────────────────────────────

function ReportCardsContent() {
  const router = useRouter();

  const {
    years,
    classes,
    sections,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    handleClassChange,
    handleSectionChange,
  } = useAcademicClassSection();

  const { exams } = useExams({
    academic_year_id: selectedAcademicYearId,
    class_id: selectedClassId,
  });

  const { students } = useStudents(
    selectedClassId
      ? { class_id: selectedClassId, section_id: selectedSectionId || undefined, academic_year_id: selectedAcademicYearId }
      : {},
  );

  const {
    reportCards,
    pagination,
    filters,
    isLoading,
    isGenerating,
    isPublishing,
    showGenerateModal,
    generateForm,
    scope,
    updateFilters,
    openGenerateModal,
    closeGenerateModal,
    handleGenerate,
    publishReportCards,
    removeReportCard,
  } = useReportCards();

  function handleFilterExam(examId: string) {
    updateFilters({ exam_id: examId || undefined });
  }

  function handleFilterClass(classId: string) {
    handleClassChange(classId);
    updateFilters({ class_id: classId || undefined, section_id: undefined });
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={REPORT_CARD_PAGE.pageHeading.title}
        subtitle={
          pagination
            ? `${pagination.total} report cards`
            : REPORT_CARD_PAGE.pageHeading.subtitle
        }
        actions={
          <Button onClick={openGenerateModal}>
            <FileText size={14} />
            {REPORT_CARD_PAGE.buttons.generate}
          </Button>
        }
      />

      {/* Filters */}
      <Div type="row" gap="md" align="center" wrap>
        <Input
          width="md"
          placeholder={REPORT_CARD_PAGE.filters.searchPlaceholder}
          value={filters.search ?? ''}
          onChange={(e) => updateFilters({ search: e.target.value || undefined })}
        />
        <Div className="w-32 max-w-full">
          <ResponsiveSelect
            value={filters.academic_year_id ?? ''}
            onChange={(e) => {
              setSelectedAcademicYearId(e.target.value);
              updateFilters({
                academic_year_id: e.target.value || undefined,
                class_id: undefined,
                section_id: undefined,
                exam_id: undefined,
              });
            }}
            customPlaceholder="All Years"
            options={years.map((y) => ({ value: y.id, label: y.name }))}
          />
        </Div>
        <Div className="w-32 max-w-full">
          <ResponsiveSelect
            value={filters.class_id ?? ''}
            onChange={(e) => handleFilterClass(e.target.value)}
            customPlaceholder="All Classes"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Div>
        <Div className="w-32 max-w-full">
          <ResponsiveSelect
            value={filters.section_id ?? ''}
            onChange={(e) => {
              handleSectionChange(e.target.value);
              updateFilters({ section_id: e.target.value || undefined });
            }}
            disabled={!selectedClassId}
            customPlaceholder="All Sections"
            options={sections.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Div>
        <Div className="w-48 max-w-full">
          <ResponsiveSelect
            value={filters.exam_id ?? ''}
            onChange={(e) => handleFilterExam(e.target.value)}
            customPlaceholder="All Exams"
            options={exams.map((e) => ({ value: e.id, label: `${e.exam_name} — ${EXAM_TERM_LABELS[e.exam_term] ?? e.exam_term}` }))}
          />
        </Div>
      </Div>

      {/* Table */}
      <Table maxHeight="calc(100vh - 280px)">
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.studentName}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.class}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.exam}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.totalMarks}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.percentage}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.grade}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.rank}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.published}</TableHeaderCell>
            <TableHeaderCell>{REPORT_CARD_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={11}>
              <Spinner />
            </TableEmptyRow>
          ) : reportCards.length === 0 ? (
            <TableEmptyRow colSpan={11}>
              {REPORT_CARD_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            reportCards.map((rc, i) => (
              <TableRow key={rc.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{rc.student_name}</TableCell>
                <TableCell>
                  {rc.class_name ?? '—'}
                  {rc.section_name ? ` · ${rc.section_name}` : ''}
                </TableCell>
                <TableCell>
                  <Div type="col" gap="xs">
                    <Div>{rc.exam_name ?? '—'}</Div>
                    {rc.exam_term && (
                      <P color="muted" className="text-xs">
                        {EXAM_TERM_LABELS[rc.exam_term] ?? rc.exam_term}
                      </P>
                    )}
                  </Div>
                </TableCell>
                <TableCell>
                  {rc.marks_obtained != null && rc.total_marks != null
                    ? `${rc.marks_obtained} / ${rc.total_marks}`
                    : '—'}
                </TableCell>
                <TableCell>{rc.percentage ? `${rc.percentage}%` : '—'}</TableCell>
                <TableCell>
                  {rc.grade ? (
                    <Badge variant="info">{rc.grade}</Badge>
                  ) : '—'}
                </TableCell>
                <TableCell>{rc.rank ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={REPORT_CARD_PAGE.statusBadge[rc.status] ?? 'default'}>
                    {rc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {rc.is_published ? (
                    <Badge variant="success">Published</Badge>
                  ) : (
                    <Badge variant="default">Draft</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Div type="row" gap="sm">
                    {rc.pdf_url && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="View PDF"
                        onClick={() => window.open(rc.pdf_url!, '_blank')}
                      >
                        <ExternalLink size={14} />
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="View Detail"
                      onClick={() =>
                        router.push(RESULT_ROUTES.reportCards.detail(rc.id))
                      }
                    >
                      <Eye size={14} />
                    </Button>
                    {rc.is_published ? (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Unpublish"
                        loading={isPublishing}
                        onClick={() =>
                          publishReportCards(rc.exam_id ?? filters.exam_id!, false, {
                            studentId: rc.student_id,
                          })
                        }
                      >
                        <XCircle size={14} />
                      </Button>
                    ) : (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Publish"
                        loading={isPublishing}
                        disabled={rc.status !== 'GENERATED'}
                        onClick={() =>
                          publishReportCards(rc.exam_id ?? filters.exam_id!, true, {
                            studentId: rc.student_id,
                          })
                        }
                      >
                        <CheckCircle2 size={14} />
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      title="Delete"
                      onClick={() => removeReportCard(rc.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}

      {/* Generate Modal */}
      <GenerateModal
        isOpen={showGenerateModal}
        onClose={closeGenerateModal}
        years={years}
        classes={classes}
        sections={sections}
        exams={exams}
        students={students}
        generateForm={generateForm}
        handleGenerate={handleGenerate}
        isGenerating={isGenerating}
        scope={scope}
        selectedAcademicYearId={selectedAcademicYearId}
        setSelectedAcademicYearId={setSelectedAcademicYearId}
        selectedClassId={selectedClassId}
        handleClassChange={handleClassChange}
        handleSectionChange={handleSectionChange}
      />
    </Div>
  );
}

export default function ReportCardsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <ReportCardsContent />
    </Suspense>
  );
}
