"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Pencil, Copy } from "lucide-react";
import { useExamDetail } from "@/hooks/exam/useExams";
import { useExamLifecycle } from "@/hooks/exam/useExamLifecycle";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Div,
  P,
  Button,
  Spinner,
  FormField,
  Input,
  Select,
  Badge,
  MultiSelect,
  Modal,
  ModalBody,
  ModalFooter,
  PageHeader,
  type PageHeaderConfig,
  type BadgeVariant,
} from "@/components/ui";
import {
  EXAMS_PAGE,
  EXAM_ROUTES,
  EXAM_TERM_OPTIONS,
} from "@/constants/exam.constants";
import type { ExamStatus } from "@/types/exam.types";

const STATUS_BADGE: Record<ExamStatus, BadgeVariant> = {
  DRAFT: "default",
  UNDER_REVIEW: "warning",
  PUBLISHED: "success",
  STARTED: "info",
  COMPLETED: "success",
  LOCKED: "warning",
  ARCHIVED: "default",
};

function CopyExamModal({
  isCopying,
  onCopy,
  onDismiss,
}: {
  isCopying: boolean;
  onCopy: (targetYearId: string, newStartDate: string) => void;
  onDismiss: () => void;
}) {
  const { years } = useAcademicYears();
  const [targetYearId, setTargetYearId] = useState("");
  const [newStartDate, setNewStartDate] = useState("");

  return (
    <Modal title="Copy exam to another academic year" onClose={onDismiss} size="sm">
      <ModalBody>
        <Div type="col" gap="md">
          <FormField label="Target academic year *">
            <Select value={targetYearId} onChange={(e) => setTargetYearId(e.target.value)}>
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="New start date *">
            <Input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
          </FormField>
          <P className="text-xs text-muted-foreground">
            Classes and subject schedule are cloned; dates shift by the same amount as the start date.
            Invigilators, halls, and locks do not carry over.
          </P>
        </Div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onDismiss}>Cancel</Button>
        <Button
          size="sm"
          loading={isCopying}
          disabled={!targetYearId || !newStartDate}
          onClick={() => onCopy(targetYearId, newStartDate)}
        >
          <Copy size={13} /> Copy Exam
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function ExamFormContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const isMobile = useIsMobile();
  const [showCopyModal, setShowCopyModal] = useState(false);

  const {
    exam,
    setExam,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
    overlapWarning,
  } = useExamDetail(slug);

  const { allowedNextStatuses, isChangingStatus, changeStatus, isCopying, copyExam } =
    useExamLifecycle(exam, setExam);

  async function handleCopy(targetYearId: string, newStartDate: string) {
    const copied = await copyExam({ target_academic_year_id: targetYearId, new_start_date: newStartDate });
    if (copied) {
      setShowCopyModal(false);
      router.push(EXAM_ROUTES.exams.edit(copied.id));
    }
  }

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const watchedAcademicYearId = watch("academic_year_id");
  const watchedClassIds = watch("class_ids");

  const {
    years,
    classes,
    currentYear,
    setSelectedAcademicYearId,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  useEffect(() => {
    if (isNew && currentYear && !watchedAcademicYearId) {
      setValue("academic_year_id", currentYear.id);
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [isNew, currentYear, watchedAcademicYearId, setValue, setSelectedAcademicYearId]);

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

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));
  const classError = (errors.class_ids as { message?: string } | undefined)?.message;

  const pageHeaderConfig: PageHeaderConfig = {
    backButton: true,
    sticky: true,
    title: isNew ? "Add New Exam" : (exam?.exam_name ?? "Exam"),
    subtitle: !isNew && exam ? `Term: ${exam.exam_term}` : "",
    badge:
      !isNew && !isEditing && exam ? (
        <Badge variant={STATUS_BADGE[exam.status] ?? "default"}>
          {exam.status.replace(/_/g, " ")}
        </Badge>
      ) : undefined,
    actions: [
      {
        label: "Copy",
        icon: <Copy size={14} />,
        variant: "outline",
        showNoLabel: isMobile,
        hidden: isNew || isEditing,
        onClick: () => setShowCopyModal(true),
      },
      {
        label: EXAMS_PAGE.buttons.edit,
        icon: <Pencil size={14} />,
        showNoLabel: isMobile,
        hidden: isNew || isEditing,
        onClick: () => setIsEditing(true),
      },
      {
        label: EXAMS_PAGE.buttons.cancel,
        variant: "outline",
        hidden: isNew || !isEditing,
        onClick: () => setIsEditing(false),
      },
    ],
  };

  return (
    <Div type="col" gap="md" className="max-w-4xl">
      <PageHeader {...pageHeaderConfig} />

      {!isNew && !isEditing && exam && allowedNextStatuses.length > 0 && (
        <Div variant="card" className="p-4">
          <Div type="row" align="center" gap="sm" wrap>
            <P size="sm" weight="semibold">Move to:</P>
            <Div type="row" gap="xs" wrap>
              {allowedNextStatuses.map((s) => (
                <Button
                  key={s}
                  size="xs"
                  variant="outline"
                  loading={isChangingStatus}
                  onClick={() => changeStatus(s)}
                >
                  {s.replace(/_/g, " ")}
                </Button>
              ))}
            </Div>
          </Div>
        </Div>
      )}

      <form onSubmit={onSubmit}>
        <Div variant="card" className="p-5 sm:p-6">
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
                    setValue("class_ids", []);
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
                label={
                  isNew
                    ? `${EXAMS_PAGE.labels.class} * (multi-select)`
                    : `${EXAMS_PAGE.labels.class} *`
                }
                error={classError}
              >
                <MultiSelect
                  options={classOptions}
                  value={watchedClassIds ?? []}
                  onChange={(ids) =>
                    setValue("class_ids", ids, { shouldValidate: true })
                  }
                  placeholder={
                    !watchedAcademicYearId
                      ? "Select academic year first"
                      : "Select class(es)..."
                  }
                  disabled={isReadOnly || !watchedAcademicYearId}
                  error={!!classError}
                />
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

            <Div type="row" gap="lg" wrap>
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

            {isEditing && overlapWarning && (
              <Div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3">
                <P size="sm" className="text-red-700 dark:text-red-400">
                  {overlapWarning}
                </P>
              </Div>
            )}

            {isEditing && (
              <Div type="row" gap="md" className="pt-2 border-t border-border">
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
                <Button type="submit" loading={isSubmitting} disabled={!!overlapWarning}>
                  {EXAMS_PAGE.buttons.save}
                </Button>
              </Div>
            )}
          </Div>
        </Div>
      </form>

      {showCopyModal && (
        <CopyExamModal
          isCopying={isCopying}
          onCopy={handleCopy}
          onDismiss={() => setShowCopyModal(false)}
        />
      )}
    </Div>
  );
}
