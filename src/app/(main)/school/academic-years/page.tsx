'use client';

import { useAcademicYears } from '@/hooks/useAcademicYears';
import { ACADEMIC_YEARS_PAGE } from '@/constants';
import {
  Div, H1, P, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Modal, ModalBody, ModalFooter, FormField, Input,
  Badge, Spinner,
} from '@/components/ui';

export default function AcademicYearsPage() {
  const { years, isLoading, showModal, openModal, closeModal, form, handleSubmit, isSubmitting, setCurrent } = useAcademicYears();

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H1>{ACADEMIC_YEARS_PAGE.title}</H1>
          <P>{ACADEMIC_YEARS_PAGE.description}</P>
        </Div>
        <Button onClick={openModal}>{ACADEMIC_YEARS_PAGE.addButton}</Button>
      </Div>

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
                  {!year.is_current && (
                    <Button size="sm" variant="outline" onClick={() => setCurrent(year.id)}>
                      {ACADEMIC_YEARS_PAGE.setCurrentButton}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
                <Div type="row" align="center" gap="sm">
                  <input type="checkbox" id="is_current" {...form.register('is_current')} />
                  <label htmlFor="is_current" className="text-sm text-foreground/80 cursor-pointer">
                    {ACADEMIC_YEARS_PAGE.form.isCurrent}
                  </label>
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
    </Div>
  );
}
