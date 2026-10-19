"use client";

import { useMemo } from "react";
import { useClassSubjectTeacherMap } from "@/hooks/useClassSubjectTeacherMap";
import { CLASS_SUBJECT_TEACHER_PAGE } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { Div, Button, PageHeader, PageCol, Spinner, EmptyState, ResponsiveSelect, FilterToolbar, type FilterField, MobileSelectField, StickyActionBar, Span } from "@/components/ui";

export default function SubjectTeacherMapPage() {
  const isMobile = useIsMobile();
  const {
    years,
    academicYearId,
    setAcademicYearId,
    classes,
    classId,
    setClassId,
    subjects,
    teachers,
    teacherBySubject,
    setTeacherForSubject,
    isLoadingData,
    isSaving,
    saveMapping,
  } = useClassSubjectTeacherMap();

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "academic_year_id",
        label: CLASS_SUBJECT_TEACHER_PAGE.academicYearLabel,
        placeholder: "Select Academic Year",
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
      },
      {
        type: "select",
        key: "class_id",
        label: CLASS_SUBJECT_TEACHER_PAGE.classLabel,
        placeholder: "Select Class",
        options: classes.map((c) => ({ value: c.id, label: c.name })),
      },
    ],
    [years, classes],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: academicYearId || undefined,
    class_id: classId || undefined,
  };

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ("academic_year_id" in next) setAcademicYearId(next.academic_year_id ?? "");
    if ("class_id" in next) setClassId(next.class_id ?? "");
  }

  function handleClearFilters() {
    handleFilterChange({ academic_year_id: undefined, class_id: undefined });
  }

  return (
    <PageCol>
      <PageHeader
        title={CLASS_SUBJECT_TEACHER_PAGE.title}
        subtitle={CLASS_SUBJECT_TEACHER_PAGE.subtitle}
      />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        sheetTitle="Filter"
      />

      {!classId ? (
        <EmptyState title={CLASS_SUBJECT_TEACHER_PAGE.selectClassPrompt} />
      ) : isLoadingData ? (
        <Div type="col" align="center" justify="center" className="py-20">
          <Spinner />
        </Div>
      ) : subjects.length === 0 ? (
        <EmptyState title={CLASS_SUBJECT_TEACHER_PAGE.empty} />
      ) : isMobile ? (
        <Div type="col" gap="sm">
          {subjects.map((subject) => (
            <MobileSelectField
              key={subject.id}
              label={subject.name}
              value={teacherBySubject[subject.id] ?? ""}
              onChange={(value) => setTeacherForSubject(subject.id, value)}
              placeholder={CLASS_SUBJECT_TEACHER_PAGE.teacherPlaceholder}
              options={teachers.map((t) => ({
                value: t.id,
                label: [t.first_name, t.last_name].filter(Boolean).join(" "),
              }))}
            />
          ))}
          <StickyActionBar>
            <Button size="lg" className="flex-1" loading={isSaving} onClick={saveMapping}>
              {CLASS_SUBJECT_TEACHER_PAGE.saveButton}
            </Button>
          </StickyActionBar>
        </Div>
      ) : (
        <Div type="col" gap="lg">
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <Div
              type="grid"
              cols={2}
              gap="sm"
              className="grid-cols-2 font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-1"
            >
              <Span>{CLASS_SUBJECT_TEACHER_PAGE.table.subject}</Span>
              <Span>{CLASS_SUBJECT_TEACHER_PAGE.table.teacher}</Span>
            </Div>
            {subjects.map((subject) => (
              <Div
                type="grid"
                cols={2}
                gap="sm"
                key={subject.id}
                className="grid-cols-2 items-center py-1"
              >
                <Span className="text-sm font-medium">{subject.name}</Span>
                <ResponsiveSelect
                  value={teacherBySubject[subject.id] ?? ""}
                  onChange={(e) =>
                    setTeacherForSubject(subject.id, e.target.value)
                  }
                  customPlaceholder={
                    CLASS_SUBJECT_TEACHER_PAGE.teacherPlaceholder
                  }
                  options={teachers.map((t) => ({
                    value: t.id,
                    label: [t.first_name, t.last_name]
                      .filter(Boolean)
                      .join(" "),
                  }))}
                />
              </Div>
            ))}
          </Div>

          <Div type="row" justify="end">
            <Button loading={isSaving} onClick={saveMapping}>
              {CLASS_SUBJECT_TEACHER_PAGE.saveButton}
            </Button>
          </Div>
        </Div>
      )}
    </PageCol>
  );
}
