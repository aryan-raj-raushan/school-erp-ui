'use client';

import { useMemo } from 'react';
import { TEAM_PAGE, CREATE_TEAM_MEMBER_FORM } from '@/constants';
import { Role } from '@/types';
import { useCompanyUsers } from '@/hooks/useCompanyUsers';
import type { CompanyUser } from '@/services/company-users.service';
import {
  Div, P, Button, Input,
  PageHeader, PageCol, FilterBar,
  DataTable,
  ResponsiveModalContainer, FormField,
  Badge,
  type ColumnDef,
  ResponsiveSelect,
} from '@/components/ui';

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
        cell: ({ row }) => (
          <Div type="row" gap="sm">
            {(row.original.role === Role.SALES || row.original.role === Role.OPERATOR) && (
              <Button size="sm" variant="outline" onClick={() => openSchoolsModal(row.original)}>
                Schools
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => toggleActive(row.original)}>
              {row.original.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => deleteUser(row.original)}>
              Delete
            </Button>
          </Div>
        ),
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

      {showCreateModal && (
        <ResponsiveModalContainer isOpen={showCreateModal} onClose={closeCreateModal} title={CREATE_TEAM_MEMBER_FORM.title}>
          <form onSubmit={handleCreateSubmit}>
            <div className="px-4 py-4">
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
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeCreateModal}>{CREATE_TEAM_MEMBER_FORM.cancel}</Button>
              <Button type="submit" loading={isCreating}>{CREATE_TEAM_MEMBER_FORM.submit.idle}</Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}

      {managingSchoolsFor && (
        <ResponsiveModalContainer
          isOpen={!!managingSchoolsFor}
          onClose={closeSchoolsModal}
          title={`${TEAM_PAGE.schoolsModal.title} — ${managingSchoolsFor.first_name}`}
        >
          <div className="px-4 py-4">
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
          </div>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
