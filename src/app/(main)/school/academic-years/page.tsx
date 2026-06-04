'use client';

import { useAcademicYears } from '@/hooks/useAcademicYears';
import { ACADEMIC_YEARS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, P, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Modal, ModalBody, ModalFooter, FormField, Input,
  Badge, Spinner, Icon,
} from '@/components/ui';
import { Pencil } from 'lucide-react';

export default function AcademicYearsPage() {
  const {
    years, isLoading,
    showModal, openModal, closeModal, form, handleSubmit, isSubmitting,
    showEditModal, openEditModal, closeEditModal, editForm, handleEditSubmit, isEditSubmitting,
    setCurrent,
  } = useAcademicYears();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={ACADEMIC_YEARS_PAGE.title}
        subtitle={ACADEMIC_YEARS_PAGE.description}
        illustration="/illustrations/graduation.svg"
        actions={<Button onClick={openModal}>{ACADEMIC_YEARS_PAGE.addButton}</Button>}
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.startDate}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.endDate}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{ACADEMIC_YEARS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
          ) : years.length === 0 ? (
            <TableEmptyRow colSpan={5}>{ACADEMIC_YEARS_PAGE.empty}</TableEmptyRow>
          ) : (
            years.map((year) => (
              <TableRow key={year.id}>
                <TableCell primary>{year.name}</TableCell>
                <TableCell>{new Date(year.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(year.end_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={year.is_current ? 'success' : 'default'}>
                    {year.is_current ? ACADEMIC_YEARS_PAGE.status.current : ACADEMIC_YEARS_PAGE.status.inactive}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(year)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    {!year.is_current && (
                      <Button size="sm" variant="outline" onClick={() => setCurrent(year.id)}>
                        {ACADEMIC_YEARS_PAGE.setCurrentButton}
                      </Button>
                    )}
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create Modal — no is_current checkbox */}
      {showModal && (
        <Modal onClose={closeModal} title={ACADEMIC_YEARS_PAGE.form.title} size="md">
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label={ACADEMIC_YEARS_PAGE.form.name} error={form.formState.errors.name?.message}>
                  <Input placeholder={ACADEMIC_YEARS_PAGE.placeholders.name} {...form.register('name')} />
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={ACADEMIC_YEARS_PAGE.form.startDate} error={form.formState.errors.start_date?.message}>
                    <Input type="date" {...form.register('start_date')} />
                  </FormField>
                  <FormField label={ACADEMIC_YEARS_PAGE.form.endDate} error={form.formState.errors.end_date?.message}>
                    <Input type="date" {...form.register('end_date')} />
                  </FormField>
                </Div>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeModal}>{ACADEMIC_YEARS_PAGE.form.cancel}</Button>
              <Button type="submit" loading={isSubmitting}>{ACADEMIC_YEARS_PAGE.form.submit}</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal onClose={closeEditModal} title="Edit Academic Year" size="md">
          <form onSubmit={handleEditSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField label={ACADEMIC_YEARS_PAGE.form.name} error={editForm.formState.errors.name?.message}>
                  <Input {...editForm.register('name')} />
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={ACADEMIC_YEARS_PAGE.form.startDate} error={editForm.formState.errors.start_date?.message}>
                    <Input type="date" {...editForm.register('start_date')} />
                  </FormField>
                  <FormField label={ACADEMIC_YEARS_PAGE.form.endDate} error={editForm.formState.errors.end_date?.message}>
                    <Input type="date" {...editForm.register('end_date')} />
                  </FormField>
                </Div>
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
