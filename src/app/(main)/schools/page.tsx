'use client';

import { SCHOOLS_PAGE, CREATE_SCHOOL_FORM, BOARD_TYPES } from '@/constants';
import { Role } from '@/types';
import { useCreateSchoolForm } from '@/hooks/useCreateSchoolForm';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, P, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
  Modal, ModalBody, ModalFooter, FormField, Input, Select,
  Badge, Spinner,
} from '@/components/ui';
import { useSchools } from '@/hooks/useSchools';

export default function SchoolsPage() {
  const { schools, pagination, isLoading } = useSchools();
  const { form, showModal, openModal, closeModal, handleSubmit, isSubmitting } = useCreateSchoolForm();
  const user = useAuthStore((s) => s.user);
  const canCreate = user?.role === Role.SUPER_ADMIN;

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={SCHOOLS_PAGE.title}
        subtitle={SCHOOLS_PAGE.description}
        illustration="/illustrations/school.svg"
        actions={canCreate ? <Button onClick={openModal}>{SCHOOLS_PAGE.addButton}</Button> : undefined}
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{SCHOOLS_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.code}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.board}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.city}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.created}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}>
              <Spinner />
            </TableEmptyRow>
          ) : schools.length === 0 ? (
            <TableEmptyRow colSpan={6}>{SCHOOLS_PAGE.empty}</TableEmptyRow>
          ) : (
            schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell primary>{school.name}</TableCell>
                <TableCell>{school.code ?? '—'}</TableCell>
                <TableCell>{school.board_type ?? '—'}</TableCell>
                <TableCell>{school.city ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={school.is_active ? 'success' : 'default'}>
                    {school.is_active ? SCHOOLS_PAGE.status.active : SCHOOLS_PAGE.status.inactive}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(school.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}

      {showModal && (
        <Modal onClose={closeModal} title={CREATE_SCHOOL_FORM.title}>
          <form onSubmit={handleSubmit}>
            <ModalBody>
            <Div type="col" gap="lg">
              <Div type="col" gap="md">
                <P color="muted">{CREATE_SCHOOL_FORM.sections.basic}</P>
                <Div type="grid" cols={2} gap="md">
                  <FormField
                    label={`${CREATE_SCHOOL_FORM.labels.name} *`}
                    error={form.formState.errors.name?.message}
                  >
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.name} {...form.register('name')} />
                  </FormField>
                  <FormField
                    label={CREATE_SCHOOL_FORM.labels.code}
                    error={form.formState.errors.code?.message}
                  >
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.code} {...form.register('code')} />
                  </FormField>
                </Div>
                <FormField
                  label={CREATE_SCHOOL_FORM.labels.board_type}
                  error={form.formState.errors.board_type?.message}
                >
                  <Select {...form.register('board_type')}>
                    <option value="">{CREATE_SCHOOL_FORM.placeholders.board_type}</option>
                    {BOARD_TYPES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Select>
                </FormField>
              </Div>

              <Div type="col" gap="md">
                <P color="muted">{CREATE_SCHOOL_FORM.sections.contact}</P>
                <FormField
                  label={CREATE_SCHOOL_FORM.labels.email}
                  error={form.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder={CREATE_SCHOOL_FORM.placeholders.email}
                    {...form.register('email')}
                  />
                </FormField>
                <Div type="row" gap="sm">
                  <FormField
                    label={CREATE_SCHOOL_FORM.labels.dial_code}
                    error={form.formState.errors.dial_code?.message}
                  >
                    <Input
                      width="xs"
                      placeholder={CREATE_SCHOOL_FORM.placeholders.dial_code}
                      {...form.register('dial_code')}
                    />
                  </FormField>
                  <FormField
                    label={CREATE_SCHOOL_FORM.labels.contact_number}
                    error={form.formState.errors.contact_number?.message}
                  >
                    <Input
                      type="tel"
                      placeholder={CREATE_SCHOOL_FORM.placeholders.contact_number}
                      {...form.register('contact_number')}
                    />
                  </FormField>
                </Div>
                <FormField
                  label={CREATE_SCHOOL_FORM.labels.website}
                  error={form.formState.errors.website?.message}
                >
                  <Input
                    type="url"
                    placeholder={CREATE_SCHOOL_FORM.placeholders.website}
                    {...form.register('website')}
                  />
                </FormField>
              </Div>

              <Div type="col" gap="md">
                <P color="muted">{CREATE_SCHOOL_FORM.sections.location}</P>
                <FormField
                  label={CREATE_SCHOOL_FORM.labels.address}
                  error={form.formState.errors.address?.message}
                >
                  <Input
                    placeholder={CREATE_SCHOOL_FORM.placeholders.address}
                    {...form.register('address')}
                  />
                </FormField>
                <Div type="grid" cols={3} gap="md">
                  <FormField
                    label={CREATE_SCHOOL_FORM.labels.city}
                    error={form.formState.errors.city?.message}
                  >
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.city} {...form.register('city')} />
                  </FormField>
                  <FormField
                    label={CREATE_SCHOOL_FORM.labels.state}
                    error={form.formState.errors.state?.message}
                  >
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.state} {...form.register('state')} />
                  </FormField>
                  <FormField
                    label={CREATE_SCHOOL_FORM.labels.pincode}
                    error={form.formState.errors.pincode?.message}
                  >
                    <Input
                      placeholder={CREATE_SCHOOL_FORM.placeholders.pincode}
                      {...form.register('pincode')}
                    />
                  </FormField>
                </Div>
              </Div>

            </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                {CREATE_SCHOOL_FORM.cancel}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {CREATE_SCHOOL_FORM.submit.idle}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
