'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRolesPage } from '@/hooks/useRolesPage';
import {
  Div, Button,
  PageHeader, PageCol,
  DataTable, RowActions,
  Badge, Spinner, Icon,
  type ColumnDef,
} from '@/components/ui';
import { Pencil, Trash2, Lock, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types';

type RoleRow = {
  id: string;
  name: string;
  slug: string;
  is_system: boolean;
  is_active: boolean;
};

function RolesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const legacyId = searchParams.get('id');
  const { roles, isLoading, removeRole, navigateToNew, navigateToView, navigateToEdit } = useRolesPage();
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
          <RowActions
            onView={() => navigateToView(row.original.id)}
            actions={[
              {
                label: 'Edit',
                icon: <Pencil size={14} />,
                onClick: () => navigateToEdit(row.original.id),
              },
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                hidden: row.original.is_system || !isSchoolAdmin,
                confirm: { description: `Delete the ${row.original.name} role? This cannot be undone.` },
                onClick: () => removeRole(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [navigateToView, navigateToEdit, removeRole, isSchoolAdmin]
  );

  // Old links used `?id=…` on the list route for the detail screen.
  useEffect(() => {
    if (!legacyId) return;
    const edit = searchParams.get('edit') === 'true';
    router.replace(`/school/roles/view?id=${legacyId}${edit ? '&edit=true' : ''}`);
  }, [legacyId, searchParams, router]);

  if (legacyId) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
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
