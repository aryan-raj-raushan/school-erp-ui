'use client';

import { useSchoolConfig } from '@/hooks/useSchoolConfig';
import {
  Div,
  P,
  H3,
  Button,
  Select,
  Spinner,
  FormField,
  PageHeader,
  PageCol,
} from '@/components/ui';
import {
  SCHOOL_CONFIG_PAGE,
  ATTENDANCE_METHOD_OPTIONS,
  CONFLICT_RESOLUTION_OPTIONS,
} from '@/constants/school-settings.constants';

export default function SchoolConfigPage() {
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

  return (
    <PageCol>
      <PageHeader
        title={SCHOOL_CONFIG_PAGE.title}
        subtitle={SCHOOL_CONFIG_PAGE.subtitle}
        actions={
          <Button onClick={save} loading={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <Div type="col" gap="lg">
        {/* Attendance Method */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>Attendance Method</H3>
          <Div type="grid" cols={2} gap="md">
            <FormField label="Attendance Method">
              <Select
                value={form.attendance_method ?? 'MANUAL'}
                onChange={(e) => updateField('attendance_method', e.target.value as typeof form.attendance_method)}
              >
                {ATTENDANCE_METHOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Attendance Lock (hours)" hint="After this many hours, only admin can edit">
              <Select
                value={String(form.attendance_lock_hours ?? 24)}
                onChange={(e) => updateField('attendance_lock_hours', Number(e.target.value))}
              >
                {[6, 12, 24, 48, 72, 168].map((h) => (
                  <option key={h} value={h}>{h === 168 ? '1 week' : `${h} hours`}</option>
                ))}
              </Select>
            </FormField>
          </Div>
        </Div>

        {/* Late & Half-Day Rules */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>Late &amp; Half-Day Rules</H3>
          <Div type="col" gap="sm">
            <Div type="row" justify="between" align="center" padding="py-3">
              <Div type="col" gap="xs">
                <P color="default" size="sm" weight="medium">3 Lates = 1 Half Day</P>
                <P size="xs">Auto-convert three LATE records in a month to a HALF_DAY</P>
              </Div>
              <Select
                value={form.three_lates_equal_half_day ? 'true' : 'false'}
                onChange={(e) => updateField('three_lates_equal_half_day', e.target.value === 'true')}
                width="sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
            </Div>
            <Div type="row" justify="between" align="center" padding="py-3">
              <Div type="col" gap="xs">
                <P color="default" size="sm" weight="medium">2 Half Days = 1 Leave</P>
                <P size="xs">Auto-convert two HALF_DAY records to a full leave deduction</P>
              </Div>
              <Select
                value={form.two_half_days_equal_leave ? 'true' : 'false'}
                onChange={(e) => updateField('two_half_days_equal_leave', e.target.value === 'true')}
                width="sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
            </Div>
            <Div type="row" justify="between" align="center" padding="py-3">
              <Div type="col" gap="xs">
                <P color="default" size="sm" weight="medium">Auto Notify Parent on Absent</P>
                <P size="xs">Send notification when student is marked absent</P>
              </Div>
              <Select
                value={form.auto_notify_parent_on_absent ? 'true' : 'false'}
                onChange={(e) => updateField('auto_notify_parent_on_absent', e.target.value === 'true')}
                width="sm"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
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
                onClick={() => updateField('conflict_resolution_mode', opt.value)}
              >
                <Div type="col" gap="xs">
                  <P color="default" size="sm" weight="medium">{opt.label}</P>
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
