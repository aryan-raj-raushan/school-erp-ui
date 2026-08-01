'use client';

import { Suspense, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useReportCards } from '@/hooks/result/useReportCards';
import { useAcademicClassSection } from '@/hooks/useAcademicClassSection';
import { useExams } from '@/hooks/exam/useExams';
import { useStudents } from '@/hooks/useStudents';
import { useStorageFilter } from '@/hooks/useStorageFilter';
import { STORAGE_FILTER_KEYS } from '@/constants/storage-filter-keys.constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div,
  P,
  Button,
  FormField,
  Badge,
  Spinner,
  ResponsiveSelect,
  ResponsiveModalContainer,
  FilterToolbar,
  type FilterField,
  PageCol,
  DataTable,
  type ColumnDef,
} from '@/components/ui';
import {
  REPORT_CARD_PAGE,
  EXAM_TERM_LABELS,
  RESULT_ROUTES,
} from '@/constants/result.constants';
import type { ReportCardItem, ReportCardFilters } from '@/types/result.types';

type PersistedReportCardFilters = {
  academic_year_id?: string;
  class_id?: string;
  section_id?: string;
  exam_id?: string;
  search?: string;
};

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

            <FormField label="Exam *" error={errors.exam_id?.message}>
              <ResponsiveSelect
                {...register('exam_id')}
                customPlaceholder="Select Exam"
                options={exams.map((e: any) => ({ value: e.id, label: `${e.exam_name} — ${EXAM_TERM_LABELS[e.exam_term] ?? e.exam_term}` }))}
              />
            </FormField>

            {scope === 'student' && (
              <FormField label="Student *" error={errors.student_id?.message}>
                <ResponsiveSelect
                  {...register('student_id')}
                  customPlaceholder="Select Student"
                  options={students.map((s: any) => ({ value: s.id, label: `${s.first_name} ${s.last_name ?? ''} ${s.roll_number ? `(Roll: ${s.roll_number})` : ''}` }))}
                />
              </FormField>
            )}

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

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedReportCardFilters>({
    key: STORAGE_FILTER_KEYS.REPORT_CARDS,
    defaultValue: {},
  });

  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStored = Object.values(storedFilters).some(Boolean);
    if (!hasStored) return;
    const toApply: Partial<ReportCardFilters> = {};
    if (storedFilters.academic_year_id) {
      setSelectedAcademicYearId(storedFilters.academic_year_id);
      toApply.academic_year_id = storedFilters.academic_year_id;
    }
    if (storedFilters.class_id) {
      handleClassChange(storedFilters.class_id);
      toApply.class_id = storedFilters.class_id;
    }
    if (storedFilters.section_id) {
      handleSectionChange(storedFilters.section_id);
      toApply.section_id = storedFilters.section_id;
    }
    if (storedFilters.exam_id) toApply.exam_id = storedFilters.exam_id;
    if (storedFilters.search) toApply.search = storedFilters.search;
    if (Object.keys(toApply).length > 0) updateFilters(toApply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  function handleFilterChange(next: Record<string, string | undefined>) {
    const toApply: Partial<ReportCardFilters> = {};
    if (next.academic_year_id !== undefined) {
      setSelectedAcademicYearId(next.academic_year_id);
      toApply.academic_year_id = next.academic_year_id || undefined;
      toApply.class_id = undefined;
      toApply.section_id = undefined;
      toApply.exam_id = undefined;
      handleClassChange('');
    }
    if (next.class_id !== undefined) {
      handleClassChange(next.class_id);
      toApply.class_id = next.class_id || undefined;
      toApply.section_id = undefined;
      toApply.exam_id = undefined;
    }
    if (next.section_id !== undefined) {
      handleSectionChange(next.section_id);
      toApply.section_id = next.section_id || undefined;
    }
    if (next.exam_id !== undefined) {
      toApply.exam_id = next.exam_id || undefined;
    }
    if (next.search !== undefined) {
      toApply.search = next.search || undefined;
    }
    updateFilters(toApply);

    const persisted: Partial<PersistedReportCardFilters> = {};
    (['academic_year_id', 'class_id', 'section_id', 'exam_id', 'search'] as const).forEach((k) => {
      if (k in next) persisted[k] = next[k];
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    updateFilters({
      search: undefined,
      academic_year_id: undefined,
      class_id: undefined,
      section_id: undefined,
      exam_id: undefined,
    });
    setSelectedAcademicYearId('');
    handleClassChange('');
    handleSectionChange('');
    clearStoredFilters();
  }

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: 'search',
        key: 'search',
        placeholder: REPORT_CARD_PAGE.filters.searchPlaceholder,
      },
      {
        type: 'select',
        key: 'academic_year_id',
        label: 'Academic Year',
        placeholder: 'All Years',
        options: years.map((y) => ({ value: y.id, label: y.name })),
        resetKeys: ['class_id', 'section_id', 'exam_id'],
      },
      {
        type: 'select',
        key: 'class_id',
        label: 'Class',
        placeholder: 'All Classes',
        options: classes.map((c) => ({ value: c.id, label: c.name })),
        disabled: !selectedAcademicYearId,
        resetKeys: ['section_id', 'exam_id'],
      },
      {
        type: 'select',
        key: 'section_id',
        label: 'Section',
        placeholder: 'All Sections',
        options: sections.map((s) => ({ value: s.id, label: s.name })),
        disabled: !selectedClassId,
      },
      {
        type: 'select',
        key: 'exam_id',
        label: 'Exam',
        placeholder: 'All Exams',
        options: exams.map((e) => ({
          value: e.id,
          label: `${e.exam_name} — ${EXAM_TERM_LABELS[e.exam_term] ?? e.exam_term}`,
        })),
        disabled: !selectedClassId,
      },
    ],
    [years, classes, sections, exams, selectedAcademicYearId, selectedClassId],
  );

  const filterValues: Record<string, string | undefined> = {
    search: filters.search,
    academic_year_id: filters.academic_year_id,
    class_id: filters.class_id,
    section_id: filters.section_id,
    exam_id: filters.exam_id,
  };

  const columns = useMemo<ColumnDef<ReportCardItem>[]>(
    () => [
      {
        id: 'index',
        header: REPORT_CARD_PAGE.table.sno,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: 'student_name',
        header: REPORT_CARD_PAGE.table.studentName,
        meta: { primary: true },
        cell: ({ row }) => row.original.student_name,
      },
      {
        id: 'class',
        header: REPORT_CARD_PAGE.table.class,
        cell: ({ row }) => {
          const rc = row.original;
          return (
            <>
              {rc.class_name ?? '—'}
              {rc.section_name ? ` · ${rc.section_name}` : ''}
            </>
          );
        },
      },
      {
        id: 'exam',
        header: REPORT_CARD_PAGE.table.exam,
        cell: ({ row }) => {
          const rc = row.original;
          return (
            <Div type="col" gap="xs">
              <Div>{rc.exam_name ?? '—'}</Div>
              {rc.exam_term && (
                <P color="muted" className="text-xs">
                  {EXAM_TERM_LABELS[rc.exam_term] ?? rc.exam_term}
                </P>
              )}
            </Div>
          );
        },
      },
      {
        id: 'total_marks',
        header: REPORT_CARD_PAGE.table.totalMarks,
        cell: ({ row }) => {
          const rc = row.original;
          return rc.marks_obtained != null && rc.total_marks != null
            ? `${rc.marks_obtained} / ${rc.total_marks}`
            : '—';
        },
      },
      {
        accessorKey: 'percentage',
        header: REPORT_CARD_PAGE.table.percentage,
        cell: ({ row }) => (row.original.percentage ? `${row.original.percentage}%` : '—'),
      },
      {
        accessorKey: 'grade',
        header: REPORT_CARD_PAGE.table.grade,
        cell: ({ row }) =>
          row.original.grade ? (
            <Badge variant="info">{row.original.grade}</Badge>
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'rank',
        header: REPORT_CARD_PAGE.table.rank,
        cell: ({ row }) => row.original.rank ?? '—',
      },
      {
        accessorKey: 'status',
        header: REPORT_CARD_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={REPORT_CARD_PAGE.statusBadge[row.original.status] ?? 'default'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'published',
        header: REPORT_CARD_PAGE.table.published,
        cell: ({ row }) =>
          row.original.is_published ? (
            <Badge variant="success">Published</Badge>
          ) : (
            <Badge variant="default">Draft</Badge>
          ),
      },
      {
        id: 'actions',
        header: REPORT_CARD_PAGE.table.actions,
        cell: ({ row }) => {
          const rc = row.original;
          return (
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
                onClick={() => router.push(RESULT_ROUTES.reportCards.detail(rc.id))}
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
          );
        },
      },
    ],
    [router, isPublishing, filters.exam_id, publishReportCards, removeReportCard],
  );

  return (
    <PageCol>
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

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        sheetTitle="Filter Report Cards"
      />

      <DataTable
        columns={columns}
        data={reportCards}
        isLoading={isLoading}
        emptyText={REPORT_CARD_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
        fillViewport
      />

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
        handleClassChange={handleClassChange}
        handleSectionChange={handleSectionChange}
      />
    </PageCol>
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
