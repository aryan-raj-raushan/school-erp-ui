'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRolesPage } from '@/hooks/useRolesPage';
import {
  Div, Button,
  PageHeader, PageCol,
  DataTable,
  Badge, Spinner, Icon,
  type ColumnDef,
} from '@/components/ui';
import { Pencil, Trash2, Lock, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types';
import { RoleDetail } from './role-detail';

type RoleRow = {
  id: string;
  name: string;
  slug: string;
  is_system: boolean;
  is_active: boolean;
};

function RolesPageContent() {
  const searchParams = useSearchParams();
  const detailId = searchParams.get('id');
  const { roles, isLoading, removeRole, navigateToNew, navigateToEdit } = useRolesPage();
  const user = useAuthStore((s) => s.user);
  const isSchoolAdmin = user?.role === Role.SCHOOL_ADMIN;

  const columns = useMemo<ColumnDef<RoleRow>[]>(
    () => [
      {
        id: "name",
        header: "Role Name",
        meta: { primary: true },
        cell: ({ row }) => (
          <Div type="row" align="center" gap="xs">
            {row.original.is_system && <Icon icon={Lock} type="sm" />}
            {row.original.name}
          </Div>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => <code className="text-xs">{row.original.slug}</code>,
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant={row.original.is_system ? 'info' : 'default'}>
            {row.original.is_system ? 'System' : 'Custom'}
          </Badge>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'default'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button size="sm" variant="ghost" onClick={() => navigateToEdit(row.original.id)} title="Edit">
              <Icon icon={Pencil} type="sm" />
            </Button>
            {!row.original.is_system && isSchoolAdmin && (
              <Button size="sm" variant="ghost" onClick={() => removeRole(row.original.id)} title="Delete">
                <Icon icon={Trash2} type="sm-danger" />
              </Button>
            )}
          </Div>
        ),
      },
    ],
    [navigateToEdit, removeRole, isSchoolAdmin]
  );

  if (detailId) {
    return <RoleDetail id={detailId} />;
  }

  return (
    <PageCol>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Create custom roles (Driver, HOD, etc.) and assign granular permissions to each"
        actions={
          isSchoolAdmin && (
            <Button onClick={navigateToNew}>
              <Plus size={16} />
              Add New
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        emptyText="No roles found."
      />
    </PageCol>
  );
}

export default function RolesPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <RolesPageContent />
    </Suspense>
  );
}
