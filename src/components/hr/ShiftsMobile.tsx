"use client";

import { useState } from "react";
import { CalendarRange, Clock, Pencil, Trash2, UserRound } from "lucide-react";
import {
  ActionSheet,
  Badge,
  ChoiceChips,
  FieldRow,
  FormGroup,
  MobileDayPicker,
  MobileListCard,
  MobileListScreen,
  MobileSelectField,
  MobileTextField,
  MultiStepForm,
  StepHeader,
  StepPanel,
} from "@/components/ui";
import { useBackLayer } from "@/hooks/useBackLayer";
import { useStepper } from "@/hooks/useStepper";
import {
  SHIFT_TYPE_BADGE,
  SHIFT_TYPE_OPTIONS,
  STAFF_SHIFTS_PAGE,
} from "@/constants/staff-shifts.constants";
import type {
  CreateStaffShiftPayload,
  ShiftType,
  StaffShift,
} from "@/types/staff-shifts.types";

const STEPS = [
  { id: "who", label: "Shift" },
  { id: "timing", label: "Timing" },
  { id: "validity", label: "Validity" },
] as const;

type ShiftBadgeVariant = "default" | "info" | "warning" | "success" | "danger";

const BADGE_VARIANT: Record<string, ShiftBadgeVariant> = {
  info: "info",
  warning: "warning",
  success: "success",
};

interface FormProps {
  form: CreateStaffShiftPayload;
  updateForm: <K extends keyof CreateStaffShiftPayload>(
    key: K,
    value: CreateStaffShiftPayload[K],
  ) => void;
  staff: ReadonlyArray<{ id: string; first_name: string; last_name?: string | null }>;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onClose: () => void;
}

function ShiftMobileForm({
  form,
  updateForm,
  staff,
  isEditing,
  isSubmitting,
  onSubmit,
  onClose,
}: FormProps) {
  const stepper = useStepper(STEPS);
  useBackLayer(true, onClose);

  return (
    <MultiStepForm
      title={isEditing ? "Edit shift" : "Assign shift"}
      steps={stepper.progress}
      activeId={stepper.activeId}
      onSelectStep={stepper.goTo}
      isFirst={stepper.isFirst}
      isLast={stepper.isLast}
      onBack={stepper.back}
      onNext={stepper.next}
      onSubmit={onSubmit}
      submitLabel={isEditing ? "Update" : "Assign"}
      isSubmitting={isSubmitting}
      quickSave={isEditing}
      onCancel={onClose}
    >
      <StepPanel id="who">
        <StepHeader
          icon={<UserRound size={22} />}
          title="Who and which shift"
          description="Pick the staff member and shift type."
        />
        <FormGroup>
          {!isEditing && (
            <MobileSelectField
              label="Staff member"
              required
              placeholder="Select staff"
              value={form.staff_id}
              onChange={(value) => updateForm("staff_id", value)}
              options={staff.map((s) => ({
                value: s.id,
                label: `${s.first_name} ${s.last_name ?? ""}`.trim(),
              }))}
            />
          )}
          <MobileTextField
            label="Shift name"
            placeholder="Morning shift"
            value={form.shift_name}
            onChange={(e) => updateForm("shift_name", e.target.value)}
          />
          <ChoiceChips
            label="Shift type"
            value={form.shift_type}
            onChange={(value) => updateForm("shift_type", value as ShiftType)}
            options={SHIFT_TYPE_OPTIONS}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="timing">
        <StepHeader
          icon={<Clock size={22} />}
          title="Timing"
          description="Hours, grace period and working days."
        />
        <FormGroup>
          <FieldRow>
            <MobileTextField
              label="Starts"
              type="time"
              value={form.shift_start}
              onChange={(e) => updateForm("shift_start", e.target.value)}
            />
            <MobileTextField
              label="Ends"
              type="time"
              value={form.shift_end}
              onChange={(e) => updateForm("shift_end", e.target.value)}
            />
          </FieldRow>
          <MobileTextField
            label="Grace period (min)"
            type="number"
            inputMode="numeric"
            value={form.grace_period_minutes ?? ""}
            onChange={(e) => updateForm("grace_period_minutes", Number(e.target.value))}
          />
        </FormGroup>
        <FormGroup title="Working days">
          <MobileDayPicker
            value={form.working_days ?? ""}
            onChange={(value) => updateForm("working_days", value)}
          />
        </FormGroup>
      </StepPanel>

      <StepPanel id="validity">
        <StepHeader
          icon={<CalendarRange size={22} />}
          title="Validity"
          description="When this shift applies."
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
        </FormGroup>
      </StepPanel>
    </MultiStepForm>
  );
}

export interface ShiftsMobileProps extends Omit<FormProps, "isEditing"> {
  shifts: ReadonlyArray<StaffShift>;
  isLoading: boolean;
  isDialogOpen: boolean;
  isEditing: boolean;
  getStaffName: (staffId: string) => string;
  onCreate: () => void;
  onEdit: (shift: StaffShift) => void;
  onDelete: (id: string) => void;
}

export function ShiftsMobile({
  shifts,
  isLoading,
  isDialogOpen,
  isEditing,
  getStaffName,
  onCreate,
  onEdit,
  onDelete,
  ...formProps
}: ShiftsMobileProps) {
  const [actionTarget, setActionTarget] = useState<StaffShift | null>(null);

  if (isDialogOpen) {
    return <ShiftMobileForm isEditing={isEditing} {...formProps} />;
  }

  return (
    <>
      <MobileListScreen
        onRefresh={() => undefined}
        countLabel={`${shifts.length} ${shifts.length === 1 ? "shift" : "shifts"}`}
        isLoading={isLoading}
        isEmpty={shifts.length === 0}
        emptyIcon={<Clock size={28} />}
        emptyTitle="No shifts assigned"
        emptyDescription="Assign shifts to staff members to enable automatic late/absent detection."
        fab={{ label: STAFF_SHIFTS_PAGE.addButton, onClick: onCreate }}
      >
        <ul className="flex flex-col gap-2.5">
          {shifts.map((shift) => {
            const badge = SHIFT_TYPE_BADGE[shift.shift_type as ShiftType];
            return (
              <li key={shift.id}>
                <MobileListCard
                  leading={
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-text">
                      <Clock size={20} />
                    </span>
                  }
                  title={getStaffName(shift.staff_id)}
                  subtitle={`${shift.shift_name} · ${shift.shift_start} – ${shift.shift_end}`}
                  badge={<Badge variant={BADGE_VARIANT[badge.variant] ?? "default"}>{badge.label}</Badge>}
                  muted={!shift.is_active}
                  onClick={() => onEdit(shift)}
                  onMore={() => setActionTarget(shift)}
                  moreLabel={`Actions for ${getStaffName(shift.staff_id)}`}
                />
              </li>
            );
          })}
        </ul>
      </MobileListScreen>

      <ActionSheet
        isOpen={actionTarget !== null}
        onClose={() => setActionTarget(null)}
        title={actionTarget ? getStaffName(actionTarget.staff_id) : undefined}
        subtitle={actionTarget?.shift_name}
        actions={
          actionTarget
            ? [
                { label: "Edit", icon: <Pencil size={18} />, onClick: () => onEdit(actionTarget) },
                {
                  label: "Delete",
                  icon: <Trash2 size={18} />,
                  destructive: true,
                  confirm: {
                    title: "Delete this shift?",
                    description: "The staff member will no longer follow this schedule.",
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
