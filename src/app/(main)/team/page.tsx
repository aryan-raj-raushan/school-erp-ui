'use client';

import { useMemo } from 'react';
import { TEAM_PAGE, CREATE_TEAM_MEMBER_FORM } from '@/constants';
import { Role } from '@/types';
import { useCompanyUsers } from '@/hooks/useCompanyUsers';
import type { CompanyUser } from '@/services/company-users.service';
import { Div, P, Button, Input, PageHeader, PageCol, FilterBar, DataTable, ResponsiveModalContainer, FormField, Badge, type ColumnDef, ResponsiveSelect, RowActions, MobileFormSheet, BottomSheet, MobileSelectField, Span } from '@/components/ui';
import { Building2, Power, PowerOff, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ASSIGNABLE_ROLE_OPTIONS = [
  { value: Role.SALES, label: TEAM_PAGE.roleLabels.SALES },
  { value: Role.OPERATOR, label: TEAM_PAGE.roleLabels.OPERATOR },
  { value: Role.SUPPORT, label: TEAM_PAGE.roleLabels.SUPPORT },
  { value: Role.ADMIN, label: TEAM_PAGE.roleLabels.ADMIN },
];

function roleLabel(role: string): string {
  return (TEAM_PAGE.roleLabels as Record<string, string>)[role] ?? role;
}

export default function TeamPage() {
  const isMobile = useIsMobile();
  const {
    users, pagination, filters, isLoading,
    showCreateModal, openCreateModal, closeCreateModal, createForm, handleCreateSubmit, isCreating,
    toggleActive, deleteUser, updateFilters,
    managingSchoolsFor, assignedSchools, allSchools, isSchoolsLoading,
    openSchoolsModal, closeSchoolsModal, assignSchool, unassignSchool,
  } = useCompanyUsers();

  const unassignedSchools = useMemo(
    () => allSchools.filter((s) => !assignedSchools.some((a) => a.school_id === s.id)),
    [allSchools, assignedSchools],
  );

  const columns = useMemo<ColumnDef<CompanyUser>[]>(
    () => [
      {
        id: 'name',
        header: TEAM_PAGE.table.name,
        cell: ({ row }) => `${row.original.first_name} ${row.original.last_name ?? ''}`.trim(),
        meta: { primary: true },
      },
      {
        accessorKey: 'email',
        header: TEAM_PAGE.table.email,
      },
      {
        accessorKey: 'role',
        header: TEAM_PAGE.table.role,
        cell: ({ row }) => <Badge variant="default">{roleLabel(row.original.role)}</Badge>,
      },
      {
        accessorKey: 'is_active',
        header: TEAM_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'default'}>
            {row.original.is_active ? TEAM_PAGE.status.active : TEAM_PAGE.status.inactive}
          </Badge>
        ),
      },
      {
        id: 'lastLogin',
        header: TEAM_PAGE.table.lastLogin,
        cell: ({ row }) =>
          row.original.last_login_at ? new Date(row.original.last_login_at).toLocaleDateString() : '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const canManageSchools =
            row.original.role === Role.SALES || row.original.role === Role.OPERATOR;
          return (
            <RowActions
              actions={[
                {
                  label: 'Schools',
                  icon: <Building2 size={14} />,
                  hidden: !canManageSchools,
                  onClick: () => openSchoolsModal(row.original),
                },
                {
                  label: row.original.is_active ? 'Deactivate' : 'Activate',
                  icon: row.original.is_active ? <PowerOff size={14} /> : <Power size={14} />,
                  onClick: () => toggleActive(row.original),
                },
                {
                  label: 'Delete',
                  icon: <Trash2 size={14} />,
                  variant: 'destructive',
                  confirm: {
                    description: `Remove ${row.original.first_name} from the team? This cannot be undone.`,
                  },
                  onClick: () => deleteUser(row.original),
                },
              ]}
            />
          );
        },
      },
    ],
    [toggleActive, deleteUser, openSchoolsModal],
  );

  return (
    <PageCol>
      <PageHeader
        title={TEAM_PAGE.title}
        subtitle={pagination ? `${pagination.total} team members` : TEAM_PAGE.description}
        actions={<Button onClick={openCreateModal}>{TEAM_PAGE.addButton}</Button>}
      />

      <FilterBar>
        <Input
          width="md"
          placeholder="Search by name"
          value={filters.search ?? ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyText={TEAM_PAGE.empty}
        pagination={pagination ?? undefined}
      />

      {isMobile && (
        <MobileFormSheet
          isOpen={showCreateModal}
          onClose={closeCreateModal}
          title={CREATE_TEAM_MEMBER_FORM.title}
          form={createForm}
          onSubmit={handleCreateSubmit}
          isSubmitting={isCreating}
          submitLabel={CREATE_TEAM_MEMBER_FORM.submit.idle}
          cancelLabel={CREATE_TEAM_MEMBER_FORM.cancel}
          fields={[
            {
              kind: 'row',
              fields: [
                {
                  kind: 'input',
                  name: 'first_name',
                  label: CREATE_TEAM_MEMBER_FORM.labels.first_name,
                  required: true,
                  autoCapitalize: 'words',
                },
                {
                  kind: 'input',
                  name: 'last_name',
                  label: CREATE_TEAM_MEMBER_FORM.labels.last_name,
                  autoCapitalize: 'words',
                },
              ],
            },
            {
              kind: 'input',
              type: 'email',
              name: 'email',
              label: CREATE_TEAM_MEMBER_FORM.labels.email,
              required: true,
              placeholder: CREATE_TEAM_MEMBER_FORM.placeholders.email,
              autoCapitalize: 'none',
            },
            {
              kind: 'input',
              type: 'password',
              name: 'password',
              label: CREATE_TEAM_MEMBER_FORM.labels.password,
              required: true,
              placeholder: CREATE_TEAM_MEMBER_FORM.placeholders.password,
            },
            {
              kind: 'select',
              name: 'role',
              label: CREATE_TEAM_MEMBER_FORM.labels.role,
              required: true,
              placeholder: 'Select role',
              options: ASSIGNABLE_ROLE_OPTIONS,
            },
          ]}
        />
      )}

      {!isMobile && showCreateModal && (
        <ResponsiveModalContainer isOpen={showCreateModal} onClose={closeCreateModal} title={CREATE_TEAM_MEMBER_FORM.title}>
          <form onSubmit={handleCreateSubmit}>
            <Div className="px-4 py-4">
              <Div type="col" gap="md">
                <Div type="grid" cols={2} gap="md">
                  <FormField label={CREATE_TEAM_MEMBER_FORM.labels.first_name} error={createForm.formState.errors.first_name?.message}>
                    <Input placeholder={CREATE_TEAM_MEMBER_FORM.placeholders.first_name} {...createForm.register('first_name')} />
                  </FormField>
                  <FormField label={CREATE_TEAM_MEMBER_FORM.labels.last_name}>
                    <Input placeholder={CREATE_TEAM_MEMBER_FORM.placeholders.last_name} {...createForm.register('last_name')} />
                  </FormField>
                </Div>
                <FormField label={CREATE_TEAM_MEMBER_FORM.labels.email} error={createForm.formState.errors.email?.message}>
                  <Input type="email" placeholder={CREATE_TEAM_MEMBER_FORM.placeholders.email} {...createForm.register('email')} />
                </FormField>
                <FormField label={CREATE_TEAM_MEMBER_FORM.labels.password} error={createForm.formState.errors.password?.message}>
                  <Input type="password" placeholder={CREATE_TEAM_MEMBER_FORM.placeholders.password} {...createForm.register('password')} />
                </FormField>
                <FormField label={CREATE_TEAM_MEMBER_FORM.labels.role} error={createForm.formState.errors.role?.message}>
                  <ResponsiveSelect
                    {...createForm.register('role')}
                    customPlaceholder="Select role"
                    options={ASSIGNABLE_ROLE_OPTIONS}
                  />
                </FormField>
              </Div>
            </Div>
            <Div type="row" className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeCreateModal}>{CREATE_TEAM_MEMBER_FORM.cancel}</Button>
              <Button type="submit" loading={isCreating}>{CREATE_TEAM_MEMBER_FORM.submit.idle}</Button>
            </Div>
          </form>
        </ResponsiveModalContainer>
      )}

      {isMobile && (
        <BottomSheet
          isOpen={!!managingSchoolsFor}
          onClose={closeSchoolsModal}
          title={managingSchoolsFor ? `${TEAM_PAGE.schoolsModal.title} — ${managingSchoolsFor.first_name}` : undefined}
          maxHeight="85dvh"
        >
          <Div className="flex flex-col gap-4 pt-1">
            <P className="text-xs text-muted-foreground">{TEAM_PAGE.schoolsModal.hint}</P>
            {!isSchoolsLoading && unassignedSchools.length > 0 && (
              <MobileSelectField
                key={assignedSchools.map((s) => s.school_id).join(',')}
                label={TEAM_PAGE.schoolsModal.assign}
                placeholder="Select a school to assign"
                value=""
                onChange={assignSchool}
                options={unassignedSchools.map((s) => ({ value: s.id, label: s.name }))}
              />
            )}
            {assignedSchools.length === 0 && !isSchoolsLoading && (
              <P className="py-2 text-center text-sm text-muted-foreground">{TEAM_PAGE.schoolsModal.empty}</P>
            )}
            <ul className="flex flex-col gap-2">
              {assignedSchools.map((s) => (
                <li
                  key={s.school_id}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-border/60 p-3"
                >
                  <Span className="min-w-0 truncate text-[15px] font-medium">{s.school_name}</Span>
                  <Button size="sm" variant="destructive" onClick={() => unassignSchool(s.school_id)}>
                    {TEAM_PAGE.schoolsModal.remove}
                  </Button>
                </li>
              ))}
            </ul>
          </Div>
        </BottomSheet>
      )}

      {!isMobile && managingSchoolsFor && (
        <ResponsiveModalContainer
          isOpen={!!managingSchoolsFor}
          onClose={closeSchoolsModal}
          title={`${TEAM_PAGE.schoolsModal.title} — ${managingSchoolsFor.first_name}`}
        >
          <Div className="px-4 py-4">
            <Div type="col" gap="md">
              <P color="muted" className="text-xs">{TEAM_PAGE.schoolsModal.hint}</P>

              {!isSchoolsLoading && unassignedSchools.length > 0 && (
                <FormField label={TEAM_PAGE.schoolsModal.assign}>
                  <ResponsiveSelect
                    key={assignedSchools.map((s) => s.school_id).join(',')}
                    customPlaceholder="Select a school to assign"
                    options={unassignedSchools.map((s) => ({ value: s.id, label: s.name }))}
                    onChange={(e) => assignSchool(e.target.value)}
                  />
                </FormField>
              )}

              <Div type="col" gap="sm">
                {assignedSchools.length === 0 && !isSchoolsLoading && (
                  <P color="muted">{TEAM_PAGE.schoolsModal.empty}</P>
                )}
                {assignedSchools.map((s) => (
                  <Div key={s.school_id} type="row" gap="sm" className="items-center justify-between">
                    <P>{s.school_name}</P>
                    <Button size="sm" variant="ghost" onClick={() => unassignSchool(s.school_id)}>
                      {TEAM_PAGE.schoolsModal.remove}
                    </Button>
                  </Div>
                ))}
              </Div>
            </Div>
          </Div>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
