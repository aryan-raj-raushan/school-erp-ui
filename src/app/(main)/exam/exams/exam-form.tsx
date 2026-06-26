"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { useExamDetail } from "@/hooks/exam/useExams";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  Button,
  Spinner,
  FormField,
  Input,
  Select,
  Badge,
} from "@/components/ui";
import {
  EXAMS_PAGE,
  EXAM_ROUTES,
  EXAM_TERM_OPTIONS,
} from "@/constants/exam.constants";

export function ExamFormContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const {
    exam,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
  } = useExamDetail(slug);

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const watchedAcademicYearId = watch("academic_year_id");

  const {
    years,
    classes,
    currentYear,
    setSelectedAcademicYearId,
    handleClassChange,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  // Sync academic year selection into form
  useEffect(() => {
    if (isNew && currentYear && !watchedAcademicYearId) {
      setValue("academic_year_id", currentYear.id);
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [
    isNew,
    currentYear,
    watchedAcademicYearId,
    setValue,
    setSelectedAcademicYearId,
  ]);

  useEffect(() => {
    if (watchedAcademicYearId) setSelectedAcademicYearId(watchedAcademicYearId);
  }, [watchedAcademicYearId, setSelectedAcademicYearId]);

  useEffect(() => {
    if (isEditMode) setIsEditing(true);
  }, [isEditMode, setIsEditing]);

  if (isLoading) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  const isReadOnly = !isEditing;

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      <PageHeader
        title={isNew ? "Add New Exam" : (exam?.exam_name ?? "Exam")}
        subtitle={!isNew && exam ? `Term: ${exam.exam_term}` : ""}
        actions={
          <Div type="row" gap="sm" align="center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(EXAM_ROUTES.exams.list)}
            >
              <ArrowLeft size={14} /> {EXAMS_PAGE.buttons.back}
            </Button>
            {!isNew && !isEditing && (
              <>
                <Badge variant={exam?.is_published ? "success" : "warning"}>
                  {exam?.is_published ? "Published" : "Draft"}
                </Badge>
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil size={14} /> {EXAMS_PAGE.buttons.edit}
                </Button>
              </>
            )}
            {isEditing && !isNew && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                {EXAMS_PAGE.buttons.cancel}
              </Button>
            )}
          </Div>
        }
      />

      <form onSubmit={onSubmit}>
        <Div variant="card" className="p-6">
          <Div type="col" gap="md">
            <Div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={EXAMS_PAGE.labels.academicYear + " *"}
                error={errors.academic_year_id?.message}
              >
                <Select
                  {...register("academic_year_id")}
                  disabled={isReadOnly || !isNew}
                  onChange={(e) => {
                    setValue("academic_year_id", e.target.value);
                    setValue("class_id", "");
                    setSelectedAcademicYearId(e.target.value);
                  }}
                >
                  <option value="">Select academic year</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                      {y.is_current ? " (Current)" : ""}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={EXAMS_PAGE.labels.class + " *"}
                error={errors.class_id?.message}
              >
                <Select
                  {...register("class_id")}
                  disabled={isReadOnly || !watchedAcademicYearId}
                  onChange={(e) => {
                    setValue("class_id", e.target.value);
                    handleClassChange(e.target.value);
                  }}
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label={EXAMS_PAGE.labels.examName + " *"}
                error={errors.exam_name?.message}
              >
                <Input
                  {...register("exam_name")}
                  placeholder="e.g. Mid-Term Examination 2025"
                  disabled={isReadOnly}
                />
              </FormField>

              <FormField
                label={EXAMS_PAGE.labels.examTerm + " *"}
                error={errors.exam_term?.message}
              >
                <Select {...register("exam_term")} disabled={isReadOnly}>
                  {EXAM_TERM_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <Div />

              <FormField
                label={EXAMS_PAGE.labels.startDate + " *"}
                error={errors.start_date?.message}
              >
                <Input
                  {...register("start_date")}
                  type="date"
                  disabled={isReadOnly}
                />
              </FormField>

              <FormField
                label={EXAMS_PAGE.labels.endDate + " *"}
                error={errors.end_date?.message}
              >
                <Input
                  {...register("end_date")}
                  type="date"
                  disabled={isReadOnly}
                />
              </FormField>
            </Div>

            <Div type="row" gap="lg">
              <Div type="row" align="center" gap="sm">
                <input
                  type="checkbox"
                  id="include_in_marks"
                  {...register("include_in_marks")}
                  className="h-4 w-4 rounded border-border"
                  disabled={isReadOnly}
                />
                <label
                  htmlFor="include_in_marks"
                  className="text-sm text-foreground"
                >
                  {EXAMS_PAGE.labels.includeInMarks}
                </label>
              </Div>
              <Div type="row" align="center" gap="sm">
                <input
                  type="checkbox"
                  id="is_enabled"
                  {...register("is_enabled")}
                  className="h-4 w-4 rounded border-border"
                  disabled={isReadOnly}
                />
                <label htmlFor="is_enabled" className="text-sm text-foreground">
                  {EXAMS_PAGE.labels.isEnabled}
                </label>
              </Div>
            </Div>

            {isEditing && (
              <Div type="row" gap="md" className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    isNew
                      ? router.push(EXAM_ROUTES.exams.list)
                      : setIsEditing(false)
                  }
                >
                  {EXAMS_PAGE.buttons.cancel}
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {EXAMS_PAGE.buttons.save}
                </Button>
              </Div>
            )}
          </Div>
        </Div>
      </form>
    </Div>
  );
}
