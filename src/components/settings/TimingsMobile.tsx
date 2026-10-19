"use client";

import { useState } from "react";
import { CalendarRange, Clock, Pencil, Timer, Trash2 } from "lucide-react";
import {
  ActionSheet,
  Badge,
  ChoiceChips,
  FieldRow,
  FormGroup,
  MobileListCard,
  MobileDayPicker,
  MobileListScreen,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useBackLayer } from "@/hooks/useBackLayer";
import { useStepper } from "@/hooks/useStepper";
import {
  TIMING_TYPE_BADGE,
  TIMING_TYPE_OPTIONS,
  TIMINGS_PAGE,
  WORKING_DAY_OPTIONS,
} from "@/constants/school-settings.constants";
import type { CreateSchoolTimingPayload, SchoolTiming } from "@/types/school-settings.types";

const STEPS = [
  { id: "schedule", label: "Schedule" },
  { id: "rules", label: "Attendance" },
  { id: "validity", label: "Validity" },
] as const;

type TimingBadgeVariant = "default" | "info" | "warning" | "success" | "danger";

const BADGE_VARIANT: Record<string, TimingBadgeVariant> = {
  warning: "warning",
  info: "info",
  destructive: "danger",
  success: "success",
};

function trimSeconds(time: string | null | undefined) {
  if (!time) return "";
  return time.length > 5 ? time.slice(0, 5) : time;
}

