'use client';

import { useSchoolTimings } from '@/hooks/useSchoolTimings';
import {
  Div,
  P,
  Button,
  Badge,
  Spinner,
  PageHeader,
  PageCol,
  Modal,
  ModalBody,
  ModalFooter,
  Select,
  Input,
  FormField,
  EmptyState,
} from '@/components/ui';
import {
  TIMINGS_PAGE,
  TIMING_TYPE_OPTIONS,
  TIMING_TYPE_BADGE,
  WORKING_DAY_OPTIONS,
  DEFAULT_WORKING_DAYS,
} from '@/constants/school-settings.constants';
import { useState } from 'react';
import type { CreateSchoolTimingPayload } from '@/types/school-settings.types';

const EMPTY_FORM: CreateSchoolTimingPayload = {
  name: '',
  timing_type: 'DEFAULT',
  school_start_time: '08:00',
  school_end_time: '14:00',
  grace_period_minutes: 10,
  late_cutoff_time: '08:15',
  half_day_cutoff_time: '10:30',
  absent_cutoff_time: '12:00',
  working_days: DEFAULT_WORKING_DAYS,
  effective_from: '',
  effective_to: '',
  priority: 0,
};

export default function TimingsPage() {
  const { timings, isLoading, isSubmitting, isDialogOpen, editingTiming, openCreate, openEdit, closeDialog, submit, remove } = useSchoolTimings();
  const [form, setForm] = useState<CreateSchoolTimingPayload>(EMPTY_FORM);

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    openCreate();
  };

  const handleOpenEdit = (timing: typeof timings[number]) => {
    setForm({
      name: timing.name,
      timing_type: timing.timing_type,
      school_start_time: timing.school_start_time,
      school_end_time: timing.school_end_time,
      grace_period_minutes: timing.grace_period_minutes,
      late_cutoff_time: timing.late_cutoff_time ?? '',
      half_day_cutoff_time: timing.half_day_cutoff_time ?? '',
      absent_cutoff_time: timing.absent_cutoff_time ?? '',
      working_days: timing.working_days,
      effective_from: timing.effective_from,
      effective_to: timing.effective_to,
      priority: timing.priority,
    });
    openEdit(timing);
  };

  const updateForm = <K extends keyof CreateSchoolTimingPayload>(key: K, value: CreateSchoolTimingPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleWorkingDay = (day: string) => {
    const days = form.working_days?.split(',').filter(Boolean) ?? [];
    const updated = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    updateForm('working_days', updated.join(','));
  };

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
        title={TIMINGS_PAGE.title}
        subtitle={TIMINGS_PAGE.subtitle}
        actions={<Button onClick={handleOpenCreate}>{TIMINGS_PAGE.addButton}</Button>}
      />

      {timings.length === 0 ? (
        <EmptyState
          title="No timing schedules"
          description="Add your first timing schedule to control school hours and late rules"
          action={{ label: TIMINGS_PAGE.addButton, onClick: handleOpenCreate }}
        />
      ) : (
        <Div type="col" gap="md">
          {timings.map((timing) => (
            <Div key={timing.id} variant="card" type="row" justify="between" align="start" padding="p-4">
              <Div type="col" gap="xs">
                <Div type="row" align="center" gap="sm">
                  <P color="default" weight="medium">{timing.name}</P>
                  <Badge variant={TIMING_TYPE_BADGE[timing.timing_type].variant as 'secondary'}>
                    {TIMING_TYPE_BADGE[timing.timing_type].label}
                  </Badge>
                  {!timing.is_active && <Badge variant="default">Inactive</Badge>}
                </Div>
                <Div type="row" gap="lg">
                  <P size="xs">{timing.school_start_time} – {timing.school_end_time}</P>
                  <P size="xs">Grace: {timing.grace_period_minutes}min</P>
                  {timing.late_cutoff_time && (
                    <P size="xs">Late after: {timing.late_cutoff_time}</P>
                  )}
                </Div>
                <P size="xs">{timing.effective_from} → {timing.effective_to} · Priority {timing.priority}</P>
              </Div>
              <Div type="row" gap="xs">
                <Button size="xs" variant="outline" onClick={() => handleOpenEdit(timing)}>Edit</Button>
                <Button size="xs" variant="destructive" onClick={() => remove(timing.id)}>Delete</Button>
              </Div>
            </Div>
          ))}
        </Div>
      )}

      {isDialogOpen && (
        <Modal onClose={closeDialog} title={editingTiming ? 'Edit Timing Schedule' : 'New Timing Schedule'}>
          <ModalBody>
            <Div type="col" gap="md">
              <Div type="grid" cols={2} gap="md">
                <FormField label="Name">
                  <Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Summer Schedule" />
                </FormField>
                <FormField label="Type">
                  <Select value={form.timing_type} onChange={(e) => updateForm('timing_type', e.target.value as typeof form.timing_type)}>
                    {TIMING_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Start Time">
                  <Input type="time" value={form.school_start_time} onChange={(e) => updateForm('school_start_time', e.target.value)} />
                </FormField>
                <FormField label="End Time">
                  <Input type="time" value={form.school_end_time} onChange={(e) => updateForm('school_end_time', e.target.value)} />
                </FormField>
                <FormField label="Grace Period (min)">
                  <Input type="number" value={form.grace_period_minutes ?? ''} onChange={(e) => updateForm('grace_period_minutes', Number(e.target.value))} />
                </FormField>
                <FormField label="Late Cutoff Time">
                  <Input type="time" value={form.late_cutoff_time ?? ''} onChange={(e) => updateForm('late_cutoff_time', e.target.value)} />
                </FormField>
                <FormField label="Half Day Cutoff">
                  <Input type="time" value={form.half_day_cutoff_time ?? ''} onChange={(e) => updateForm('half_day_cutoff_time', e.target.value)} />
                </FormField>
                <FormField label="Absent Cutoff">
                  <Input type="time" value={form.absent_cutoff_time ?? ''} onChange={(e) => updateForm('absent_cutoff_time', e.target.value)} />
                </FormField>
                <FormField label="Effective From">
                  <Input type="date" value={form.effective_from} onChange={(e) => updateForm('effective_from', e.target.value)} />
                </FormField>
                <FormField label="Effective To">
                  <Input type="date" value={form.effective_to} onChange={(e) => updateForm('effective_to', e.target.value)} />
                </FormField>
                <FormField label="Priority (higher = wins)">
                  <Input type="number" value={form.priority ?? 0} onChange={(e) => updateForm('priority', Number(e.target.value))} />
                </FormField>
              </Div>
              <FormField label="Working Days">
                <Div type="row" gap="xs" wrap>
                  {WORKING_DAY_OPTIONS.map((day) => {
                    const selected = (form.working_days ?? '').split(',').includes(day.value);
                    return (
                      <Button
                        key={day.value}
                        variant={selected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleWorkingDay(day.value)}
                      >
                        {day.label}
                      </Button>
                    );
                  })}
                </Div>
              </FormField>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button loading={isSubmitting} onClick={() => submit(form)}>
              {editingTiming ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </PageCol>
  );
}
