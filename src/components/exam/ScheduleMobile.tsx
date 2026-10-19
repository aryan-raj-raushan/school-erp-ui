"use client";

import type { UseFormReturn } from "react-hook-form";
import { CalendarClock, ListChecks, Pencil } from "lucide-react";
import {
  Badge,
  Button,
  ControlledChoiceChips,
  ControlledSelectField,
  ControlledToggleRow,
  DetailField,
  DetailGrid,
  DetailHero,
  DetailSection,
  FieldRow,
  FormGroup,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
  StickyActionBar,
} from "@/components/ui";
import { useMultiStepForm, type FormStep } from "@/hooks/useMultiStepForm";
import type { SingleScheduleInput, SingleScheduleValues } from "@/hooks/exam/useExamSchedule";
import { SCHEDULE_PAGE, SUBJECT_TYPE_OPTIONS } from "@/constants/exam.constants";
import { formatDate } from "@/lib/utils";
import type { ExamSchedule } from "@/types/exam.types";

const STEPS: ReadonlyArray<FormStep<SingleScheduleInput>> = [
  {
    id: "when",
    label: "Subject & time",
    fields: ["subject_name", "subject_type", "exam_date", "start_time", "end_time"],
  },
  {
    id: "marks",
    label: "Marks & room",
    fields: ["exam_marks", "passing_marks", "hall_detail_id", "sub_subject_enabled"],
  },
];

export interface ScheduleMobileFormProps {
  form: UseFormReturn<SingleScheduleInput, unknown, SingleScheduleValues>;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
  rooms: ReadonlyArray<{ id: string; room_name: string }>;
}

export function ScheduleMobileForm({
  form,
  isSubmitting,
  onSubmit,
  onCancel,
  rooms,
}: ScheduleMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  const wizard = useMultiStepForm({ form, steps: STEPS, submit: onSubmit });

  return (
    <MultiStepForm
      title="Edit schedule"
      steps={wizard.progress}
      activeId={wizard.activeId}
      onSelectStep={wizard.goTo}
      isFirst={wizard.isFirst}
      isLast={wizard.isLast}
      onBack={wizard.back}
      onNext={wizard.next}
      onSubmit={wizard.submit}
      submitLabel={SCHEDULE_PAGE.buttons.save}
      isSubmitting={isSubmitting}
      quickSave
      onCancel={onCancel}
    >
      <StepPanel id="when">
        <StepHeader
          icon={<CalendarClock size={22} />}
          title="Subject & time"
          description="What is examined, and when."
        />
        <FormGroup>
          <MobileTextField
            label={SCHEDULE_PAGE.labels.subject}
            required
            error={errors.subject_name?.message}
            {...register("subject_name")}
          />
          <ControlledChoiceChips
            control={control}
            name="subject_type"
            label={SCHEDULE_PAGE.labels.subjectType}
            options={SUBJECT_TYPE_OPTIONS}
          />
          <MobileTextField
            label={SCHEDULE_PAGE.labels.examDate}
            required
            type="date"
            error={errors.exam_date?.message}
            {...register("exam_date")}
          />
          <FieldRow>
            <MobileTextField
              label="Starts"
              required
              type="time"
              error={errors.start_time?.message}
              {...register("start_time")}
            />
            <MobileTextField
              label="Ends"
              required
              type="time"
              error={errors.end_time?.message}
              {...register("end_time")}
            />
          </FieldRow>
        </FormGroup>
      </StepPanel>

      <StepPanel id="marks">
        <StepHeader
          icon={<ListChecks size={22} />}
          title="Marks & room"
          description="Scoring and where it is held."
        />
        <FormGroup>
          <FieldRow>
            <MobileTextField
              label={SCHEDULE_PAGE.labels.examMarks}
              required
              type="number"
              inputMode="numeric"
              min={0}
              error={errors.exam_marks?.message}
              {...register("exam_marks")}
            />
            <MobileTextField
              label={SCHEDULE_PAGE.labels.passingMarks}
              required
              type="number"
              inputMode="numeric"
              min={0}
              error={errors.passing_marks?.message}
              {...register("passing_marks")}
            />
          </FieldRow>
          <ControlledSelectField
            control={control}
            name="hall_detail_id"
            label={SCHEDULE_PAGE.labels.room}
            placeholder="Select room"
            options={rooms.map((r) => ({ value: r.id, label: r.room_name }))}
          />
          <ControlledToggleRow
            control={control}
            name="sub_subject_enabled"
            label={SCHEDULE_PAGE.labels.subSubjectEnabled}
          />
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}

export interface ScheduleMobileViewProps {
  schedule: ExamSchedule;
  yearName: string;
  className: string;
  sectionName: string;
  examName: string;
  roomName?: string;
  subSchedules: ReadonlyArray<ExamSchedule>;
  onEdit: () => void;
}

export function ScheduleMobileView({
  schedule,
  yearName,
  className,
  sectionName,
  examName,
  roomName,
  subSchedules,
  onEdit,
}: ScheduleMobileViewProps) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      <DetailHero
        name={schedule.subject_name}
        subtitle={`${formatDate(schedule.exam_date)} · ${schedule.start_time.slice(0, 5)} – ${schedule.end_time.slice(0, 5)}`}
        meta={`${examName} · ${className}${sectionName !== "—" ? ` - ${sectionName}` : ""}`}
        badge={<Badge variant="warning">{schedule.subject_type.replace(/_/g, " ")}</Badge>}
      />

      <DetailSection title="Details" icon={<CalendarClock size={18} />}>
        <DetailGrid>
          <DetailField label="Academic year" value={yearName} />
          <DetailField label="Exam" value={examName} />
          <DetailField label="Class" value={className} />
          <DetailField label="Section" value={sectionName} />
          <DetailField label="Max marks" value={schedule.exam_marks} />
          <DetailField label="Passing marks" value={schedule.passing_marks} />
          <DetailField label="Room" value={roomName} />
          <DetailField label="Locked" value={schedule.locked ? "Yes" : "No"} />
        </DetailGrid>
      </DetailSection>

      {subSchedules.length > 0 && (
        <DetailSection title={`Sub-subjects (${subSchedules.length})`} icon={<ListChecks size={18} />}>
          <ul className="flex flex-col gap-3">
            {subSchedules.map((sub) => (
              <li key={sub.id} className="rounded-2xl border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-semibold">{sub.subject_name}</p>
                  <Badge variant="warning">{sub.subject_type.replace(/_/g, " ")}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(sub.exam_date)} · {sub.start_time.slice(0, 5)} – {sub.end_time.slice(0, 5)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Max {sub.exam_marks} · Pass {sub.passing_marks}
                </p>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {!schedule.locked && (
        <StickyActionBar>
          <Button type="button" size="lg" className="flex-1" onClick={onEdit}>
            <Pencil size={16} /> Edit schedule
          </Button>
        </StickyActionBar>
      )}
    </div>
  );
}