function workingDaysLabel(workingDays: string) {
  const active = workingDays.split(",").filter(Boolean);
  return WORKING_DAY_OPTIONS.filter((d) => active.includes(d.value))
    .map((d) => d.label)
    .join(", ");
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface TimingMobileFormProps {
  form: CreateSchoolTimingPayload;
  updateForm: <K extends keyof CreateSchoolTimingPayload>(
    key: K,
    value: CreateSchoolTimingPayload[K],
  ) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onClose: () => void;
}

function TimingMobileForm({
  form,
  updateForm,
  isEditing,
  isSubmitting,
  onSubmit,
  onClose,
}: TimingMobileFormProps) {
  const stepper = useStepper(STEPS);
  useBackLayer(true, onClose);

  const numberField = (key: "grace_period_minutes" | "period_duration_minutes" | "priority") => ({
    type: "number" as const,
    inputMode: "numeric" as const,
    value: form[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      updateForm(key, Number(e.target.value)),
  });

  const timeField = (
    key:
      | "school_start_time"
      | "school_end_time"
      | "late_cutoff_time"
      | "half_day_cutoff_time"
      | "absent_cutoff_time"
      | "lunch_start_time"
      | "lunch_end_time",
  ) => ({
    type: "time" as const,
    value: form[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateForm(key, e.target.value),
  });

  return (
    <MultiStepForm
      title={isEditing ? "Edit schedule" : "New schedule"}
      steps={stepper.progress}
      activeId={stepper.activeId}
      onSelectStep={stepper.goTo}
      isFirst={stepper.isFirst}
      isLast={stepper.isLast}
      onBack={stepper.back}
      onNext={stepper.next}
      onSubmit={onSubmit}
      submitLabel={isEditing ? "Update schedule" : "Create schedule"}
      isSubmitting={isSubmitting}
      quickSave={isEditing}
      onCancel={onClose}
    >
      <StepPanel id="schedule">
        <StepHeader
          icon={<Clock size={22} />}
          title="School hours"
          description="When the day starts and ends."
        />
        <FormGroup>
          <MobileTextField
            label="Name"
            placeholder="e.g. Summer schedule"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
          />
          <ChoiceChips
            label="Type"
            value={form.timing_type}
            onChange={(value) => updateForm("timing_type", value as typeof form.timing_type)}
            options={TIMING_TYPE_OPTIONS}
          />
          <FieldRow>
            <MobileTextField label="Starts" {...timeField("school_start_time")} />
            <MobileTextField label="Ends" {...timeField("school_end_time")} />
          </FieldRow>
        </FormGroup>
        <FormGroup title="Working days">
          <MobileDayPicker
            value={form.working_days ?? ""}
            onChange={(value) => updateForm("working_days", value)}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="rules">
        <StepHeader
          icon={<Timer size={22} />}
          title="Attendance rules"
          description="Cutoffs that mark students late, half-day or absent."
        />
        <FormGroup title="Cutoffs">
          <MobileTextField label="Grace period (min)" {...numberField("grace_period_minutes")} />
          <MobileTextField label="Late after" {...timeField("late_cutoff_time")} />
          <MobileTextField label="Half day after" {...timeField("half_day_cutoff_time")} />
          <MobileTextField label="Absent after" {...timeField("absent_cutoff_time")} />
        </FormGroup>
        <FormGroup title="Lunch break" description="Optional">
          <FieldRow>
            <MobileTextField label="From" {...timeField("lunch_start_time")} />
            <MobileTextField label="To" {...timeField("lunch_end_time")} />
          </FieldRow>
        </FormGroup>
      </StepPanel>

      <StepPanel id="validity">
        <StepHeader
          icon={<CalendarRange size={22} />}
          title="Validity"
          description="When this schedule applies."
        />
        <FormGroup>
          <FieldRow>
            <MobileTextField
              label="From"
              type="date"
              value={form.effective_from}
              onChange={(e) => updateForm("effective_from", e.target.value)}
            />
            <MobileTextField
              label="To"
              type="date"
              value={form.effective_to}
              onChange={(e) => updateForm("effective_to", e.target.value)}
            />
          </FieldRow>
          <FieldRow>
            <MobileTextField label="Period (min)" {...numberField("period_duration_minutes")} />
            <MobileTextField label="Priority" {...numberField("priority")} />
          </FieldRow>
          <p className="px-1 text-xs text-muted-foreground">
            When schedules overlap, the one with the higher priority wins.
          </p>
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export interface TimingsMobileProps extends Omit<TimingMobileFormProps, "isEditing"> {
  timings: ReadonlyArray<SchoolTiming>;
  isLoading: boolean;
  isDialogOpen: boolean;
  isEditing: boolean;
  onCreate: () => void;
  onEdit: (timing: SchoolTiming) => void;
  onDelete: (id: string) => void;
  onRefresh: () => Promise<unknown> | void;
}

export function TimingsMobile({
  timings,
  isLoading,
  isDialogOpen,
  isEditing,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  ...formProps
}: TimingsMobileProps) {
  const [actionTarget, setActionTarget] = useState<SchoolTiming | null>(null);

  if (isDialogOpen) {
    return <TimingMobileForm isEditing={isEditing} {...formProps} />;
  }

  return (
    <>
      <MobileListScreen
        onRefresh={onRefresh}
        countLabel={`${timings.length} ${timings.length === 1 ? "schedule" : "schedules"}`}
        isLoading={isLoading}
        isEmpty={timings.length === 0}
        emptyIcon={<Clock size={28} />}
        emptyTitle="No timing schedules yet"
        emptyDescription="Add seasonal or special schedules to control school hours and late rules."
        fab={{ label: TIMINGS_PAGE.addButton, onClick: onCreate }}
      >
        <ul className="flex flex-col gap-2.5">
          {timings.map((timing) => {
            const badge = TIMING_TYPE_BADGE[timing.timing_type];
            return (
              <li key={timing.id}>
                <MobileListCard
                  leading={
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-text">
                      <Clock size={20} />
                    </span>
                  }
                  title={timing.name}
                  subtitle={`${trimSeconds(timing.school_start_time)} – ${trimSeconds(timing.school_end_time)} · ${workingDaysLabel(timing.working_days)}`}
                  badge={
                    <Badge variant={BADGE_VARIANT[badge.variant] ?? "default"}>{badge.label}</Badge>
                  }
                  muted={!timing.is_active}
                  onClick={() => onEdit(timing)}
                  onMore={() => setActionTarget(timing)}
                  moreLabel={`Actions for ${timing.name}`}
                />
              </li>
            );
          })}
        </ul>
      </MobileListScreen>

      <ActionSheet
        isOpen={actionTarget !== null}
        onClose={() => setActionTarget(null)}
        title={actionTarget?.name}
        actions={
          actionTarget
            ? [
                {
                  label: "Edit",
                  icon: <Pencil size={18} />,
                  onClick: () => onEdit(actionTarget),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={18} />,
                  destructive: true,
                  confirm: {
                    title: `Delete ${actionTarget.name}?`,
                    description: "This schedule will stop applying. This cannot be undone.",
                    confirmLabel: "Delete",
                  },
                  onClick: () => onDelete(actionTarget.id),
                },
              ]
            : []
        }
      />
    </>
  );
}
