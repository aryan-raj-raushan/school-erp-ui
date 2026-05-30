'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStudentDetail } from '@/hooks/useStudents';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useClasses } from '@/hooks/useClasses';
import {
  ROUTES, STUDENT_STATUS_BADGE, STUDENT_DETAIL_PAGE, PARENT_RELATION_OPTIONS,
} from '@/constants';
import {
  Div, H1, H2, P, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Modal, ModalBody, ModalFooter, FormField, Input, Select,
  Badge, Spinner, InfoRow,
} from '@/components/ui';

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { years } = useAcademicYears();
  const { classes, sections } = useClasses();
  const {
    student, parents, isLoading,
    showParentModal, openParentModal, closeParentModal,
    parentForm, handleParentSubmit, isParentSubmitting,
    removeParent,
  } = useStudentDetail(id);

  if (isLoading) {
    return (
      <Div type="row" justify="center" align="center" full className="h-64">
        <Spinner size="lg" />
      </Div>
    );
  }

  if (!student) return null;

  return (
    <Div type="col" gap="lg">
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.students)}>
          <ArrowLeft size={16} />
          {STUDENT_DETAIL_PAGE.back}
        </Button>
        <Div type="col" gap="xs">
          <H1>{student.first_name} {student.last_name ?? ''}</H1>
          <P>Admission No: {student.admission_number}</P>
        </Div>
        <Badge variant={STUDENT_STATUS_BADGE[student.status]}>{student.status}</Badge>
      </Div>

      <Div type="grid" cols={2} gap="lg">
        <Div type="col" gap="md">
          <H2>{STUDENT_DETAIL_PAGE.sections.personal}</H2>
          <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-4">
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.fullName} value={`${student.first_name} ${student.last_name ?? ''}`} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.gender} value={student.gender ?? '—'} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.dob} value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '—'} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.bloodGroup} value={student.blood_group ?? '—'} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.nationality} value={student.nationality ?? '—'} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.aadhaar} value={student.aadhaar_number ?? '—'} />
          </Div>
        </Div>

        <Div type="col" gap="md">
          <H2>{STUDENT_DETAIL_PAGE.sections.academic}</H2>
          <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-4">
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.academicYear} value={years.find((y) => y.id === student.academic_year_id)?.name ?? '—'} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.class} value={classes.find((c) => c.id === student.class_id)?.name ?? '—'} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.section} value={sections.find((s) => s.id === student.section_id)?.name ?? '—'} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.rollNumber} value={student.roll_number ?? '—'} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.admissionDate} value={student.admission_date ? new Date(student.admission_date).toLocaleDateString() : '—'} />
          </Div>
        </Div>

        <Div type="col" gap="md">
          <H2>{STUDENT_DETAIL_PAGE.sections.contact}</H2>
          <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-4">
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.email} value={student.email ?? '—'} />
            <InfoRow label={STUDENT_DETAIL_PAGE.labels.phone} value={student.phone_number ? `${student.dial_code ?? ''} ${student.phone_number}` : '—'} />
          </Div>
        </Div>
      </Div>

      <Div type="col" gap="md">
        <Div type="row" justify="between" align="center">
          <H2>{STUDENT_DETAIL_PAGE.sections.parents}</H2>
          <Button onClick={openParentModal}>{STUDENT_DETAIL_PAGE.addParent}</Button>
        </Div>

        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>{STUDENT_DETAIL_PAGE.table.name}</TableHeaderCell>
              <TableHeaderCell>{STUDENT_DETAIL_PAGE.table.relation}</TableHeaderCell>
              <TableHeaderCell>{STUDENT_DETAIL_PAGE.table.phone}</TableHeaderCell>
              <TableHeaderCell>{STUDENT_DETAIL_PAGE.table.email}</TableHeaderCell>
              <TableHeaderCell>{STUDENT_DETAIL_PAGE.table.primary}</TableHeaderCell>
              <TableHeaderCell>{STUDENT_DETAIL_PAGE.table.canPickup}</TableHeaderCell>
              <TableHeaderCell>{STUDENT_DETAIL_PAGE.table.actions}</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {parents.length === 0 ? (
              <TableEmptyRow colSpan={7}>{STUDENT_DETAIL_PAGE.empty}</TableEmptyRow>
            ) : (
              parents.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell primary>{parent.first_name} {parent.last_name ?? ''}</TableCell>
                  <TableCell>{parent.relation}</TableCell>
                  <TableCell>{parent.dial_code} {parent.phone_number}</TableCell>
                  <TableCell>{parent.email ?? '—'}</TableCell>
                  <TableCell><Badge variant={parent.is_primary ? 'success' : 'default'}>{parent.is_primary ? 'Yes' : 'No'}</Badge></TableCell>
                  <TableCell><Badge variant={parent.can_pickup ? 'success' : 'default'}>{parent.can_pickup ? 'Yes' : 'No'}</Badge></TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => removeParent(parent.id)}>
                      {STUDENT_DETAIL_PAGE.removeParent}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Div>

      {showParentModal && (
        <Modal onClose={closeParentModal} title={STUDENT_DETAIL_PAGE.parentForm.title}>
          <form onSubmit={handleParentSubmit}>
            <ModalBody>
              <Div type="col" gap="md">
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STUDENT_DETAIL_PAGE.parentForm.firstName} error={parentForm.formState.errors.first_name?.message}>
                    <Input placeholder={STUDENT_DETAIL_PAGE.placeholders.firstName} {...parentForm.register('first_name')} />
                  </FormField>
                  <FormField label={STUDENT_DETAIL_PAGE.parentForm.lastName} error={parentForm.formState.errors.last_name?.message}>
                    <Input placeholder={STUDENT_DETAIL_PAGE.placeholders.lastName} {...parentForm.register('last_name')} />
                  </FormField>
                </Div>
                <Div type="grid" cols={2} gap="md">
                  <FormField label={STUDENT_DETAIL_PAGE.parentForm.relation} error={parentForm.formState.errors.relation?.message}>
                    <Select {...parentForm.register('relation')}>
                      {PARENT_RELATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField label={STUDENT_DETAIL_PAGE.parentForm.occupation} error={parentForm.formState.errors.occupation?.message}>
                    <Input placeholder={STUDENT_DETAIL_PAGE.placeholders.occupation} {...parentForm.register('occupation')} />
                  </FormField>
                </Div>
                <Div type="row" gap="sm">
                  <FormField label={STUDENT_DETAIL_PAGE.parentForm.dialCode} error={parentForm.formState.errors.dial_code?.message}>
                    <Input width="xs" placeholder={STUDENT_DETAIL_PAGE.placeholders.dialCode} {...parentForm.register('dial_code')} />
                  </FormField>
                  <FormField label={STUDENT_DETAIL_PAGE.parentForm.phone} error={parentForm.formState.errors.phone_number?.message}>
                    <Input type="tel" placeholder={STUDENT_DETAIL_PAGE.placeholders.phone} {...parentForm.register('phone_number')} />
                  </FormField>
                </Div>
                <FormField label={STUDENT_DETAIL_PAGE.parentForm.email} error={parentForm.formState.errors.email?.message}>
                  <Input type="email" placeholder={STUDENT_DETAIL_PAGE.placeholders.email} {...parentForm.register('email')} />
                </FormField>
                <Div type="row" gap="lg">
                  <Div type="row" align="center" gap="sm">
                    <input type="checkbox" id="is_primary" {...parentForm.register('is_primary')} />
                    <label htmlFor="is_primary" className="text-sm text-foreground/80 cursor-pointer">
                      {STUDENT_DETAIL_PAGE.parentForm.isPrimary}
                    </label>
                  </Div>
                  <Div type="row" align="center" gap="sm">
                    <input type="checkbox" id="can_pickup" {...parentForm.register('can_pickup')} />
                    <label htmlFor="can_pickup" className="text-sm text-foreground/80 cursor-pointer">
                      {STUDENT_DETAIL_PAGE.parentForm.canPickup}
                    </label>
                  </Div>
                </Div>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeParentModal}>{STUDENT_DETAIL_PAGE.parentForm.cancel}</Button>
              <Button type="submit" loading={isParentSubmitting}>{STUDENT_DETAIL_PAGE.parentForm.submit}</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
