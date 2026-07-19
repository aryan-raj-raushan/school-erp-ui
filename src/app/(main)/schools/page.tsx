'use client';

import { useMemo } from 'react';
import { SCHOOLS_PAGE, CREATE_SCHOOL_FORM, BOARD_TYPES } from '@/constants';
import { Role } from '@/types';
import { useSchools } from '@/hooks/useSchools';
import { useAuthStore } from '@/store/auth.store';
import {
  Div, P, Button, Input, Select,
  PageHeader, PageCol, FilterBar,
  DataTable,
  Modal, ModalBody, ModalFooter, FormField, PhoneField,
  Badge, Spinner,
  type ColumnDef,
  ResponsiveSelect,
  ResponsiveModalContainer,
} from '@/components/ui';

type SchoolRow = {
  id: string;
  name: string;
  code?: string;
  board_type?: string;
  city?: string;
  is_active: boolean;
  created_at: string;
};

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

  const columns = useMemo<ColumnDef<SchoolRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: SCHOOLS_PAGE.table.name,
        meta: { primary: true },
      },
      {
        accessorKey: "code",
        header: SCHOOLS_PAGE.table.code,
        cell: ({ row }) => row.original.code ?? '—',
      },
      {
        accessorKey: "board_type",
        header: SCHOOLS_PAGE.table.board,
        cell: ({ row }) => row.original.board_type ?? '—',
      },
      {
        accessorKey: "city",
        header: SCHOOLS_PAGE.table.city,
        cell: ({ row }) => row.original.city ?? '—',
      },
      {
        accessorKey: "is_active",
        header: SCHOOLS_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'default'}>
            {row.original.is_active ? SCHOOLS_PAGE.status.active : SCHOOLS_PAGE.status.inactive}
          </Badge>
        ),
      },
      {
        id: "created_date",
        header: SCHOOLS_PAGE.table.created,
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Div type="row" gap="sm">
            <Button
              size="sm"
              onClick={() => loginAsSchool(row.original as any)}
              loading={switchingId === row.original.id}
              disabled={!row.original.is_active}
            >
              Login
            </Button>
            <Button size="sm" variant="outline" onClick={() => openEditModal(row.original as any)}>
              Edit
            </Button>
            {isSuperAdmin && (
              <Button size="sm" variant="ghost" onClick={() => deleteSchool(row.original as any)}>
                Delete
              </Button>
            )}
          </Div>
        ),
      },
    ],
    [isSuperAdmin, switchingId, loginAsSchool, openEditModal, deleteSchool]
  );

  return (
    <PageCol>
      <PageHeader
        title={SCHOOLS_PAGE.title}
        subtitle={pagination ? `${pagination.total} schools` : SCHOOLS_PAGE.description}
        illustration="/illustrations/school.svg"
        actions={isSuperAdmin ? <Button onClick={openCreateModal}>{SCHOOLS_PAGE.addButton}</Button> : undefined}
      />

      <FilterBar>
        <Input
          width="md"
          placeholder="Search by name or code"
          value={filters.search ?? ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={schools.map((school) => ({
          ...school,
          code: school.code ?? undefined,
          board_type: school.board_type ?? undefined,
          city: school.city ?? undefined,
        }))}
        isLoading={isLoading}
        emptyText={SCHOOLS_PAGE.empty}
        pagination={pagination ?? undefined}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <ResponsiveModalContainer isOpen={showCreateModal} onClose={closeCreateModal} title={CREATE_SCHOOL_FORM.title}>
          <form onSubmit={handleCreateSubmit}>
            <div className="px-4 py-4">
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
                    <ResponsiveSelect
                      {...createForm.register('board_type')}
                      customPlaceholder={CREATE_SCHOOL_FORM.placeholders.board_type}
                      options={BOARD_TYPES.map((b) => ({ value: b, label: b }))}
                    />
                  </FormField>
                </Div>
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.contact}</P>
                  <FormField label={CREATE_SCHOOL_FORM.labels.email} error={createForm.formState.errors.email?.message}>
                    <Input type="email" placeholder={CREATE_SCHOOL_FORM.placeholders.email} {...createForm.register('email')} />
                  </FormField>
                  <PhoneField
                    label={CREATE_SCHOOL_FORM.labels.contact_number}
                    dialCodeProps={createForm.register('dial_code')}
                    phoneProps={createForm.register('contact_number')}
                    phoneError={createForm.formState.errors.contact_number?.message}
                  />
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
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.admin}</P>
                  <P color="muted" className="text-xs">{CREATE_SCHOOL_FORM.adminHint}</P>
                  <Div type="grid" cols={2} gap="md">
                    <FormField label={CREATE_SCHOOL_FORM.labels.admin_first_name} error={createForm.formState.errors.admin_first_name?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.admin_first_name} {...createForm.register('admin_first_name')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.admin_last_name}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.admin_last_name} {...createForm.register('admin_last_name')} />
                    </FormField>
                  </Div>
                  <FormField label={CREATE_SCHOOL_FORM.labels.admin_email} error={createForm.formState.errors.admin_email?.message}>
                    <Input type="email" placeholder={CREATE_SCHOOL_FORM.placeholders.admin_email} {...createForm.register('admin_email')} />
                  </FormField>
                  <PhoneField
                    label={CREATE_SCHOOL_FORM.labels.admin_phone}
                    dialCodeProps={createForm.register('admin_dial_code')}
                    phoneProps={createForm.register('admin_phone')}
                    phoneError={createForm.formState.errors.admin_phone?.message}
                  />
                  <FormField label={CREATE_SCHOOL_FORM.labels.admin_password} error={createForm.formState.errors.admin_password?.message}>
                    <Input type="password" placeholder={CREATE_SCHOOL_FORM.placeholders.admin_password} {...createForm.register('admin_password')} />
                  </FormField>
                </Div>
              </Div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeCreateModal}>{CREATE_SCHOOL_FORM.cancel}</Button>
              <Button type="submit" loading={isCreating}>{CREATE_SCHOOL_FORM.submit.idle}</Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}

      {/* Edit Modal */}
      {editingSchool && (
        <ResponsiveModalContainer isOpen={!!editingSchool} onClose={closeEditModal} title={`Edit — ${editingSchool.name}`}>
          <form onSubmit={handleEditSubmit}>
            <div className="px-4 py-4">
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
                    <ResponsiveSelect
                      {...editForm.register('board_type')}
                      customPlaceholder={CREATE_SCHOOL_FORM.placeholders.board_type}
                      options={BOARD_TYPES.map((b) => ({ value: b, label: b }))}
                    />
                  </FormField>
                </Div>
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.contact}</P>
                  <FormField label={CREATE_SCHOOL_FORM.labels.email} error={editForm.formState.errors.email?.message}>
                    <Input type="email" placeholder={CREATE_SCHOOL_FORM.placeholders.email} {...editForm.register('email')} />
                  </FormField>
                  <PhoneField
                    label={CREATE_SCHOOL_FORM.labels.contact_number}
                    dialCodeProps={editForm.register('dial_code')}
                    phoneProps={editForm.register('contact_number')}
                    phoneError={editForm.formState.errors.contact_number?.message}
                  />
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
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.admin}</P>
                  <P color="muted" className="text-xs">{CREATE_SCHOOL_FORM.editAdminHint}</P>
                  <Div type="grid" cols={2} gap="md">
                    <FormField label={CREATE_SCHOOL_FORM.labels.admin_first_name} error={editForm.formState.errors.admin_first_name?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.admin_first_name} {...editForm.register('admin_first_name')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.admin_last_name}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.admin_last_name} {...editForm.register('admin_last_name')} />
                    </FormField>
                  </Div>
                  <FormField label={CREATE_SCHOOL_FORM.labels.admin_email} error={editForm.formState.errors.admin_email?.message}>
                    <Input type="email" placeholder={CREATE_SCHOOL_FORM.placeholders.admin_email} {...editForm.register('admin_email')} />
                  </FormField>
                  <PhoneField
                    label={CREATE_SCHOOL_FORM.labels.admin_phone}
                    dialCodeProps={editForm.register('admin_dial_code')}
                    phoneProps={editForm.register('admin_phone')}
                    phoneError={editForm.formState.errors.admin_phone?.message}
                  />
                  <FormField label="New Password" error={editForm.formState.errors.admin_password?.message}>
                    <Input type="password" placeholder={CREATE_SCHOOL_FORM.placeholders.admin_password} {...editForm.register('admin_password')} />
                  </FormField>
                </Div>
              </Div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeEditModal}>{CREATE_SCHOOL_FORM.cancel}</Button>
              <Button type="submit" loading={isUpdating}>Save Changes</Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
