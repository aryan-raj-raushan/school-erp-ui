"use client";

import { useMemo } from "react";
import { useSubjectsPage } from "@/hooks/useSubjectsPage";
import { SUBJECTS_PAGE } from "@/constants";
import {
  Div,
  Button,
  PageHeader,
  PageCol,
  DataTable,
  Badge,
  Spinner,
  Icon,
  Select,
  FilterLabel,
  type ColumnDef,
} from "@/components/ui";
import { Pencil, Trash2 } from "lucide-react";
import type { Subject } from "@/services/subjects.service";

export default function SubjectsPage() {
  const {
    subjects,
    classes,
    classDetails,
    isLoading,
    filterClassId,
    setFilterClassId,
    filterClassDetailId,
    setFilterClassDetailId,
    removeSubject,
    navigateToNew,
    navigateToEdit,
    getClassNames,
  } = useSubjectsPage();

  const columns = useMemo<ColumnDef<Subject>[]>(
    () => [
      {
        accessorKey: "name",
        header: SUBJECTS_PAGE.table.name,
        meta: { primary: true },
      },
      {
        accessorKey: "code",
        header: SUBJECTS_PAGE.table.code,
        cell: ({ row }) => row.original.code ?? "—",
      },
      {
        id: "class",
        header: "Class",
        cell: ({ row }) => getClassNames(row.original.class_ids ?? []),
      },
      {
        accessorKey: "display_order",
        header: SUBJECTS_PAGE.table.displayOrder,
      },
      {
        accessorKey: "total_marks",
        header: SUBJECTS_PAGE.table.totalMarks,
      },
      {
        accessorKey: "passing_marks",
        header: SUBJECTS_PAGE.table.passingMarks,
      },
      {
        accessorKey: "is_active",
        header: SUBJECTS_PAGE.table.enabled,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "success" : "default"}>
            {row.original.is_active ? "Enabled" : "Disabled"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: SUBJECTS_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigateToEdit(row.original.id)}
            >
              <Icon icon={Pencil} type="sm" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeSubject(row.original.id)}
            >
              <Icon icon={Trash2} type="sm-danger" />
            </Button>
          </Div>
        ),
      },
    ],
    [getClassNames, navigateToEdit, removeSubject]
  );

  return (
    <PageCol>
      <PageHeader
        title={SUBJECTS_PAGE.title}
        actions={
          <Button onClick={navigateToNew}>{SUBJECTS_PAGE.addButton}</Button>
        }
      />

      <Div type="row" gap="md" align="end" wrap>
        <Div type="col" gap="xs">
          <FilterLabel>Class</FilterLabel>
          <Select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            width="md"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Div>
        <Div type="col" gap="xs">
          <FilterLabel>Class (Year / Semester)</FilterLabel>
          <Select
            value={filterClassDetailId}
            onChange={(e) => setFilterClassDetailId(e.target.value)}
            width="md"
            disabled={!filterClassId}
          >
            <option value="">All</option>
            {classDetails.map((cd) => (
              <option key={cd.id} value={cd.id}>
                {cd.name}
              </option>
            ))}
          </Select>
        </Div>
      </Div>

      <DataTable
        columns={columns}
        data={subjects}
        isLoading={isLoading}
        emptyText={SUBJECTS_PAGE.empty}
      />
    </PageCol>
  );
}
