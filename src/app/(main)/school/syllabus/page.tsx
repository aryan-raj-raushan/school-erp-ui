'use client';

import { useMemo } from 'react';
import { useSyllabusPage } from '@/hooks/useSyllabusPage';
import { SYLLABUS_PAGE } from '@/constants';
import {
  Div, Button,
  PageHeader, PageCol,
  DataTable,
  Badge, Spinner, Icon, FilterLabel,
  type ColumnDef,
  ResponsiveSelect,
} from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

type SyllabusRow = {
  id: string;
  title: string;
  class_id: string;
  is_enabled: boolean;
};

export default function SyllabusPage() {
  const {
    syllabi, classes, isLoading,
    filterClassId, setFilterClassId,
    removeSyllabus, navigateToNew, navigateToEdit,
    getClassName,
  } = useSyllabusPage();

  const columns = useMemo<ColumnDef<SyllabusRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: SYLLABUS_PAGE.table.title,
        meta: { primary: true },
      },
      {
        id: "class",
        header: SYLLABUS_PAGE.table.class,
        cell: ({ row }) => getClassName(row.original.class_id),
      },
      {
        accessorKey: "is_enabled",
        header: SYLLABUS_PAGE.table.enabled,
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? 'success' : 'default'}>
            {row.original.is_enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: SYLLABUS_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button size="sm" variant="ghost" onClick={() => navigateToEdit(row.original.id)}>
              <Icon icon={Pencil} type="sm" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => removeSyllabus(row.original.id)}>
              <Icon icon={Trash2} type="sm-danger" />
            </Button>
          </Div>
        ),
      },
    ],
    [getClassName, navigateToEdit, removeSyllabus]
  );

  return (
    <PageCol>
      <PageHeader
        title={SYLLABUS_PAGE.title}
        actions={<Button onClick={navigateToNew}>{SYLLABUS_PAGE.addButton}</Button>}
      />

      <Div type="row" gap="md" align="end" wrap>
        <Div type="col" gap="xs">
          <FilterLabel>Class</FilterLabel>
          <ResponsiveSelect
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            customPlaceholder="All Classes"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Div>
      </Div>

      <DataTable
        columns={columns}
        data={syllabi}
        isLoading={isLoading}
        emptyText={SYLLABUS_PAGE.empty}
      />
    </PageCol>
  );
}
