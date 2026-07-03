'use client';

import { useClassSubjectTeacherMap } from '@/hooks/useClassSubjectTeacherMap';
import { CLASS_SUBJECT_TEACHER_PAGE } from '@/constants';
import {
  Div, Button, PageHeader, PageCol,
  FormField, Spinner, EmptyState,
  ResponsiveSelect,
} from '@/components/ui';

export default function SubjectTeacherMapPage() {
  const {
    years, academicYearId, setAcademicYearId,
    classes, classId, setClassId,
    subjects, teachers, teacherBySubject, setTeacherForSubject,
    isLoadingData, isSaving, saveMapping,
  } = useClassSubjectTeacherMap();

  return (
    <PageCol>
      <PageHeader
        title={CLASS_SUBJECT_TEACHER_PAGE.title}
        subtitle={CLASS_SUBJECT_TEACHER_PAGE.subtitle}
      />

      <Div type="row" gap="md" align="end" wrap>
        <Div type="col" gap="xs">
          <FormField label={CLASS_SUBJECT_TEACHER_PAGE.academicYearLabel}>
            <ResponsiveSelect
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              options={years.map((y) => ({ value: y.id, label: y.name }))}
            />
          </FormField>
        </Div>
        <Div type="col" gap="xs">
          <FormField label={CLASS_SUBJECT_TEACHER_PAGE.classLabel}>
            <ResponsiveSelect
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              customPlaceholder="Select Class"
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
          </FormField>
        </Div>
      </Div>

      {!classId ? (
        <EmptyState title={CLASS_SUBJECT_TEACHER_PAGE.selectClassPrompt} />
      ) : isLoadingData ? (
        <Div type="col" align="center" justify="center" className="py-20">
          <Spinner />
        </Div>
      ) : subjects.length === 0 ? (
        <EmptyState title={CLASS_SUBJECT_TEACHER_PAGE.empty} />
      ) : (
        <Div type="col" gap="lg">
          <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
            <Div type="grid" cols={2} gap="sm" className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-1">
              <span>{CLASS_SUBJECT_TEACHER_PAGE.table.subject}</span>
              <span>{CLASS_SUBJECT_TEACHER_PAGE.table.teacher}</span>
            </Div>
            {subjects.map((subject) => (
              <Div type="grid" cols={2} gap="sm" key={subject.id} className="items-center py-1">
                <span className="text-sm font-medium">{subject.name}</span>
                <ResponsiveSelect
                  value={teacherBySubject[subject.id] ?? ''}
                  onChange={(e) => setTeacherForSubject(subject.id, e.target.value)}
                  customPlaceholder={CLASS_SUBJECT_TEACHER_PAGE.teacherPlaceholder}
                  options={teachers.map((t) => ({ value: t.id, label: [t.first_name, t.last_name].filter(Boolean).join(' ') }))}
                />
              </Div>
            ))}
          </Div>

          <Div type="row" justify="end">
            <Button loading={isSaving} onClick={saveMapping}>{CLASS_SUBJECT_TEACHER_PAGE.saveButton}</Button>
          </Div>
        </Div>
      )}
    </PageCol>
  );
}
