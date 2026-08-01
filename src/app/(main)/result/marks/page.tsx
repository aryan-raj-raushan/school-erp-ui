"use client";

import { Suspense, useMemo, useEffect } from "react";
import {
  BookOpen,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Pencil,
  X,
  PencilLine,
} from "lucide-react";
import { useExamResults } from "@/hooks/result/useExamResults";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Button,
  Spinner,
  DataTable,
  PageCol,
  FilterToolbar,
  type FilterField,
  ResponsiveModalContainer,
} from "@/components/ui";
import {
  RESULT_MARKS_PAGE,
  EXAM_TERM_LABELS,
} from "@/constants/result.constants";

type PersistedMarkFilters = {
  academic_year_id?: string;
  class_id?: string;
  section_id?: string;
  exam_id?: string;
};

function ConfirmModal({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
  isLoading,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <ResponsiveModalContainer isOpen={true} onClose={onClose} title={title}>
      <div className="px-4 py-4">
        <P>{description}</P>
      </div>
      <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {RESULT_MARKS_PAGE.confirmPublish.cancel}
        </Button>
        <Button onClick={onConfirm} loading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </ResponsiveModalContainer>
  );
}

function MarksContent() {
  const {
    years,
    classes,
    sections,
    exams,
    selectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    isLoadingClasses,
    schedules,
    studentEntries,
    isSaving,
    isPublishing,
    isDirty,
    isPublished,
    noSelection,
    isTableBusy,
    isEditMode,
    setIsEditMode,
    cancelEdit,
    columns,
    examId,
    classId,
    saveMarks,
    confirmAction,
    setConfirmAction,
    onConfirmPublish,
    onConfirmUnpublish,
    onYearChange,
    onClassChange,
    onSectionChange,
    onExamChange,
  } = useExamResults();

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedMarkFilters>({
    key: STORAGE_FILTER_KEYS.EXAM_MARKS,
    defaultValue: {},
  });

  const hasData = examId && classId;
  const canEdit = hasData && studentEntries.length > 0 && !isTableBusy;

  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStored = Object.values(storedFilters).some(Boolean);
    if (!hasStored) return;
    if (storedFilters.academic_year_id && storedFilters.academic_year_id !== selectedAcademicYearId) {
      onYearChange(storedFilters.academic_year_id);
    }
    if (storedFilters.class_id && storedFilters.class_id !== selectedClassId) {
      onClassChange(storedFilters.class_id);
    }
    if (storedFilters.section_id && storedFilters.section_id !== selectedSectionId) {
      onSectionChange(storedFilters.section_id);
    }
    if (storedFilters.exam_id && storedFilters.exam_id !== examId) {
      onExamChange(storedFilters.exam_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  function handleFilterChange(next: Record<string, string | undefined>) {
    if (next.academic_year_id !== undefined) onYearChange(next.academic_year_id);
    if (next.class_id !== undefined) onClassChange(next.class_id);
    if (next.section_id !== undefined) onSectionChange(next.section_id);
    if (next.exam_id !== undefined) onExamChange(next.exam_id);

    const persisted: Partial<PersistedMarkFilters> = {};
    (["academic_year_id", "class_id", "section_id", "exam_id"] as const).forEach((k) => {
      if (k in next) persisted[k] = next[k];
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    onYearChange("");
    clearStoredFilters();
  }

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: RESULT_MARKS_PAGE.filters.selectYear,
        options: years.map((y) => ({
          value: y.id,
          label: y.is_current ? `${y.name} (Current)` : y.name,
        })),
        resetKeys: ["class_id", "section_id", "exam_id"],
      },
      {
        type: "select",
        key: "class_id",
        label: "Class",
        placeholder: RESULT_MARKS_PAGE.filters.selectClass,
        options: classes.map((c) => ({ value: c.id, label: c.name })),
        disabled: !selectedAcademicYearId || isLoadingClasses,
        resetKeys: ["section_id", "exam_id"],
      },
      {
        type: "select",
        key: "section_id",
        label: "Section",
        placeholder: RESULT_MARKS_PAGE.filters.selectSection,
        options: sections.map((s) => ({ value: s.id, label: s.name })),
        disabled: !selectedClassId,
      },
      {
        type: "select",
        key: "exam_id",
        label: "Exam",
        placeholder: RESULT_MARKS_PAGE.filters.selectExam,
        options: exams.map((e) => ({
          value: e.id,
          label: `${e.exam_name} — ${EXAM_TERM_LABELS[e.exam_term] ?? e.exam_term}`,
        })),
        disabled: !selectedClassId,
      },
    ],
    [years, classes, sections, exams, selectedAcademicYearId, selectedClassId, isLoadingClasses],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: selectedAcademicYearId || undefined,
    class_id: selectedClassId || undefined,
    section_id: selectedSectionId || undefined,
    exam_id: examId || undefined,
  };

  return (
    <PageCol>
      <PageHeader
        title={RESULT_MARKS_PAGE.pageHeading.title}
        subtitle={RESULT_MARKS_PAGE.pageHeading.subtitle}
        actions={
          hasData && !isEditMode ? (
            <Div type="row" gap="sm" className="flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditMode(true)}
                disabled={!canEdit}
              >
                <Pencil size={14} />
                {RESULT_MARKS_PAGE.buttons.edit} Marks
              </Button>
              {isPublished ? (
                <Button
                  size="sm"
                  variant="outline"
                  loading={isPublishing}
                  onClick={() => setConfirmAction("unpublish")}
                >
                  <EyeOff size={14} />
                  {RESULT_MARKS_PAGE.buttons.unpublishResult}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  loading={isPublishing}
                  disabled={studentEntries.length === 0}
                  onClick={() => setConfirmAction("publish")}
                >
                  <Eye size={14} />
                  {RESULT_MARKS_PAGE.buttons.publishResult}
                </Button>
              )}
            </Div>
          ) : null
        }
      />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        sheetTitle="Filter Exam & Class"
      />

      {hasData && isPublished && !isEditMode && (
        <Div
          type="row"
          align="center"
          gap="sm"
          className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800/40 px-4 py-3 flex-wrap"
        >
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <P color="success" className="text-sm font-medium">
            Results are published — students can view their marks.
          </P>
        </Div>
      )}

      {hasData && isEditMode && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/20 dark:border-indigo-800/40 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/40 p-1.5 shrink-0">
              <PencilLine size={14} className="text-indigo-600 dark:text-indigo-400" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 leading-tight">
                Editing marks
              </p>
              <p className="text-[11px] text-indigo-500 dark:text-indigo-500 leading-tight mt-0.5">
                {isDirty ? (
                  <span className="flex items-center gap-1">
                    <AlertCircle size={10} />
                    Unsaved changes — click Save when done
                  </span>
                ) : (
                  "Type marks and press Tab to move between cells"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
              disabled={isSaving}
              className="flex-1  "
            >
              <X size={14} />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveMarks}
              loading={isSaving}
              disabled={!isDirty}
            >
              <Save size={14} />
              {RESULT_MARKS_PAGE.buttons.saveMarks}
            </Button>
          </div>
        </div>
      )}

      {noSelection ? (
        <Div
          type="col"
          gap="sm"
          align="center"
          className="rounded-xl border border-dashed border-border py-16 text-center"
        >
          <BookOpen size={32} className="text-muted-foreground/30" />
          <P color="muted" className="text-sm">
            {RESULT_MARKS_PAGE.table.noEntry}
          </P>
        </Div>
      ) : schedules.length === 0 && !isTableBusy ? (
        <Div
          type="col"
          gap="sm"
          align="center"
          className="rounded-xl border border-dashed border-border py-16"
        >
          <P color="muted">{RESULT_MARKS_PAGE.table.noExam}</P>
        </Div>
      ) : (
        <div className={isEditMode ? "ring-2 ring-indigo-200 dark:ring-indigo-800/50 rounded-2xl" : undefined}>
          <DataTable
            columns={columns}
            data={studentEntries}
            isLoading={isTableBusy}
            emptyText="No students found for this class and section."
            pinnedColumns={["index", "roll_number", "student_name"]}
            maxHeight="calc(100vh - 420px)"
          />
        </div>
      )}

      {confirmAction === "publish" && (
        <ConfirmModal
          title={RESULT_MARKS_PAGE.confirmPublish.title}
          description={RESULT_MARKS_PAGE.confirmPublish.description}
          confirmLabel={RESULT_MARKS_PAGE.confirmPublish.confirm}
          onConfirm={onConfirmPublish}
          onClose={() => setConfirmAction(null)}
          isLoading={isPublishing}
        />
      )}
      {confirmAction === "unpublish" && (
        <ConfirmModal
          title={RESULT_MARKS_PAGE.confirmUnpublish.title}
          description={RESULT_MARKS_PAGE.confirmUnpublish.description}
          confirmLabel={RESULT_MARKS_PAGE.confirmUnpublish.confirm}
          onConfirm={onConfirmUnpublish}
          onClose={() => setConfirmAction(null)}
          isLoading={isPublishing}
        />
      )}
    </PageCol>
  );
}

export default function MarksPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <MarksContent />
    </Suspense>
  );
}
