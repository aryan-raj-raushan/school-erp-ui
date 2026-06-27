'use client';

import { useMemo } from 'react';
import { useClassDetails } from '@/hooks/useClassDetails';
import { useClasses } from '@/hooks/useClasses';
import { CLASS_DETAILS_PAGE } from '@/constants';
import {
  Div, Button,
  DataTable,
  Badge, Spinner, Icon,
  PageHeader, PageCol,
  type ColumnDef,
} from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

type ClassDetailRow = {
  id: string;
  class_id: string;
  name: string;
  year?: string;
  class_code?: string;
  max_internal_exam: number;
  best_internal_exam_count: number;
  no_of_elective_subjects: number;
  is_enabled: boolean;
};

export default function ClassDetailsPage() {
  const { classDetails, isLoading, removeClassDetail, navigateToNew, navigateToEdit } = useClassDetails();
  const { classes } = useClasses();

  const columns = useMemo<ColumnDef<ClassDetailRow>[]>(
    () => [
      {
        id: "class",
        header: CLASS_DETAILS_PAGE.table.class,
        meta: { primary: true },
        cell: ({ row }) => classes.find((c) => c.id === row.original.class_id)?.name ?? '—',
      },
      {
        accessorKey: "name",
        header: CLASS_DETAILS_PAGE.table.name,
      },
      {
        accessorKey: "year",
        header: CLASS_DETAILS_PAGE.table.year,
        cell: ({ row }) => row.original.year ?? '—',
      },
      {
        accessorKey: "class_code",
        header: CLASS_DETAILS_PAGE.table.classCode,
        cell: ({ row }) => row.original.class_code ?? '—',
      },
      {
        accessorKey: "max_internal_exam",
        header: CLASS_DETAILS_PAGE.table.maxExams,
      },
      {
        accessorKey: "best_internal_exam_count",
        header: CLASS_DETAILS_PAGE.table.bestExams,
      },
      {
        accessorKey: "no_of_elective_subjects",
        header: CLASS_DETAILS_PAGE.table.electives,
      },
      {
        accessorKey: "is_enabled",
        header: CLASS_DETAILS_PAGE.table.enabled,
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? 'success' : 'default'}>
            {row.original.is_enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: CLASS_DETAILS_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button size="sm" variant="ghost" onClick={() => navigateToEdit(row.original.id)}>
              <Icon icon={Pencil} type="sm" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => removeClassDetail(row.original.id)}>
              <Icon icon={Trash2} type="sm-danger" />
            </Button>
          </Div>
        ),
      },
    ],
    [classes, navigateToEdit, removeClassDetail]
  );

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={CLASS_DETAILS_PAGE.title}
        subtitle="Manage class detail configurations"
        actions={<Button onClick={navigateToNew}>{CLASS_DETAILS_PAGE.addButton}</Button>}
      />

      <DataTable
        columns={columns}
        data={classDetails.map((detail) => ({
          ...detail,
          year: detail.year ?? undefined,
          class_code: detail.class_code ?? undefined,
        }))}
        isLoading={isLoading}
        emptyText={CLASS_DETAILS_PAGE.empty}
      />
    </Div>
  );
}
