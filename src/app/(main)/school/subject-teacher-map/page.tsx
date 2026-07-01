'use client';

import { useClassSubjectTeacherMap } from '@/hooks/useClassSubjectTeacherMap';
import { CLASS_SUBJECT_TEACHER_PAGE } from '@/constants';
import {
  Div, Button, PageHeader, PageCol,
  FormField, Select, Spinner, EmptyState,
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
            <Select value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)} width="md">
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </Select>
          </FormField>
        </Div>
        <Div type="col" gap="xs">
          <FormField label={CLASS_SUBJECT_TEACHER_PAGE.classLabel}>
            <Select value={classId} onChange={(e) => setClassId(e.target.value)} width="md">
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
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
                <Select
                  value={teacherBySubject[subject.id] ?? ''}
                  onChange={(e) => setTeacherForSubject(subject.id, e.target.value)}
                  width="md"
                >
                  <option value="">{CLASS_SUBJECT_TEACHER_PAGE.teacherPlaceholder}</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{[t.first_name, t.last_name].filter(Boolean).join(' ')}</option>
                  ))}
                </Select>
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
