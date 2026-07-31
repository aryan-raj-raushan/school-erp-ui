"use client";

import { useSchoolConfig } from "@/hooks/useSchoolConfig";
import {
  Div,
  P,
  H3,
  Button,
  Spinner,
  FormField,
  PageHeader,
  PageCol,
  ResponsiveSelect,
  PageHeaderConfig,
} from "@/components/ui";
import {
  SCHOOL_CONFIG_PAGE,
  ATTENDANCE_METHOD_OPTIONS,
  CONFLICT_RESOLUTION_OPTIONS,
} from "@/constants/school-settings.constants";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SchoolConfigPage() {
  const isMobile = useIsMobile();
  const { form, isLoading, isSaving, updateField, save } = useSchoolConfig();

  if (isLoading) {
    return (
      <PageCol>
        <Div type="row" justify="center" padding="p-12">
          <Spinner />
        </Div>
      </PageCol>
    );
  }

  const pageHeaderConfig: PageHeaderConfig = {
    title: SCHOOL_CONFIG_PAGE.title,
    subtitle: SCHOOL_CONFIG_PAGE.subtitle,
    actions: [
      {
        label: isSaving ? "Saving..." : "Save",

        onClick: () => save(),
      },
    ],
    backButton: isMobile,
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig}
      />

      <Div type="col" gap="lg">
        {/* Attendance Method */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>Attendance Method</H3>
          <Div type="grid" cols={2} gap="md">
            <FormField label="Attendance Method">
              <ResponsiveSelect
                value={form.attendance_method ?? "MANUAL"}
                onChange={(e) =>
                  updateField(
                    "attendance_method",
                    e.target.value as typeof form.attendance_method,
                  )
                }
                options={ATTENDANCE_METHOD_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
              />
            </FormField>
            <FormField
              label="Attendance Lock (hours)"
              hint="After this many hours, only admin can edit"
            >
              <ResponsiveSelect
                value={String(form.attendance_lock_hours ?? 24)}
                onChange={(e) =>
                  updateField("attendance_lock_hours", Number(e.target.value))
                }
                options={[6, 12, 24, 48, 72, 168].map((h) => ({
                  value: String(h),
                  label: h === 168 ? "1 week" : `${h} hours`,
                }))}
              />
            </FormField>
          </Div>
        </Div>

        {/* Late & Half-Day Rules */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>Late &amp; Half-Day Rules</H3>
          <Div type="col" gap="sm">
            <Div type="row" justify="between" align="center" padding="py-3">
              <Div type="col" gap="xs">
                <P color="default" size="sm" weight="medium">
                  3 Lates = 1 Half Day
                </P>
                <P size="xs">
                  Auto-convert three LATE records in a month to a HALF_DAY
                </P>
              </Div>
              <ResponsiveSelect
                value={form.three_lates_equal_half_day ? "true" : "false"}
                onChange={(e) =>
                  updateField(
                    "three_lates_equal_half_day",
                    e.target.value === "true",
                  )
                }
                options={[
                  { value: "true", label: "Enabled" },
                  { value: "false", label: "Disabled" },
                ]}
              />
            </Div>
            <Div type="row" justify="between" align="center" padding="py-3">
              <Div type="col" gap="xs">
                <P color="default" size="sm" weight="medium">
                  2 Half Days = 1 Leave
                </P>
                <P size="xs">
                  Auto-convert two HALF_DAY records to a full leave deduction
                </P>
              </Div>
              <ResponsiveSelect
                value={form.two_half_days_equal_leave ? "true" : "false"}
                onChange={(e) =>
                  updateField(
                    "two_half_days_equal_leave",
                    e.target.value === "true",
                  )
                }
                options={[
                  { value: "true", label: "Enabled" },
                  { value: "false", label: "Disabled" },
                ]}
              />
            </Div>
            <Div type="row" justify="between" align="center" padding="py-3">
              <Div type="col" gap="xs">
                <P color="default" size="sm" weight="medium">
                  Auto Notify Parent on Absent
                </P>
                <P size="xs">Send notification when student is marked absent</P>
              </Div>
              <ResponsiveSelect
                value={form.auto_notify_parent_on_absent ? "true" : "false"}
                onChange={(e) =>
                  updateField(
                    "auto_notify_parent_on_absent",
                    e.target.value === "true",
                  )
                }
                options={[
                  { value: "true", label: "Enabled" },
                  { value: "false", label: "Disabled" },
                ]}
              />
            </Div>
          </Div>
        </Div>

        {/* Conflict Resolution */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>RFID vs Manual Conflict Resolution</H3>
          <Div type="col" gap="sm">
            {CONFLICT_RESOLUTION_OPTIONS.map((opt) => (
              <Div
                key={opt.value}
                type="row"
                align="center"
                gap="md"
                padding="p-3"
                variant="inset"
                interactive
                selected={form.conflict_resolution_mode === opt.value}
                onClick={() =>
                  updateField("conflict_resolution_mode", opt.value)
                }
              >
                <Div type="col" gap="xs">
                  <P color="default" size="sm" weight="medium">
                    {opt.label}
                  </P>
                  <P size="xs">{opt.description}</P>
                </Div>
              </Div>
            ))}
          </Div>
        </Div>
      </Div>
    </PageCol>
  );
}
