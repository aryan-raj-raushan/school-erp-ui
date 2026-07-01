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
  Icon,
  type ColumnDef,
} from "@/components/ui";
import { Pencil, Trash2 } from "lucide-react";
import type { Subject } from "@/services/subjects.service";

export default function SubjectsPage() {
  const {
    subjects,
    isLoading,
    removeSubject,
    navigateToNew,
    navigateToEdit,
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
    [navigateToEdit, removeSubject]
  );

  return (
    <PageCol>
      <PageHeader
        title={SUBJECTS_PAGE.title}
        actions={
          <Button onClick={navigateToNew}>{SUBJECTS_PAGE.addButton}</Button>
        }
      />

      <DataTable
        columns={columns}
        data={subjects}
        isLoading={isLoading}
        emptyText={SUBJECTS_PAGE.empty}
      />
    </PageCol>
  );
}
