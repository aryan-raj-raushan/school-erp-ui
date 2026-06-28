'use client';

import { useState } from 'react';
import { useStudentMovements } from '@/hooks/useStudentMovements';
import {
  PageCol,
  PageHeader,
  Div,
  P,
  Button,
  Badge,
  Spinner,
  Modal,
  ModalBody,
  ModalFooter,
  FormField,
  Input,
  Select,
  FilterBar,
  FilterLabel,
  EmptyState,
} from '@/components/ui';
import type { StudentMovement } from '@/types';
import type { CreateMovementPayload } from '@/services/student-movements.service';

const LOCATION_OPTIONS: StudentMovement['location'][] = [
  'CAMPUS', 'LIBRARY', 'MEDICAL_ROOM', 'SPORTS', 'CANTEEN', 'GATE', 'HOSTEL', 'LAB',
];

const LOCATION_BADGE: Record<StudentMovement['location'], 'default' | 'secondary' | 'warning' | 'success' | 'danger'> = {
  CAMPUS: 'success',
  LIBRARY: 'secondary',
  MEDICAL_ROOM: 'danger',
  SPORTS: 'warning',
  CANTEEN: 'default',
  GATE: 'secondary',
  HOSTEL: 'default',
  LAB: 'warning',
};

const LOCATION_LABEL: Record<StudentMovement['location'], string> = {
  CAMPUS: 'Campus',
  LIBRARY: 'Library',
  MEDICAL_ROOM: 'Medical Room',
  SPORTS: 'Sports',
  CANTEEN: 'Canteen',
  GATE: 'Gate',
  HOSTEL: 'Hostel',
  LAB: 'Lab',
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function StudentMovementsPage() {
  const {
    movements, isLoading, isSubmitting, isDialogOpen, setIsDialogOpen,
    studentId, setStudentId, date, setDate, fetch, create, remove,
  } = useStudentMovements();

  const [form, setForm] = useState<CreateMovementPayload>({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    tapped_at: new Date().toISOString(),
    location: 'CAMPUS',
  });

  const handleSearch = () => fetch();

  const updateForm = <K extends keyof CreateMovementPayload>(key: K, value: CreateMovementPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <PageCol>
      <PageHeader
        title="Student Movement Timeline"
        subtitle="Track student location throughout the school day via RFID or manual entry"
        actions={<Button onClick={() => setIsDialogOpen(true)}>Log Movement</Button>}
      />

      <FilterBar>
        <FilterLabel>Student ID</FilterLabel>
        <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Paste student UUID" />
        <FilterLabel>Date</FilterLabel>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button variant="outline" onClick={handleSearch} loading={isLoading}>Search</Button>
      </FilterBar>

      {!studentId ? (
        <EmptyState title="Enter student ID" description="Paste a student UUID and pick a date to view their movement timeline" />
      ) : isLoading ? (
        <Div type="row" justify="center" padding="p-12">
          <Spinner />
        </Div>
      ) : movements.length === 0 ? (
        <EmptyState title="No movements" description="No movement records found for this student on the selected date" action={{ label: 'Log Movement', onClick: () => setIsDialogOpen(true) }} />
      ) : (
        <Div type="col" gap="xs">
          {movements.map((m) => (
            <Div key={m.id} variant="card" type="row" justify="between" align="center" padding="p-3">
              <Div type="row" align="center" gap="md">
                <P weight="medium">{formatTime(m.tapped_at)}</P>
                <Badge variant={LOCATION_BADGE[m.location]}>{LOCATION_LABEL[m.location]}</Badge>
                {m.device_id && <P size="xs">Device: {m.device_id}</P>}
              </Div>
              <Button size="xs" variant="destructive" onClick={() => remove(m.id)}>Delete</Button>
            </Div>
          ))}
        </Div>
      )}

      {isDialogOpen && (
        <Modal onClose={() => setIsDialogOpen(false)} title="Log Student Movement">
          <ModalBody>
            <Div type="col" gap="md">
              <FormField label="Student ID">
                <Input value={form.student_id} onChange={(e) => updateForm('student_id', e.target.value)} placeholder="Paste student UUID" />
              </FormField>
              <FormField label="Date">
                <Input type="date" value={form.date} onChange={(e) => updateForm('date', e.target.value)} />
              </FormField>
              <FormField label="Time">
                <Input type="datetime-local" value={form.tapped_at.slice(0, 16)} onChange={(e) => updateForm('tapped_at', new Date(e.target.value).toISOString())} />
              </FormField>
              <FormField label="Location">
                <Select value={form.location} onChange={(e) => updateForm('location', e.target.value as StudentMovement['location'])}>
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>{LOCATION_LABEL[loc]}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Device ID (optional)">
                <Input value={form.device_id ?? ''} onChange={(e) => updateForm('device_id', e.target.value || undefined)} placeholder="RFID reader ID" />
              </FormField>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button loading={isSubmitting} onClick={() => create(form)}>Log</Button>
          </ModalFooter>
        </Modal>
      )}
    </PageCol>
  );
}
