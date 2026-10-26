"use client";

import { Check } from "lucide-react";
import {
  ChoiceChips,
  FormGroup,
  MobileFormScreen,
  MobileSelectField,
  ToggleRow,
} from "@/components/ui";
import { haptic } from "@/lib/haptics";
import {
  ATTENDANCE_METHOD_OPTIONS,
  CONFLICT_RESOLUTION_OPTIONS,
} from "@/constants/school-settings.constants";
import type { UpdateSchoolSettingsPayload } from "@/types/school-settings.types";

const LOCK_HOUR_OPTIONS = [6, 12, 24, 48, 72, 168].map((hours) => ({
  value: String(hours),
  label: hours === 168 ? "1 week" : `${hours} hours`,
}));

export interface SchoolConfigMobileProps {
  form: UpdateSchoolSettingsPayload;
  updateField: <K extends keyof UpdateSchoolSettingsPayload>(
    key: K,
    value: UpdateSchoolSettingsPayload[K],
  ) => void;
  isSaving: boolean;
  onSave: () => Promise<unknown> | unknown;
}

export function SchoolConfigMobile({ form, updateField, isSaving, onSave }: SchoolConfigMobileProps) {
  return (
    <MobileFormScreen
      title="School configuration"
      submitLabel="Save settings"
      isSubmitting={isSaving}
      onSubmit={onSave}
    >
      <FormGroup title="Attendance">
        <ChoiceChips
          label="Attendance method"
          value={form.attendance_method ?? "MANUAL"}
          onChange={(value) =>
            updateField("attendance_method", value as typeof form.attendance_method)
          }
          options={ATTENDANCE_METHOD_OPTIONS}
        />
        <MobileSelectField
          label="Attendance lock"
          value={String(form.attendance_lock_hours ?? 24)}
          onChange={(value) => updateField("attendance_lock_hours", Number(value))}
          options={LOCK_HOUR_OPTIONS}
        />
        <p className="px-1 text-xs text-muted-foreground">
          After this long, only an admin can edit attendance.
        </p>
      </FormGroup>

      <FormGroup title="Late & half-day rules">
        <ToggleRow
          label="3 lates = 1 half day"
          description="Auto-convert three LATE records in a month to a HALF_DAY"
          checked={Boolean(form.three_lates_equal_half_day)}
          onChange={(value) => updateField("three_lates_equal_half_day", value)}
        />
        <ToggleRow
          label="2 half days = 1 leave"
          description="Auto-convert two HALF_DAY records to a full leave deduction"
          checked={Boolean(form.two_half_days_equal_leave)}
          onChange={(value) => updateField("two_half_days_equal_leave", value)}
        />
        <ToggleRow
          label="Notify parent on absence"
          description="Send a notification when a student is marked absent"
          checked={Boolean(form.auto_notify_parent_on_absent)}
          onChange={(value) => updateField("auto_notify_parent_on_absent", value)}
        />
      </FormGroup>

      <FormGroup title="Smart Attendance vs manual conflicts" description="What happens when the two disagree.">
        <div role="radiogroup" className="flex flex-col gap-2">
          {CONFLICT_RESOLUTION_OPTIONS.map((option) => {
            const active = form.conflict_resolution_mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  void haptic("light");
                  updateField("conflict_resolution_mode", option.value);
                }}
                className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left active:scale-[0.99] dark:bg-neutral-900 ${active ? "border-primary ring-2 ring-ring/30" : "border-border"}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{option.label}</span>
                  <span className="block text-sm text-muted-foreground">{option.description}</span>
                </span>
                {active && <Check size={20} className="shrink-0 text-primary-text" />}
              </button>
            );
          })}
        </div>
      </FormGroup>
    </MobileFormScreen>
  );
}
