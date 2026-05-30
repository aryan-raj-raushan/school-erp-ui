'use client';

import { useRouter } from 'next/navigation';
import { useStudents } from '@/hooks/useStudents';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useClasses } from '@/hooks/useClasses';
import {
  ROUTES, STUDENTS_PAGE, STUDENT_STATUS_BADGE,
  STUDENT_STATUS_OPTIONS, GENDER_OPTIONS,
} from '@/constants';
import {
  Div, H1, P, Button, Input, Select,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
  Modal, ModalBody, ModalFooter, FormField,
  Badge, Spinner,
} from '@/components/ui';

export default function StudentsPage() {
  const router = useRouter();
  const { years, currentYear } = useAcademicYears();
  const { classes, sections } = useClasses();
  const {
    students, pagination, filters, isLoading,
    showModal, openModal, closeModal,
    form, handleSubmit, isSubmitting,
    updateFilters,
  } = useStudents();

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H1>{STUDENTS_PAGE.title}</H1>
          <P>{pagination ? `${pagination.total} students` : 'Loading...'}</P>
        </Div>
        <Button onClick={openModal}>{STUDENTS_PAGE.addButton}</Button>
      </Div>

      <Div type="row" gap="md" align="center" wrap>
        <Input
          width="md"
          placeholder="Search by name or admission no."
          value={filters.search ?? ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
        <Select
          width="sm"
          value={filters.academic_year_id ?? ''}
          onChange={(e) => updateFilters({ academic_year_id: e.target.value || undefined })}
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.class_id ?? ''}
          onChange={(e) => updateFilters({ class_id: e.target.value || undefined })}
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.status ?? ''}
          onChange={(e) => updateFilters({ status: (e.target.value as any) || undefined })}
        >
          {STUDENT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{STUDENTS_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{STUDENTS_PAGE.table.admissionNo}</TableHeaderCell>
            <TableHeaderCell>{STUDENTS_PAGE.table.class}</TableHeaderCell>
            <TableHeaderCell>{STUDENTS_PAGE.table.section}</TableHeaderCell>
            <TableHeaderCell>{STUDENTS_PAGE.table.gender}</TableHeaderCell>
            <TableHeaderCell>{STUDENTS_PAGE.table.status}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : students.length === 0 ? (
            <TableEmptyRow colSpan={6}>{STUDENTS_PAGE.empty}</TableEmptyRow>
          ) : (
            students.map((student) => {
              const cls = classes.find((c) => c.id === student.class_id);
              const sec = sections.find((s) => s.id === student.section_id);
              return (
                <TableRow
                  key={student.id}
                  onClick={() => router.push(ROUTES.studentDetail(student.id))}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell primary>{student.first_name} {student.last_name ?? ''}</TableCell>
                  <TableCell>{student.admission_number}</TableCell>
                  <TableCell>{cls?.name ?? '—'}</TableCell>
                  <TableCell>{sec?.name ?? '—'}</TableCell>
                  <TableCell>{student.gender ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={STUDENT_STATUS_BADGE[student.status]}>{student.status}</Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination total={pagination.total} page={pagination.page} totalPages={pagination.totalPages} />
      )}

      {showModal && (
        <Modal onClose={closeModal} title={STUDENTS_PAGE.form.title}>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STUDENTS_PAGE.form.firstName} error={form.formState.errors.first_name?.message}>
                    <Input placeholder={STUDENTS_PAGE.placeholders.firstName} {...form.register('first_name')} />
                  </FormField>
                  <FormField label={STUDENTS_PAGE.form.lastName} error={form.formState.errors.last_name?.message}>
                    <Input placeholder={STUDENTS_PAGE.placeholders.lastName} {...form.register('last_name')} />
                  </FormField>
                </Div>
                <FormField label={STUDENTS_PAGE.form.admissionNumber} error={form.formState.errors.admission_number?.message}>
                  <Input placeholder={STUDENTS_PAGE.placeholders.admissionNumber} {...form.register('admission_number')} />
                </FormField>
                <FormField label={STUDENTS_PAGE.form.academicYear} error={form.formState.errors.academic_year_id?.message}>
                  <Select {...form.register('academic_year_id')} defaultValue={currentYear?.id ?? ''}>
                    <option value="">Select year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </Select>
                </FormField>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STUDENTS_PAGE.form.class} error={form.formState.errors.class_id?.message}>
                    <Select {...form.register('class_id')}>
                      <option value="">Select class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label={STUDENTS_PAGE.form.section} error={form.formState.errors.section_id?.message}>
                    <Select {...form.register('section_id')}>
                      <option value="">Select section</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Select>
                  </FormField>
                </Div>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STUDENTS_PAGE.form.gender} error={form.formState.errors.gender?.message}>
                    <Select {...form.register('gender')}>
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label={STUDENTS_PAGE.form.dateOfBirth} error={form.formState.errors.date_of_birth?.message}>
                    <Input type="date" {...form.register('date_of_birth')} />
                  </FormField>
                </Div>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STUDENTS_PAGE.form.rollNumber} error={form.formState.errors.roll_number?.message}>
                    <Input placeholder={STUDENTS_PAGE.placeholders.rollNumber} {...form.register('roll_number')} />
                  </FormField>
                  <FormField label={STUDENTS_PAGE.form.admissionDate} error={form.formState.errors.admission_date?.message}>
                    <Input type="date" {...form.register('admission_date')} />
                  </FormField>
                </Div>
                <FormField label={STUDENTS_PAGE.form.email} error={form.formState.errors.email?.message}>
                  <Input type="email" placeholder={STUDENTS_PAGE.placeholders.email} {...form.register('email')} />
                </FormField>
                <Div type="row" gap="sm">
                  <FormField label={STUDENTS_PAGE.form.dialCode} error={form.formState.errors.dial_code?.message}>
                    <Input width="xs" placeholder={STUDENTS_PAGE.placeholders.dialCode} {...form.register('dial_code')} />
                  </FormField>
                  <FormField label={STUDENTS_PAGE.form.phone} error={form.formState.errors.phone_number?.message}>
                    <Input type="tel" placeholder={STUDENTS_PAGE.placeholders.phone} {...form.register('phone_number')} />
                  </FormField>
                </Div>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeModal}>{STUDENTS_PAGE.form.cancel}</Button>
              <Button type="submit" loading={isSubmitting}>{STUDENTS_PAGE.form.submit}</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
