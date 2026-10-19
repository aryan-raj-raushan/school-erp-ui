"use client";

import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { CalendarDays, Copy, GraduationCap, Pencil } from "lucide-react";
import {
  Badge,
  BottomSheet,
  Button,
  ControlledChoiceChips,
  ControlledToggleRow,
  DetailField,
  DetailGrid,
  DetailHero,
  DetailSection,
  FieldRow,
  FormGroup,
  MobileMultiSelectField,
  MobileSelectField,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
  StickyActionBar,
  type BadgeVariant,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { ExamFormValues } from "@/hooks/exam/useExams";
import { EXAMS_PAGE, EXAM_TERM_OPTIONS } from "@/constants/exam.constants";
import { formatDate } from "@/lib/utils";
import type { Exam, ExamStatus } from "@/types/exam.types";

const STATUS_BADGE: Record<ExamStatus, BadgeVariant> = {
  DRAFT: "default",
  UNDER_REVIEW: "warning",
  PUBLISHED: "success",
  STARTED: "info",
  COMPLETED: "success",
  LOCKED: "warning",
  ARCHIVED: "default",
};

const STEPS: ReadonlyArray<FormStep<ExamFormValues>> = [
  {
    id: "exam",
    label: "Exam",
    fields: ["academic_year_id", "class_ids", "exam_name", "exam_term"],
  },
  {
    id: "dates",
    label: "Dates",
    fields: ["start_date", "end_date", "include_in_marks", "is_enabled"],
  },
];

interface Option {
  id: string;
  name: string;
  is_current?: boolean;
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export interface ExamMobileFormProps {
  form: UseFormReturn<ExamFormValues>;
  isNew: boolean;
  isSubmitting: boolean;
  overlapWarning?: string | null;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
  years: ReadonlyArray<Option>;
  classes: ReadonlyArray<Option>;
  onYearChange: (yearId: string) => void;
}

export function ExamMobileForm({
  form,
  isNew,
  isSubmitting,
  overlapWarning,
  onSubmit,
  onCancel,
  years,
  classes,
  onYearChange,
}: ExamMobileFormProps) {
  const { control, register, watch, setValue, formState } = form;
  const errors = formState.errors;
  const yearId = watch("academic_year_id");

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  return (
    <MultiStepForm
      title={isNew ? "Add exam" : "Edit exam"}
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={EXAMS_PAGE.buttons.save}
      isSubmitting={isSubmitting}
      quickSave={!isNew}
      onCancel={onCancel}
    >
      <StepPanel id="exam">
        <StepHeader
          icon={<GraduationCap size={22} />}
          title="Exam details"
          description="Name, term and who sits it."
        />
        <FormGroup>
          <MobileSelectField
            label={EXAMS_PAGE.labels.academicYear}
            required
            disabled={!isNew}
            placeholder="Select academic year"
            value={yearId ?? ""}
            error={errors.academic_year_id?.message}
            onChange={(value) => {
              setValue("academic_year_id", value, { shouldValidate: true });
              setValue("class_ids", []);
              onYearChange(value);
            }}
            options={years.map((y) => ({
              value: y.id,
              label: `${y.name}${y.is_current ? " (Current)" : ""}`,
            }))}
          />
          <Controller
            control={control}
            name="class_ids"
            render={({ field, fieldState }) => (
              <MobileMultiSelectField
                label={EXAMS_PAGE.labels.class}
                required
                disabled={!yearId}
                placeholder={yearId ? "Select class(es)" : "Select academic year first"}
                value={field.value ?? []}
                onChange={field.onChange}
                options={classes.map((c) => ({ value: c.id, label: c.name }))}
                error={(fieldState.error as { message?: string } | undefined)?.message}
              />
            )}
          />
          <MobileTextField
            label={EXAMS_PAGE.labels.examName}
            required
            placeholder="e.g. Mid-Term Examination 2025"
            error={errors.exam_name?.message}
            {...register("exam_name")}
          />
          <ControlledChoiceChips
            control={control}
            name="exam_term"
            label={EXAMS_PAGE.labels.examTerm}
            required
            options={EXAM_TERM_OPTIONS}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="dates">
        <StepHeader
          icon={<CalendarDays size={22} />}
          title="Dates & settings"
          description="When the exam runs."
        />
        <FormGroup>
          <FieldRow>
            <MobileTextField
              label="Starts"
              type="date"
              required
              error={errors.start_date?.message}
              {...register("start_date")}
            />
            <MobileTextField
              label="Ends"
              type="date"
              required
              error={errors.end_date?.message}
              {...register("end_date")}
            />
          </FieldRow>
          <ControlledToggleRow
            control={control}
            name="include_in_marks"
            label={EXAMS_PAGE.labels.includeInMarks}
          />
          <ControlledToggleRow
            control={control}
            name="is_enabled"
            label={EXAMS_PAGE.labels.isEnabled}
          />
          {overlapWarning && (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {overlapWarning}
            </p>
          )}
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}

// ─── View ─────────────────────────────────────────────────────────────────────

export interface ExamMobileViewProps {
  exam: Exam;
  yearName?: string;
  classNames: ReadonlyArray<string>;
  allowedNextStatuses: ReadonlyArray<ExamStatus>;
  isChangingStatus: boolean;
  onChangeStatus: (status: ExamStatus) => void;
  onEdit: () => void;
  onCopy: () => void;
}

export function ExamMobileView({
  exam,
  yearName,
  classNames,
  allowedNextStatuses,
  isChangingStatus,
  onChangeStatus,
  onEdit,
  onCopy,
}: ExamMobileViewProps) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      <DetailHero
        name={exam.exam_name}
        subtitle={`${formatDate(exam.start_date)} → ${formatDate(exam.end_date)}`}
        meta={`Term: ${exam.exam_term}`}
        badge={
          <Badge variant={STATUS_BADGE[exam.status] ?? "default"}>
            {exam.status.replace(/_/g, " ")}
          </Badge>
        }
        actions={[
          { label: "Edit", icon: <Pencil size={18} />, onClick: onEdit },
          { label: "Copy", icon: <Copy size={18} />, onClick: onCopy },
        ]}
      />

      {allowedNextStatuses.length > 0 && (
        <section className="rounded-2xl border border-border/60 bg-white p-4 dark:bg-neutral-900">
          <h3 className="mb-3 text-sm font-semibold">Move to</h3>
          <div className="flex flex-wrap gap-2">
            {allowedNextStatuses.map((status) => (
              <Button
                key={status}
                variant="outline"
                loading={isChangingStatus}
                onClick={() => onChangeStatus(status)}
              >
                {status.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </section>
      )}

      <DetailSection title="Details" icon={<GraduationCap size={18} />}>
        <DetailGrid>
          <DetailField label="Academic year" value={yearName} />
          <DetailField label="Term" value={exam.exam_term} />
          <DetailField label="Starts" value={formatDate(exam.start_date)} />
          <DetailField label="Ends" value={formatDate(exam.end_date)} />
          <DetailField label="In final marks" value={exam.include_in_marks ? "Yes" : "No"} />
          <DetailField label="Enabled" value={exam.is_enabled ? "Yes" : "No"} />
          <DetailField wide label="Classes" value={classNames.join(", ")} />
        </DetailGrid>
      </DetailSection>

      <StickyActionBar>
        <Button type="button" size="lg" className="flex-1" onClick={onEdit}>
          <Pencil size={16} /> Edit exam
        </Button>
      </StickyActionBar>
    </div>
  );
}

// ─── Copy sheet ───────────────────────────────────────────────────────────────

export interface CopyExamSheetProps {
  years: ReadonlyArray<Option>;
  isCopying: boolean;
  onCopy: (targetYearId: string, newStartDate: string) => void;
  onDismiss: () => void;
}

export function CopyExamSheet({ years, isCopying, onCopy, onDismiss }: CopyExamSheetProps) {
  const [targetYearId, setTargetYearId] = useState("");
  const [newStartDate, setNewStartDate] = useState("");

  return (
    <BottomSheet
      isOpen
      onClose={onDismiss}
      title="Copy exam to another year"
      maxHeight="85dvh"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onDismiss}>
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-[2]"
            loading={isCopying}
            disabled={!targetYearId || !newStartDate}
            onClick={() => onCopy(targetYearId, newStartDate)}
          >
            <Copy size={16} /> Copy exam
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        <MobileSelectField
          label="Target academic year"
          required
          placeholder="Select year"
          value={targetYearId}
          onChange={setTargetYearId}
          options={years.map((y) => ({ value: y.id, label: y.name }))}
        />
        <MobileTextField
          label="New start date"
          type="date"
          required
          value={newStartDate}
          onChange={(e) => setNewStartDate(e.target.value)}
        />
        <p className="px-1 text-xs text-muted-foreground">
          Classes and subject schedule are cloned; dates shift by the same amount as the start date.
          Invigilators, halls and locks do not carry over.
        </p>
      </div>
    </BottomSheet>
  );
}
