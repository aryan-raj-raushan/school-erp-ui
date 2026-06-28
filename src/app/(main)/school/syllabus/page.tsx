'use client';

import { useMemo } from 'react';
import { useSyllabusPage } from '@/hooks/useSyllabusPage';
import { SYLLABUS_PAGE } from '@/constants';
import {
  Div, Button,
  PageHeader, PageCol,
  DataTable,
  Badge, Spinner, Icon, Select, FilterLabel,
  type ColumnDef,
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
    syllabi, classes, classDetails, isLoading,
    filterClassId, setFilterClassId,
    filterClassDetailId, setFilterClassDetailId,
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
          <Select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)} width="md">
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Div>
        <Div type="col" gap="xs">
          <FilterLabel>Class Detail</FilterLabel>
          <Select value={filterClassDetailId} onChange={(e) => setFilterClassDetailId(e.target.value)} width="md" disabled={!filterClassId}>
            <option value="">All</option>
            {classDetails.map((cd) => <option key={cd.id} value={cd.id}>{cd.name}</option>)}
          </Select>
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
