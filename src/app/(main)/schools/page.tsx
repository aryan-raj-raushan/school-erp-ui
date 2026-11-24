'use client';

import { useMemo } from 'react';
import { SCHOOLS_PAGE, CREATE_SCHOOL_FORM, BOARD_TYPES } from '@/constants';
import { Role, type SchoolApprovalStatus } from '@/types';
import { useSchools } from '@/hooks/useSchools';
import { useAuthStore } from '@/store/auth.store';
import {
  Div,
  P,
  Button,
  Input,
  PageHeader,
  PageCol,
  FilterBar,
  DataTable,
  FormField,
  PhoneField,
  WebsiteField,
  Badge,
  type ColumnDef,
  ResponsiveSelect,
  ResponsiveModalContainer,
  RowActions,
} from '@/components/ui';
import { Ban, BadgeCheck, DatabaseBackup, KeyRound, LogIn, Pencil, Trash2 } from 'lucide-react';
import { CredentialsDialog } from '@/components/shared/CredentialsDialog';
import { DeleteSchoolDialog } from '@/components/platform/DeleteSchoolDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { SchoolMobileForm } from '@/components/platform/SchoolMobileForm';
import { SchoolSupportFields } from '@/components/platform/SchoolSupportFields';
import { MARKING_SYSTEM_OPTIONS } from '@/constants/school-profile.constants';

type SchoolRow = {
  id: string;
  name: string;
  code?: string;
  board_type?: string;
  city?: string;
  is_active: boolean;
  approval_status?: SchoolApprovalStatus;
  created_at: string;
};

