'use client';

import { useMemo } from 'react';
import { useDepartmentsPage } from '@/hooks/useDepartmentsPage';
import { DEPARTMENTS_PAGE } from '@/constants';
import {
  Div, Button,
  PageHeader, PageCol,
  DataTable,
  Badge, Spinner, Icon,
  type ColumnDef,
} from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

type DepartmentRow = {
  id: string;
  name: string;
  address?: string;
  description?: string;
  is_active: boolean;
};

export default function DepartmentsPage() {
  const { departments, isLoading, removeDepartment, navigateToNew, navigateToEdit } = useDepartmentsPage();

  const columns = useMemo<ColumnDef<DepartmentRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: DEPARTMENTS_PAGE.table.name,
        meta: { primary: true },
      },
      {
        accessorKey: "address",
        header: DEPARTMENTS_PAGE.table.address,
        cell: ({ row }) => row.original.address ?? '—',
      },
      {
        accessorKey: "description",
        header: DEPARTMENTS_PAGE.table.description,
        cell: ({ row }) => row.original.description ?? '—',
      },
      {
        accessorKey: "is_active",
        header: DEPARTMENTS_PAGE.table.enabled,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'default'}>
            {row.original.is_active ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: DEPARTMENTS_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button size="sm" variant="ghost" onClick={() => navigateToEdit(row.original.id)}>
              <Icon icon={Pencil} type="sm" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => removeDepartment(row.original.id)}>
              <Icon icon={Trash2} type="sm-danger" />
            </Button>
          </Div>
        ),
      },
    ],
    [navigateToEdit, removeDepartment]
  );

  return (
    <PageCol>
      <PageHeader
        title={DEPARTMENTS_PAGE.title}
        actions={<Button onClick={navigateToNew}>{DEPARTMENTS_PAGE.addButton}</Button>}
      />

      <DataTable
        columns={columns}
        data={departments.map((dept) => ({
          ...dept,
          address: dept.address ?? undefined,
          description: dept.description ?? undefined,
        }))}
        isLoading={isLoading}
        emptyText={DEPARTMENTS_PAGE.empty}
      />
    </PageCol>
  );
}
