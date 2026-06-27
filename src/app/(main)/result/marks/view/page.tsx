'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useExamResults } from '@/hooks/result/useExamResults';
import { useAcademicClassSection } from '@/hooks/useAcademicClassSection';
import { useExams } from '@/hooks/exam/useExams';
import {
  Div,
  H1,
  H2,
  H3,
  P,
  Button,
  Badge,
  Spinner,
  Select,
  FormField,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
} from '@/components/ui';
import { RESULT_MARKS_PAGE, EXAM_TERM_LABELS } from '@/constants/result.constants';

function MarksViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id') ?? undefined;

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

  const { results, isLoadingResults, filterForm, examId } = useExamResults();

  const { register, setValue, watch } = filterForm;
  const watchedExamId = watch('exam_id');

  useEffect(() => {
    const qExamId = searchParams.get('exam_id');
    const qClassId = searchParams.get('class_id');
    const qSectionId = searchParams.get('section_id');
    const qYearId = searchParams.get('academic_year_id');
    if (qYearId) setSelectedAcademicYearId(qYearId);
    if (qClassId) { handleClassChange(qClassId); setValue('class_id', qClassId); }
    if (qSectionId) { handleSectionChange(qSectionId); setValue('section_id', qSectionId); }
    if (qExamId) setValue('exam_id', qExamId);
  }, []);

  const studentResults = studentId
    ? results.filter((r) => r.student_id === studentId)
    : results;

  const studentName = studentResults[0]?.student_name ?? '—';

  const totalMax = studentResults.reduce((a, r) => a + r.max_marks, 0);
  const totalScored = studentResults.reduce(
    (a, r) =>
      a + (r.is_absent ? 0 : r.marks_obtained != null ? parseFloat(r.marks_obtained) : 0),
    0,
  );
  const percentage = totalMax > 0 ? ((totalScored / totalMax) * 100).toFixed(2) : '—';

  const selectedExam = exams.find((e) => e.id === watchedExamId);

  return (
    <Div type="col" gap="lg" className="max-w-5xl">
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} /> {RESULT_MARKS_PAGE.buttons.back}
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <H1>{studentId ? `${studentName} — Result` : 'Result Detail'}</H1>
          {selectedExam && (
            <P color="muted">
              {selectedExam.exam_name} ·{' '}
              {EXAM_TERM_LABELS[selectedExam.exam_term] ?? selectedExam.exam_term}
            </P>
          )}
        </Div>
      </Div>

      <Div className="rounded-xl border border-border bg-card p-5" type="col" gap="md">
        <H3 className="text-xs font-semibold uppercase tracking-wider">Filter</H3>
        <Div type="row" gap="md" wrap>
          <FormField label="Academic Year">
            <Select
              width="sm"
              value={selectedAcademicYearId}
              onChange={(e) => {
                setSelectedAcademicYearId(e.target.value);
                setValue('academic_year_id', e.target.value);
                handleClassChange('');
                setValue('class_id', '');
                setValue('exam_id', '');
              }}
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Class">
            <Select
              width="sm"
              value={selectedClassId}
              onChange={(e) => {
                handleClassChange(e.target.value);
                setValue('class_id', e.target.value);
                setValue('exam_id', '');
              }}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Section">
            <Select
              width="sm"
              value={selectedSectionId}
              onChange={(e) => {
                handleSectionChange(e.target.value);
                setValue('section_id', e.target.value);
              }}
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Exam">
            <Select
              width="md"
              value={watchedExamId}
              {...register('exam_id')}
              onChange={(e) => setValue('exam_id', e.target.value)}
            >
              <option value="">Select Exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.exam_name} — {EXAM_TERM_LABELS[e.exam_term] ?? e.exam_term}
                </option>
              ))}
            </Select>
          </FormField>
        </Div>
      </Div>

      {isLoadingResults ? (
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      ) : studentResults.length === 0 ? (
        <Div
          type="col"
          gap="sm"
          align="center"
          className="rounded-xl border border-dashed border-border py-16"
        >
          <BookOpen size={32} className="text-muted-foreground/40" />
          <P color="muted">No results found. Select exam and class to view.</P>
        </Div>
      ) : (
        <Div type="col" gap="md">
          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>S.No.</TableHeaderCell>
                <TableHeaderCell>Subject</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Max Marks</TableHeaderCell>
                <TableHeaderCell>Marks Obtained</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {studentResults.map((r, idx) => (
                <TableRow key={r.id ?? `${r.student_id}-${r.exam_schedule_id}`}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell primary>{r.subject_name}</TableCell>
                  <TableCell>
                    {RESULT_MARKS_PAGE.subjectTypes[r.subject_type] ?? r.subject_type}
                  </TableCell>
                  <TableCell>{r.max_marks}</TableCell>
                  <TableCell>
                    {r.is_absent ? (
                      <Badge variant="warning">Absent</Badge>
                    ) : (
                      <Div className="font-medium">{r.marks_obtained ?? '—'}</Div>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.is_published ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="default">Draft</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Div className="rounded-xl border border-border bg-card p-5" type="col" gap="sm">
            <H3 className="text-xs font-semibold uppercase tracking-wider mb-1">Summary</H3>
            <Div type="grid" cols={3} gap="md">
              <Div color="default">
                <P color="muted" className="text-xs mb-1">Total Marks</P>
                <H2>{totalMax}</H2>
              </Div>
              <Div color="green">
                <P color="muted" className="text-xs mb-1">Marks Obtained</P>
                <H2>{totalScored}</H2>
              </Div>
              <Div color="default">
                <P color="muted" className="text-xs mb-1">Percentage</P>
                <H2>{percentage}%</H2>
              </Div>
            </Div>
          </Div>
        </Div>
      )}
    </Div>
  );
}

export default function MarksViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <MarksViewContent />
    </Suspense>
  );
}
