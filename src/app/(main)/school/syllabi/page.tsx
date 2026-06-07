'use client';

import { useSyllabi } from '@/hooks/useSyllabi';
import { useClasses } from '@/hooks/useClasses';
import { useTimetableSessions } from '@/hooks/useTimetableSessions';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Modal, ModalBody, ModalFooter, FormField, Input, Select,
  Badge, Spinner, Icon,
} from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

export default function SyllabiPage() {
  const {
    syllabi, isLoading,
    showModal, openModal, closeModal, form, handleSubmit, isSubmitting,
    showEditModal, openEditModal, closeEditModal, editForm, handleEditSubmit, isEditSubmitting,
    removeSyllabus,
  } = useSyllabi();
  const { classes } = useClasses();
  const { sessions } = useTimetableSessions();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title="Syllabi"
        subtitle="Manage class syllabi"
        actions={<Button onClick={openModal}>Add Syllabus</Button>}
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Class</TableHeaderCell>
            <TableHeaderCell>Session</TableHeaderCell>
            <TableHeaderCell>Enabled</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
          ) : syllabi.length === 0 ? (
            <TableEmptyRow colSpan={5}>No syllabi found</TableEmptyRow>
          ) : (
            syllabi.map((syllabus) => {
              const cls = classes.find((c) => c.id === syllabus.class_id);
              const session = sessions.find((s) => s.id === syllabus.timetable_session_id);
              return (
                <TableRow key={syllabus.id}>
                  <TableCell primary>{syllabus.title}</TableCell>
                  <TableCell>{cls?.name ?? syllabus.class_id}</TableCell>
                  <TableCell>{session?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={syllabus.is_enabled ? 'success' : 'default'}>
                      {syllabus.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Div type="row" gap="xs">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(syllabus)}>
                        <Icon icon={Pencil} type="sm" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeSyllabus(syllabus.id)}>
                        <Icon icon={Trash2} type="sm" />
                      </Button>
                    </Div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Create Modal */}
      {showModal && (
        <Modal onClose={closeModal} title="Add Syllabus" size="md">
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label="Class" error={form.formState.errors.class_id?.message}>
                  <Select {...form.register('class_id')}>
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Timetable Session (optional)" error={form.formState.errors.timetable_session_id?.message}>
                  <Select {...form.register('timetable_session_id')}>
                    <option value="">Select session</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Title" error={form.formState.errors.title?.message}>
                  <Input placeholder="e.g. Mathematics Syllabus 2024" {...form.register('title')} />
                </FormField>
                <FormField label="Content (optional)" error={form.formState.errors.content?.message}>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                    placeholder="Enter syllabus content..."
                    {...form.register('content')}
                  />
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
        <Modal onClose={closeEditModal} title="Edit Syllabus" size="md">
          <form onSubmit={handleEditSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label="Class" error={editForm.formState.errors.class_id?.message}>
                  <Select {...editForm.register('class_id')}>
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Timetable Session (optional)" error={editForm.formState.errors.timetable_session_id?.message}>
                  <Select {...editForm.register('timetable_session_id')}>
                    <option value="">Select session</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Title" error={editForm.formState.errors.title?.message}>
                  <Input {...editForm.register('title')} />
                </FormField>
                <FormField label="Content (optional)" error={editForm.formState.errors.content?.message}>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                    {...editForm.register('content')}
                  />
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
