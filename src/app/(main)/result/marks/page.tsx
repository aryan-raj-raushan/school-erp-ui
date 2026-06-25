'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useExamResults } from '@/hooks/result/useExamResults';
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
  Select,
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
  Badge,
  Spinner,
  Modal,
  ModalBody,
  ModalFooter,
} from '@/components/ui';
import {
  RESULT_MARKS_PAGE,
  EXAM_TERM_LABELS,
} from '@/constants/result.constants';

// ── Confirm modal (publish / unpublish) ──────────────────────────────────────

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

// ── Main content ──────────────────────────────────────────────────────────────

function MarksContent() {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<'publish' | 'unpublish' | null>(null);

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
    isLoadingClasses,
  } = useAcademicClassSection();

  const {
    schedules,
    studentEntries,
    isLoading,
    isLoadingSchedules,
    isSaving,
    isPublishing,
    isDirty,
    isPublished,
    filterForm,
    examId,
    classId,
    updateMark,
    saveMarks,
    togglePublish,
  } = useExamResults();


  console.log("studentEntries: ",studentEntries);``

  const { register, setValue, watch } = filterForm;
  const watchedExamId = watch('exam_id');

  const { exams } = useExams({
    academic_year_id: selectedAcademicYearId,
    class_id: selectedClassId,
  });

  const { students } = useStudents(
    selectedClassId && selectedAcademicYearId
      ? {
          class_id: selectedClassId,
          section_id: selectedSectionId || undefined,
          academic_year_id: selectedAcademicYearId,
        }
      : {},
  );

  // Sync ACS selections into the filter form
  function onYearChange(yearId: string) {
    setSelectedAcademicYearId(yearId);
    setValue('academic_year_id', yearId);
    setValue('class_id', '');
    setValue('exam_id', '');
    handleClassChange('');
  }

  function onClassChange(cId: string) {
    handleClassChange(cId);
    setValue('class_id', cId);
    setValue('exam_id', '');
  }

  function onSectionChange(sId: string) {
    handleSectionChange(sId);
    setValue('section_id', sId);
  }

  // Parent schedules only (no sub-subjects as columns — they group under parent)
  const parentSchedules = schedules.filter((s) => !s.parent_schedule_id);

  console.log("schedules: ", schedules);

  const totalCols = 3 + parentSchedules.length; // S.No + Roll + Name + schedules

  // Build a map: student_id → student for subject_id lookup during save
  const studentSubjectMap = students.map((s) => ({
    student_id: s.id,
    subject_id: '',
  }));

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={RESULT_MARKS_PAGE.pageHeading.title}
        subtitle={RESULT_MARKS_PAGE.pageHeading.subtitle}
        actions={
          <Div type="row" gap="sm">
            {examId && classId && (
              <>
                {isDirty && (
                  <Button
                    size="sm"
                    onClick={() => saveMarks(studentSubjectMap)}
                    loading={isSaving}
                  >
                    <Save size={14} />
                    {RESULT_MARKS_PAGE.buttons.saveMarks}
                  </Button>
                )}
                {isPublished ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmAction('unpublish')}
                    loading={isPublishing}
                  >
                    <EyeOff size={14} />
                    {RESULT_MARKS_PAGE.buttons.unpublishResult}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmAction('publish')}
                    loading={isPublishing}
                    disabled={studentEntries.length === 0}
                  >
                    <Eye size={14} />
                    {RESULT_MARKS_PAGE.buttons.publishResult}
                  </Button>
                )}
              </>
            )}
          </Div>
        }
      />

      {/* ── Filters ── */}
      <Div className="rounded-xl border border-border bg-card p-5" type="col" gap="md">
        <H3 className="text-xs font-semibold uppercase tracking-wider">
          Select Exam &amp; Class
        </H3>
        <Div type="row" gap="md" wrap align="end">
          {/* Academic Year */}
          <FormField label="Academic Year">
            <Select
              width="sm"
              value={selectedAcademicYearId}
              onChange={(e) => onYearChange(e.target.value)}
            >
              <option value="">{RESULT_MARKS_PAGE.filters.selectYear}</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Class */}
          <FormField label="Class">
            <Select
              width="sm"
              value={selectedClassId}
              onChange={(e) => onClassChange(e.target.value)}
              disabled={!selectedAcademicYearId || isLoadingClasses}
            >
              <option value="">{RESULT_MARKS_PAGE.filters.selectClass}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Section */}
          <FormField label="Section">
            <Select
              width="sm"
              value={selectedSectionId}
              onChange={(e) => onSectionChange(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">{RESULT_MARKS_PAGE.filters.selectSection}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Exam */}
          <FormField label="Exam">
            <Select
              width="md"
              value={watchedExamId}
              {...register('exam_id')}
              onChange={(e) => setValue('exam_id', e.target.value)}
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
        </Div>
      </Div>

      {/* ── Status banner ── */}
      {examId && classId && isPublished && (
        <Div
          type="row"
          align="center"
          gap="sm"
          className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3"
        >
          <CheckCircle2 size={16} className="text-emerald-600" />
          <P color="success" className="text-sm font-medium">
            Results are published — students can view their marks.
          </P>
        </Div>
      )}

      {examId && classId && isDirty && (
        <Div
          type="row"
          align="center"
          gap="sm"
          className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3"
        >
          <AlertCircle size={16} className="text-amber-600" />
          <P className="text-sm font-medium text-amber-700">
            You have unsaved changes. Click &quot;Save Marks&quot; to save.
          </P>
        </Div>
      )}

      {/* ── Mark Entry Table ── */}
      {!watchedExamId || !selectedClassId ? (
        <Div
          type="col"
          gap="sm"
          align="center"
          className="rounded-xl border border-dashed border-border py-16 text-center"
        >
          <BookOpen size={32} className="text-muted-foreground/40" />
          <P color="muted">{RESULT_MARKS_PAGE.table.noEntry}</P>
        </Div>
      ) : isLoadingSchedules || isLoading ? (
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      ) : parentSchedules.length === 0 ? (
        <Div
          type="col"
          gap="sm"
          align="center"
          className="rounded-xl border border-dashed border-border py-16"
        >
          <P color="muted">{RESULT_MARKS_PAGE.table.noExam}</P>
        </Div>
      ) : (
        <Div type="col" gap="sm">
          {/* Schedule info pills */}
          <Div type="row" gap="sm" wrap>
            {parentSchedules.map((s) => (
              <Div
                key={s.id}
                type="row"
                gap="xs"
                align="center"
                className="rounded-full border border-border bg-muted/40 px-3 py-1"
              >
                <Div className="text-xs font-medium text-foreground">{s.subject_name}</Div>
                <Div className="text-xs text-muted-foreground">
                  ({RESULT_MARKS_PAGE.subjectTypes[s.subject_type] ?? s.subject_type} / {s.exam_marks})
                </Div>
              </Div>
            ))}
          </Div>

          <Div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">
                    {RESULT_MARKS_PAGE.table.sno}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-20">
                    {RESULT_MARKS_PAGE.table.rollNo}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground min-w-[160px]">
                    {RESULT_MARKS_PAGE.table.studentName}
                  </th>
                  {parentSchedules.map((s) => (
                    <th
                      key={s.id}
                      className="px-4 py-3 text-center font-medium text-muted-foreground min-w-[120px]"
                    >
                      <Div type="col" gap="xs" align="center">
                        <Div>{s.subject_name}</Div>
                        <Div className="text-xs font-normal text-muted-foreground/70">
                          Max: {s.exam_marks}
                        </Div>
                      </Div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studentEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={totalCols}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No students found for this class/section.
                    </td>
                  </tr>
                ) : (
                  studentEntries.map((entry, idx) => (
                    <tr
                      key={entry.student_id}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {entry.roll_number ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {entry.student_name}
                      </td>
                      {parentSchedules.map((schedule) => {
                        const mark = entry.marks[schedule.id];
                        const isAbsent = mark?.is_absent ?? false;
                        const marksVal = mark?.marks_obtained;
                        return (
                          <td key={schedule.id} className="px-3 py-2 text-center">
                            <Div type="col" gap="xs" align="center">
                              {isAbsent ? (
                                <Div type="row" gap="xs" align="center">
                                  <Badge variant="warning">Absent</Badge>
                                  <Button
                                    type="button"
                                    className="text-xs text-muted-foreground underline hover:text-foreground"
                                    onClick={() =>
                                      updateMark(entry.student_id, schedule.id, null, false)
                                    }
                                  >
                                    undo
                                  </Button>
                                </Div>
                              ) : (
                                <Div type="row" gap="xs" align="center">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={schedule.exam_marks}
                                    width="xs"
                                    placeholder="—"
                                    value={marksVal ?? ''}
                                    className="text-center"
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      updateMark(
                                        entry.student_id,
                                        schedule.id,
                                        v === '' ? null : parseFloat(v),
                                        false,
                                      );
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    title="Mark absent"
                                    className="text-xs text-muted-foreground hover:text-destructive"
                                    onClick={() =>
                                      updateMark(entry.student_id, schedule.id, null, true)
                                    }
                                  >
                                    A
                                  </Button>
                                </Div>
                              )}
                            </Div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Div>

          {/* Footer save */}
          {studentEntries.length > 0 && (
            <Div type="row" justify="end">
              <Button
                onClick={() => saveMarks(studentSubjectMap)}
                loading={isSaving}
                disabled={!isDirty}
              >
                <Save size={14} />
                {RESULT_MARKS_PAGE.buttons.saveMarks}
              </Button>
            </Div>
          )}
        </Div>
      )}

      {/* ── Confirm modals ── */}
      {confirmAction === 'publish' && (
        <ConfirmModal
          title={RESULT_MARKS_PAGE.confirmPublish.title}
          description={RESULT_MARKS_PAGE.confirmPublish.description}
          confirmLabel={RESULT_MARKS_PAGE.confirmPublish.confirm}
          onConfirm={async () => {
            await togglePublish(true);
            setConfirmAction(null);
          }}
          onClose={() => setConfirmAction(null)}
          isLoading={isPublishing}
        />
      )}
      {confirmAction === 'unpublish' && (
        <ConfirmModal
          title={RESULT_MARKS_PAGE.confirmUnpublish.title}
          description={RESULT_MARKS_PAGE.confirmUnpublish.description}
          confirmLabel={RESULT_MARKS_PAGE.confirmUnpublish.confirm}
          onConfirm={async () => {
            await togglePublish(false);
            setConfirmAction(null);
          }}
          onClose={() => setConfirmAction(null)}
          isLoading={isPublishing}
        />
      )}
    </Div>
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
