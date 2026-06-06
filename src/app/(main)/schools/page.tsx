'use client';

import { SCHOOLS_PAGE, CREATE_SCHOOL_FORM, BOARD_TYPES } from '@/constants';
import { Role } from '@/types';
import { useSchools } from '@/hooks/useSchools';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, P, Button, Input, Select,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
  Modal, ModalBody, ModalFooter, FormField,
  Badge, Spinner,
} from '@/components/ui';

export default function SchoolsPage() {
  const {
    schools, pagination, filters, isLoading, switchingId,
    showCreateModal, openCreateModal, closeCreateModal, createForm, handleCreateSubmit, isCreating,
    editingSchool, openEditModal, closeEditModal, editForm, handleEditSubmit, isUpdating,
    deleteSchool, loginAsSchool,
    updateFilters,
  } = useSchools();

  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={SCHOOLS_PAGE.title}
        subtitle={pagination ? `${pagination.total} schools` : SCHOOLS_PAGE.description}
        illustration="/illustrations/school.svg"
        actions={isSuperAdmin ? <Button onClick={openCreateModal}>{SCHOOLS_PAGE.addButton}</Button> : undefined}
      />

      <Div type="row" gap="md" align="center" wrap>
        <Input
          width="md"
          placeholder="Search by name or code"
          value={filters.search ?? ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{SCHOOLS_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.code}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.board}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.city}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{SCHOOLS_PAGE.table.created}</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={7}><Spinner /></TableEmptyRow>
          ) : schools.length === 0 ? (
            <TableEmptyRow colSpan={7}>{SCHOOLS_PAGE.empty}</TableEmptyRow>
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
                <TableCell>
                  <Div type="row" gap="sm">
                    <Button
                      size="sm"
                      onClick={() => loginAsSchool(school)}
                      loading={switchingId === school.id}
                      disabled={!school.is_active}
                    >
                      Login
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditModal(school)}>
                      Edit
                    </Button>
                    {isSuperAdmin && (
                      <Button size="sm" variant="ghost" onClick={() => deleteSchool(school)}>
                        Delete
                      </Button>
                    )}
                  </Div>
                </TableCell>
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

      {/* Create Modal */}
      {showCreateModal && (
        <Modal onClose={closeCreateModal} title={CREATE_SCHOOL_FORM.title}>
          <form onSubmit={handleCreateSubmit}>
            <ModalBody>
              <Div type="col" gap="lg">
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.basic}</P>
                  <Div type="grid" cols={2} gap="md">
                    <FormField label={`${CREATE_SCHOOL_FORM.labels.name} *`} error={createForm.formState.errors.name?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.name} {...createForm.register('name')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.code}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.code} {...createForm.register('code')} />
                    </FormField>
                  </Div>
                  <FormField label={CREATE_SCHOOL_FORM.labels.board_type}>
                    <Select {...createForm.register('board_type')}>
                      <option value="">{CREATE_SCHOOL_FORM.placeholders.board_type}</option>
                      {BOARD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </Select>
                  </FormField>
                </Div>
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.contact}</P>
                  <FormField label={CREATE_SCHOOL_FORM.labels.email} error={createForm.formState.errors.email?.message}>
                    <Input type="email" placeholder={CREATE_SCHOOL_FORM.placeholders.email} {...createForm.register('email')} />
                  </FormField>
                  <Div type="row" gap="sm">
                    <FormField label={CREATE_SCHOOL_FORM.labels.dial_code}>
                      <Input width="xs" placeholder={CREATE_SCHOOL_FORM.placeholders.dial_code} {...createForm.register('dial_code')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.contact_number} error={createForm.formState.errors.contact_number?.message}>
                      <Input type="tel" placeholder={CREATE_SCHOOL_FORM.placeholders.contact_number} {...createForm.register('contact_number')} />
                    </FormField>
                  </Div>
                  <FormField label={CREATE_SCHOOL_FORM.labels.website} error={createForm.formState.errors.website?.message}>
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.website} {...createForm.register('website')} />
                  </FormField>
                </Div>
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.location}</P>
                  <FormField label={CREATE_SCHOOL_FORM.labels.address}>
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.address} {...createForm.register('address')} />
                  </FormField>
                  <Div type="grid" cols={3} gap="md">
                    <FormField label={CREATE_SCHOOL_FORM.labels.city}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.city} {...createForm.register('city')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.state}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.state} {...createForm.register('state')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.pincode}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.pincode} {...createForm.register('pincode')} />
                    </FormField>
                  </Div>
                </Div>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeCreateModal}>{CREATE_SCHOOL_FORM.cancel}</Button>
              <Button type="submit" loading={isCreating}>{CREATE_SCHOOL_FORM.submit.idle}</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingSchool && (
        <Modal onClose={closeEditModal} title={`Edit — ${editingSchool.name}`}>
          <form onSubmit={handleEditSubmit}>
            <ModalBody>
              <Div type="col" gap="lg">
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.basic}</P>
                  <Div type="grid" cols={2} gap="md">
                    <FormField label={`${CREATE_SCHOOL_FORM.labels.name} *`} error={editForm.formState.errors.name?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.name} {...editForm.register('name')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.code}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.code} {...editForm.register('code')} />
                    </FormField>
                  </Div>
                  <FormField label={CREATE_SCHOOL_FORM.labels.board_type}>
                    <Select {...editForm.register('board_type')}>
                      <option value="">{CREATE_SCHOOL_FORM.placeholders.board_type}</option>
                      {BOARD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </Select>
                  </FormField>
                </Div>
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.contact}</P>
                  <FormField label={CREATE_SCHOOL_FORM.labels.email} error={editForm.formState.errors.email?.message}>
                    <Input type="email" placeholder={CREATE_SCHOOL_FORM.placeholders.email} {...editForm.register('email')} />
                  </FormField>
                  <Div type="row" gap="sm">
                    <FormField label={CREATE_SCHOOL_FORM.labels.dial_code}>
                      <Input width="xs" placeholder={CREATE_SCHOOL_FORM.placeholders.dial_code} {...editForm.register('dial_code')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.contact_number} error={editForm.formState.errors.contact_number?.message}>
                      <Input type="tel" placeholder={CREATE_SCHOOL_FORM.placeholders.contact_number} {...editForm.register('contact_number')} />
                    </FormField>
                  </Div>
                  <FormField label={CREATE_SCHOOL_FORM.labels.website} error={editForm.formState.errors.website?.message}>
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.website} {...editForm.register('website')} />
                  </FormField>
                </Div>
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.location}</P>
                  <FormField label={CREATE_SCHOOL_FORM.labels.address}>
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.address} {...editForm.register('address')} />
                  </FormField>
                  <Div type="grid" cols={3} gap="md">
                    <FormField label={CREATE_SCHOOL_FORM.labels.city}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.city} {...editForm.register('city')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.state}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.state} {...editForm.register('state')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.pincode}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.pincode} {...editForm.register('pincode')} />
                    </FormField>
                  </Div>
                </Div>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeEditModal}>{CREATE_SCHOOL_FORM.cancel}</Button>
              <Button type="submit" loading={isUpdating}>Save Changes</Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}
