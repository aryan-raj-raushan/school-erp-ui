'use client';

import { useTimetableSessions } from '@/hooks/useTimetableSessions';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Modal, ModalBody, ModalFooter, FormField, Input, Select,
  Badge, Spinner, Icon,
} from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

const SESSION_TYPE_OPTIONS = [
  { value: 'annual', label: 'Annual' },
  { value: 'summer', label: 'Summer' },
  { value: 'winter', label: 'Winter' },
  { value: 'spring', label: 'Spring' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'quarterly', label: 'Quarterly' },
];

export default function TimetableSessionsPage() {
  const {
    sessions, isLoading,
    showModal, openModal, closeModal, form, handleSubmit, isSubmitting,
    showEditModal, openEditModal, closeEditModal, editForm, handleEditSubmit, isEditSubmitting,
    setActive, removeSession,
  } = useTimetableSessions();
  const { years } = useAcademicYears();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title="Timetable Sessions"
        subtitle="Manage school timetable sessions"
        actions={<Button onClick={openModal}>Add Session</Button>}
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Session Code</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Dates</TableHeaderCell>
            <TableHeaderCell>Active</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : sessions.length === 0 ? (
            <TableEmptyRow colSpan={6}>No timetable sessions found</TableEmptyRow>
          ) : (
            sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell primary>{session.name}</TableCell>
                <TableCell>{session.session_code ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant="default">{session.timetable_session}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(session.start_date).toLocaleDateString()} – {new Date(session.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={session.is_active_session ? 'success' : 'default'}>
                    {session.is_active_session ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(session)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    {!session.is_active_session && (
                      <Button size="sm" variant="outline" onClick={() => setActive(session.id)}>
                        Set Active
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => removeSession(session.id)}>
                      <Icon icon={Trash2} type="sm" />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create Modal */}
      {showModal && (
        <Modal onClose={closeModal} title="Add Timetable Session" size="md">
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label="Name" error={form.formState.errors.name?.message}>
                  <Input placeholder="e.g. Annual 2024-25" {...form.register('name')} />
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label="Session Code" error={form.formState.errors.session_code?.message}>
                    <Input placeholder="e.g. ANN-2024" {...form.register('session_code')} />
                  </FormField>
                  <FormField label="Type" error={form.formState.errors.timetable_session?.message}>
                    <Select {...form.register('timetable_session')}>
                      {SESSION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormField>
                </Div>
                <FormField label="Academic Year" error={form.formState.errors.academic_year_id?.message}>
                  <Select {...form.register('academic_year_id')}>
                    <option value="">Select academic year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </Select>
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label="Start Date" error={form.formState.errors.start_date?.message}>
                    <Input type="date" {...form.register('start_date')} />
                  </FormField>
                  <FormField label="End Date" error={form.formState.errors.end_date?.message}>
                    <Input type="date" {...form.register('end_date')} />
                  </FormField>
                </Div>
                <FormField label="Description" error={form.formState.errors.description?.message}>
                  <Input placeholder="Optional description" {...form.register('description')} />
                </FormField>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
              <Button type="submit" loading={isSubmitting}>Create</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal onClose={closeEditModal} title="Edit Timetable Session" size="md">
          <form onSubmit={handleEditSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label="Name" error={editForm.formState.errors.name?.message}>
                  <Input {...editForm.register('name')} />
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label="Session Code" error={editForm.formState.errors.session_code?.message}>
                    <Input {...editForm.register('session_code')} />
                  </FormField>
                  <FormField label="Type" error={editForm.formState.errors.timetable_session?.message}>
                    <Select {...editForm.register('timetable_session')}>
                      {SESSION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormField>
                </Div>
                <FormField label="Academic Year" error={editForm.formState.errors.academic_year_id?.message}>
                  <Select {...editForm.register('academic_year_id')}>
                    <option value="">Select academic year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </Select>
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label="Start Date" error={editForm.formState.errors.start_date?.message}>
                    <Input type="date" {...editForm.register('start_date')} />
                  </FormField>
                  <FormField label="End Date" error={editForm.formState.errors.end_date?.message}>
                    <Input type="date" {...editForm.register('end_date')} />
                  </FormField>
                </Div>
                <FormField label="Description" error={editForm.formState.errors.description?.message}>
                  <Input {...editForm.register('description')} />
                </FormField>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeEditModal}>Cancel</Button>
              <Button type="submit" loading={isEditSubmitting}>Save Changes</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
