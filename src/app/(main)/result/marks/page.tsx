"use client";

import { Suspense } from "react";
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
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  H3,
  P,
  Button,
  Select,
  FormField,
  Spinner,
  Modal,
  ModalBody,
  ModalFooter,
  DataTable,
  PageCol,
} from "@/components/ui";
import {
  RESULT_MARKS_PAGE,
  EXAM_TERM_LABELS,
} from "@/constants/result.constants";

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
    <Modal onClose={onClose} title={title} size="sm">
      <ModalBody>
        <P>{description}</P>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {RESULT_MARKS_PAGE.confirmPublish.cancel}
        </Button>
        <Button onClick={onConfirm} loading={isLoading}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
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

  const hasData = examId && classId;
  const canEdit = hasData && studentEntries.length > 0 && !isTableBusy;

  return (
    <PageCol>
      {/* ── Page header ── */}
      <PageHeader
        title={RESULT_MARKS_PAGE.pageHeading.title}
        subtitle={RESULT_MARKS_PAGE.pageHeading.subtitle}
        actions={
          hasData && !isEditMode ? (
            <Div type="row" gap="sm">
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

      {/* ── Filters ── */}
      <Div className="rounded-xl border border-border bg-card px-4 py-3" type="col" gap="xs">
        <H3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Select Exam &amp; Class
        </H3>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <FormField label="Academic Year">
            <Select
              value={selectedAcademicYearId}
              onChange={(e) => onYearChange(e.target.value)}
            >
              <option value="">{RESULT_MARKS_PAGE.filters.selectYear}</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.is_current ? `${y.name} (Current)` : y.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Class">
            <Select
              value={selectedClassId}
              onChange={(e) => onClassChange(e.target.value)}
              disabled={!selectedAcademicYearId || isLoadingClasses}
            >
              <option value="">{RESULT_MARKS_PAGE.filters.selectClass}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Section">
            <Select
              value={selectedSectionId}
              onChange={(e) => onSectionChange(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">{RESULT_MARKS_PAGE.filters.selectSection}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Exam">
            <Select
              value={examId}
              onChange={(e) => onExamChange(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">{RESULT_MARKS_PAGE.filters.selectExam}</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.exam_name} — {EXAM_TERM_LABELS[e.exam_term] ?? e.exam_term}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </Div>

      {/* ── Published banner (view mode only) ── */}
      {hasData && isPublished && !isEditMode && (
        <Div
          type="row"
          align="center"
          gap="sm"
          className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800/40 px-4 py-3"
        >
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <P color="success" className="text-sm font-medium">
            Results are published — students can view their marks.
          </P>
        </Div>
      )}

      {/* ── Edit mode toolbar ── */}
      {hasData && isEditMode && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/20 dark:border-indigo-800/40 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/40 p-1.5">
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
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
              disabled={isSaving}
              className="text-indigo-700 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
            >
              <X size={14} />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveMarks}
              loading={isSaving}
              disabled={!isDirty}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm"
            >
              <Save size={14} />
              {RESULT_MARKS_PAGE.buttons.saveMarks}
            </Button>
          </div>
        </div>
      )}

      {/* ── Table area ── */}
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

      {/* ── Confirm modals ── */}
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