const APPROVAL_FILTER_OPTIONS = [
  { value: 'PENDING', label: 'Awaiting approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function SchoolsPage() {
  const isMobile = useIsMobile();
  const {
    schools, pagination, filters, isLoading, switchingId,
    showCreateModal, openCreateModal, closeCreateModal, createForm, handleCreateSubmit, isCreating,
    editingSchool, openEditModal, closeEditModal, editForm, handleEditSubmit, isUpdating,
    deleteSchool, approveSchool, rejectSchool, loginAsSchool, resetAdminPassword, downloadBackup,
    deletingSchool, closeDeleteDialog, handleSchoolDeleted,
    issuedCredentials, clearIssuedCredentials,
    updateFilters,
    createPincode, editPincode,
  } = useSchools();

  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;

  const schoolById = useMemo(() => new Map(schools.map((school) => [school.id, school])), [schools]);

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
        cell: ({ row }) =>
          row.original.approval_status === 'PENDING' ? (
            <Badge variant="warning">Awaiting approval</Badge>
          ) : row.original.approval_status === 'REJECTED' ? (
            <Badge variant="danger">Rejected</Badge>
          ) : (
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
          <RowActions
            actions={[
              {
                label: 'Approve registration',
                icon: <BadgeCheck size={14} />,
                hidden: row.original.approval_status === 'APPROVED' || !row.original.approval_status,
                confirm: { description: `Approve ${row.original.name}? Its admin will be able to sign in.` },
                onClick: () => approveSchool(schoolById.get(row.original.id)!),
              },
              {
                label: 'Reject registration',
                icon: <Ban size={14} />,
                variant: 'destructive',
                hidden: row.original.approval_status !== 'PENDING',
                confirm: { description: `Reject the registration of ${row.original.name}? Its admin will not be able to sign in.` },
                onClick: () => rejectSchool(schoolById.get(row.original.id)!),
              },
              {
                label: 'Login as school',
                icon: <LogIn size={14} />,
                disabled: !row.original.is_active || switchingId === row.original.id,
                onClick: () => loginAsSchool(schoolById.get(row.original.id)!),
              },
              {
                label: 'Edit',
                icon: <Pencil size={14} />,
                onClick: () => openEditModal(schoolById.get(row.original.id)!),
              },
              {
                label: 'Reset admin password',
                icon: <KeyRound size={14} />,
                hidden: !isSuperAdmin,
                confirm: { description: `Issue a new temporary password for the admin of ${row.original.name}? The current password will stop working.` },
                onClick: () => resetAdminPassword(schoolById.get(row.original.id)!),
              },
              {
                label: 'Download backup',
                icon: <DatabaseBackup size={14} />,
                hidden: !isSuperAdmin,
                onClick: () => downloadBackup(schoolById.get(row.original.id)!),
              },
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                hidden: !isSuperAdmin,
                confirm: false,
                onClick: () => deleteSchool(schoolById.get(row.original.id)!),
              },
            ]}
          />
        ),
      },
    ],
    [schoolById, isSuperAdmin, switchingId, loginAsSchool, openEditModal, deleteSchool, resetAdminPassword, downloadBackup, approveSchool, rejectSchool]
  );

  const credentialsDialog = (
    <CredentialsDialog
      title="School admin login"
      credentials={issuedCredentials}
      onClose={clearIssuedCredentials}
    />
  );

  if (isMobile && showCreateModal) {
    return (
      <SchoolMobileForm
        form={createForm}
        pincodeLookup={createPincode}
        title={CREATE_SCHOOL_FORM.title}
        submitLabel={CREATE_SCHOOL_FORM.submit.idle}
        isEditing={false}
        isSubmitting={isCreating}
        onSubmit={handleCreateSubmit}
        onCancel={closeCreateModal}
      />
    );
  }

  if (isMobile && editingSchool) {
    return (
      <SchoolMobileForm
        form={editForm}
        pincodeLookup={editPincode}
        title={`Edit — ${editingSchool.name}`}
        submitLabel="Save changes"
        isEditing
        schoolCode={editingSchool.code}
        isSubmitting={isUpdating}
        onSubmit={handleEditSubmit}
        onCancel={closeEditModal}
      />
    );
  }

  return (
    <PageCol>
      {credentialsDialog}
      {deletingSchool && (
        <DeleteSchoolDialog
          key={deletingSchool.id}
          school={deletingSchool}
          onClose={closeDeleteDialog}
          onDeleted={handleSchoolDeleted}
          onDownloadBackup={() => downloadBackup(deletingSchool)}
        />
      )}
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
        <ResponsiveSelect
          width="md"
          options={APPROVAL_FILTER_OPTIONS}
          customPlaceholder="All registrations"
          value={filters.approval_status ?? ''}
          onChange={(e) => updateFilters({ approval_status: (e.target.value || undefined) as SchoolApprovalStatus | undefined })}
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
        pagination={pagination ? { ...pagination, onPageChange: (page) => updateFilters({ page }) } : undefined}
      />

      {/* Create Modal */}
      {!isMobile && showCreateModal && (
        <ResponsiveModalContainer isOpen={showCreateModal} onClose={closeCreateModal} title={CREATE_SCHOOL_FORM.title}>
          <form onSubmit={handleCreateSubmit}>
            <Div className="px-4 py-4">
              <Div type="col" gap="lg">
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.basic}</P>
                  <Div type="grid" cols={2} gap="md">
                    <FormField label={`${CREATE_SCHOOL_FORM.labels.name} *`} error={createForm.formState.errors.name?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.name} {...createForm.register('name')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.code}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.code} disabled />
                    </FormField>
                  </Div>
                  <Div type="grid" cols={2} gap="md">
                    <FormField label={CREATE_SCHOOL_FORM.labels.board_type}>
                      <ResponsiveSelect
                        {...createForm.register('board_type')}
                        customPlaceholder={CREATE_SCHOOL_FORM.placeholders.board_type}
                        options={BOARD_TYPES.map((b) => ({ value: b, label: b }))}
                      />
                    </FormField>
                    <FormField label="Marking system">
                      <ResponsiveSelect
                        {...createForm.register('marking_system')}
                        customPlaceholder="Select system"
                        options={MARKING_SYSTEM_OPTIONS}
                      />
                    </FormField>
                  </Div>
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
                    phoneError={createForm.formState.errors.contact_number?.message ?? createForm.formState.errors.dial_code?.message}
                  />
                  <WebsiteField control={createForm.control} name="website" label={CREATE_SCHOOL_FORM.labels.website} />
                </Div>
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.location}</P>
                  <FormField label={CREATE_SCHOOL_FORM.labels.address} error={createForm.formState.errors.address?.message}>
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.address} {...createForm.register('address')} />
                  </FormField>
                  <Div type="grid" cols={3} gap="md">
                    <FormField
                      label={CREATE_SCHOOL_FORM.labels.pincode}
                      error={createForm.formState.errors.pincode?.message ?? createPincode.lookupError}
                      hint={createPincode.isLooking ? 'Looking up…' : 'Fills city & state'}
                    >
                      <Input inputMode="numeric" maxLength={6} placeholder={CREATE_SCHOOL_FORM.placeholders.pincode} {...createForm.register('pincode')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.city} error={createForm.formState.errors.city?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.city} {...createForm.register('city')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.state} error={createForm.formState.errors.state?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.state} {...createForm.register('state')} />
                    </FormField>
                  </Div>
                </Div>
                <SchoolSupportFields form={createForm} />
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
                    phoneError={createForm.formState.errors.admin_phone?.message ?? createForm.formState.errors.admin_dial_code?.message}
                  />
                </Div>
              </Div>
            </Div>
            <Div type="row" className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeCreateModal}>{CREATE_SCHOOL_FORM.cancel}</Button>
              <Button type="submit" loading={isCreating}>{CREATE_SCHOOL_FORM.submit.idle}</Button>
            </Div>
          </form>
        </ResponsiveModalContainer>
      )}

      {/* Edit Modal */}
      {!isMobile && editingSchool && (
        <ResponsiveModalContainer isOpen={!!editingSchool} onClose={closeEditModal} title={`Edit — ${editingSchool.name}`}>
          <form onSubmit={handleEditSubmit}>
            <Div className="px-4 py-4">
              <Div type="col" gap="lg">
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.basic}</P>
                  <Div type="grid" cols={2} gap="md">
                    <FormField label={`${CREATE_SCHOOL_FORM.labels.name} *`} error={editForm.formState.errors.name?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.name} {...editForm.register('name')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.code}>
                      <Input value={editingSchool.code ?? ''} readOnly disabled />
                    </FormField>
                  </Div>
                  <Div type="grid" cols={2} gap="md">
                    <FormField label={CREATE_SCHOOL_FORM.labels.board_type}>
                      <ResponsiveSelect
                        {...editForm.register('board_type')}
                        customPlaceholder={CREATE_SCHOOL_FORM.placeholders.board_type}
                        options={BOARD_TYPES.map((b) => ({ value: b, label: b }))}
                      />
                    </FormField>
                    <FormField label="Marking system">
                      <ResponsiveSelect
                        {...editForm.register('marking_system')}
                        customPlaceholder="Select system"
                        options={MARKING_SYSTEM_OPTIONS}
                      />
                    </FormField>
                  </Div>
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
                    phoneError={editForm.formState.errors.contact_number?.message ?? editForm.formState.errors.dial_code?.message}
                  />
                  <WebsiteField control={editForm.control} name="website" label={CREATE_SCHOOL_FORM.labels.website} />
                </Div>
                <Div type="col" gap="md">
                  <P color="muted">{CREATE_SCHOOL_FORM.sections.location}</P>
                  <FormField label={CREATE_SCHOOL_FORM.labels.address} error={editForm.formState.errors.address?.message}>
                    <Input placeholder={CREATE_SCHOOL_FORM.placeholders.address} {...editForm.register('address')} />
                  </FormField>
                  <Div type="grid" cols={3} gap="md">
                    <FormField
                      label={CREATE_SCHOOL_FORM.labels.pincode}
                      error={editForm.formState.errors.pincode?.message ?? editPincode.lookupError}
                      hint={editPincode.isLooking ? 'Looking up…' : 'Fills city & state'}
                    >
                      <Input inputMode="numeric" maxLength={6} placeholder={CREATE_SCHOOL_FORM.placeholders.pincode} {...editForm.register('pincode')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.city} error={editForm.formState.errors.city?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.city} {...editForm.register('city')} />
                    </FormField>
                    <FormField label={CREATE_SCHOOL_FORM.labels.state} error={editForm.formState.errors.state?.message}>
                      <Input placeholder={CREATE_SCHOOL_FORM.placeholders.state} {...editForm.register('state')} />
                    </FormField>
                  </Div>
                </Div>
                <SchoolSupportFields form={editForm} />
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
                    phoneError={editForm.formState.errors.admin_phone?.message ?? editForm.formState.errors.admin_dial_code?.message}
                  />
                </Div>
              </Div>
            </Div>
            <Div type="row" className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeEditModal}>{CREATE_SCHOOL_FORM.cancel}</Button>
              <Button type="submit" loading={isUpdating}>Save Changes</Button>
            </Div>
          </form>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
