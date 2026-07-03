'use client';

import { useStaffShifts } from '@/hooks/useStaffShifts';
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
  ResponsiveSelect,
  ResponsiveModalContainer,
} from '@/components/ui';
import {
  STAFF_SHIFTS_PAGE,
  SHIFT_TYPE_OPTIONS,
  SHIFT_TYPE_BADGE,
  WORKING_DAY_OPTIONS,
} from '@/constants/staff-shifts.constants';
import { useState } from 'react';
import type { CreateStaffShiftPayload, ShiftType } from '@/types/staff-shifts.types';

const EMPTY_FORM: CreateStaffShiftPayload = {
  staff_id: '',
  shift_name: '',
  shift_type: 'MORNING',
  shift_start: '08:00',
  shift_end: '14:00',
  grace_period_minutes: 10,
  working_days: 'MON,TUE,WED,THU,FRI',
  effective_from: '',
  effective_to: '',
};

export default function StaffShiftsPage() {
  const { shifts, staff, isLoading, isSubmitting, isDialogOpen, editingShift, getStaffName, openCreate, openEdit, closeDialog, submit, remove } = useStaffShifts();
  const [form, setForm] = useState<CreateStaffShiftPayload>(EMPTY_FORM);

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    openCreate();
  };

  const handleOpenEdit = (shift: typeof shifts[number]) => {
    setForm({
      staff_id: shift.staff_id,
      shift_name: shift.shift_name,
      shift_type: shift.shift_type as ShiftType,
      shift_start: shift.shift_start,
      shift_end: shift.shift_end,
      grace_period_minutes: Number(shift.grace_period_minutes),
      working_days: shift.working_days ?? 'MON,TUE,WED,THU,FRI',
      effective_from: shift.effective_from,
      effective_to: shift.effective_to,
    });
    openEdit(shift);
  };

  const updateForm = <K extends keyof CreateStaffShiftPayload>(key: K, value: CreateStaffShiftPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDay = (day: string) => {
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
        title={STAFF_SHIFTS_PAGE.title}
        subtitle={STAFF_SHIFTS_PAGE.subtitle}
        actions={<Button onClick={handleOpenCreate}>{STAFF_SHIFTS_PAGE.addButton}</Button>}
      />

      {shifts.length === 0 ? (
        <EmptyState
          title="No shifts assigned"
          description="Assign shifts to staff members to enable automatic late/absent detection"
          action={{ label: STAFF_SHIFTS_PAGE.addButton, onClick: handleOpenCreate }}
        />
      ) : (
        <Div type="col" gap="md">
          {shifts.map((shift) => (
            <Div key={shift.id} variant="card" type="row" justify="between" align="start" padding="p-4">
              <Div type="col" gap="xs">
                <Div type="row" align="center" gap="sm">
                  <P color="default" weight="medium">{getStaffName(shift.staff_id)}</P>
                  <Badge variant={SHIFT_TYPE_BADGE[shift.shift_type as ShiftType].variant as 'secondary'}>
                    {SHIFT_TYPE_BADGE[shift.shift_type as ShiftType].label}
                  </Badge>
                  {!shift.is_active && <Badge variant="default">Inactive</Badge>}
                </Div>
                <P size="xs">{shift.shift_name}</P>
                <Div type="row" gap="lg">
                  <P size="xs">{shift.shift_start} – {shift.shift_end}</P>
                  <P size="xs">Grace: {shift.grace_period_minutes}min</P>
                </Div>
                <P size="xs">{shift.effective_from} → {shift.effective_to}</P>
              </Div>
              <Div type="row" gap="xs">
                <Button size="xs" variant="outline" onClick={() => handleOpenEdit(shift)}>Edit</Button>
                <Button size="xs" variant="destructive" onClick={() => remove(shift.id)}>Delete</Button>
              </Div>
            </Div>
          ))}
        </Div>
      )}

      {isDialogOpen && (
        <ResponsiveModalContainer isOpen={isDialogOpen} onClose={closeDialog} title={editingShift ? 'Edit Shift' : 'Assign Shift'}>
          <div className="px-4 py-4">
            <Div type="col" gap="md">
              <Div type="grid" cols={2} gap="md">
                {!editingShift && (
                  <FormField label="Staff Member">
                    <ResponsiveSelect
                      value={form.staff_id}
                      onChange={(e) => updateForm('staff_id', e.target.value)}
                      customPlaceholder="Select staff"
                      options={staff.map((s) => ({
                        value: s.id,
                        label: `${s.first_name} ${s.last_name ?? ''}`.trim(),
                      }))}
                    />
                  </FormField>
                )}
                <FormField label="Shift Name">
                  <Input value={form.shift_name} onChange={(e) => updateForm('shift_name', e.target.value)} placeholder="Morning Shift" />
                </FormField>
                <FormField label="Shift Type">
                  <ResponsiveSelect
                    value={form.shift_type}
                    onChange={(e) => updateForm('shift_type', e.target.value as ShiftType)}
                    options={SHIFT_TYPE_OPTIONS}
                  />
                </FormField>
                <FormField label="Start Time">
                  <Input type="time" value={form.shift_start} onChange={(e) => updateForm('shift_start', e.target.value)} />
                </FormField>
                <FormField label="End Time">
                  <Input type="time" value={form.shift_end} onChange={(e) => updateForm('shift_end', e.target.value)} />
                </FormField>
                <FormField label="Grace Period (min)">
                  <Input type="number" value={form.grace_period_minutes ?? ''} onChange={(e) => updateForm('grace_period_minutes', Number(e.target.value))} />
                </FormField>
                <FormField label="Effective From">
                  <Input type="date" value={form.effective_from} onChange={(e) => updateForm('effective_from', e.target.value)} />
                </FormField>
                <FormField label="Effective To">
                  <Input type="date" value={form.effective_to} onChange={(e) => updateForm('effective_to', e.target.value)} />
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
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label}
                      </Button>
                    );
                  })}
                </Div>
              </FormField>
            </Div>
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button loading={isSubmitting} onClick={() => submit(form)}>
              {editingShift ? 'Update' : 'Assign'}
            </Button>
          </div>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
