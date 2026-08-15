"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useExamGrading } from "@/hooks/exam/useExamGrading";
import type { ExamGrading } from "@/types/exam.types";
import {
  Div,
  Badge,
  Spinner,
  DataTable,
  PageHeader,
  RowActions,
  type ColumnDef,
  type PageHeaderConfig,
} from "@/components/ui";
import { GRADING_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

function GradingContent() {
  const router = useRouter();
  const { grades, isLoading, remove } = useExamGrading();

  const columns = useMemo<ColumnDef<ExamGrading>[]>(
    () => [
      {
        id: "index",
        header: GRADING_PAGE.table.sno,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "grade_name",
        header: GRADING_PAGE.table.gradeName,
        meta: { primary: true },
      },
      {
        accessorKey: "from_percentage",
        header: GRADING_PAGE.table.fromPct,
        cell: ({ row }) => `${row.original.from_percentage}%`,
      },
      {
        accessorKey: "to_percentage",
        header: GRADING_PAGE.table.toPct,
        cell: ({ row }) => `${row.original.to_percentage}%`,
      },
      {
        accessorKey: "sequence_index",
        header: GRADING_PAGE.table.seqIndex,
      },
      {
        accessorKey: "description",
        header: GRADING_PAGE.table.description,
        cell: ({ row }) => row.original.description ?? "—",
      },
      {
        accessorKey: "is_enabled",
        header: GRADING_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? "success" : "default"}>
            {row.original.is_enabled ? "Active" : "Disabled"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: GRADING_PAGE.table.actions,
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () =>
                  router.push(EXAM_ROUTES.grading.edit(row.original.id)),
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                confirm: {
                  description: `Are you sure you want to delete grade "${row.original.grade_name}"? This action cannot be undone.`,
                },
                onClick: () => remove(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [router, remove],
  );

  const pageHeaderConfig: PageHeaderConfig = {
    title: GRADING_PAGE.pageHeading.title,
    subtitle: GRADING_PAGE.pageHeading.subtitle,
    actions: [
      {
        label: GRADING_PAGE.buttons.add,
        icon: <Plus size={16} />,
        onClick: () => router.push(EXAM_ROUTES.grading.create),
      },
    ],
  };

  return (
    <Div type="col" gap="lg">
      <PageHeader {...pageHeaderConfig} />

      <DataTable
        columns={columns}
        data={grades}
        isLoading={isLoading}
        emptyText={GRADING_PAGE.table.noEntry}
      />
    </Div>
  );
}

export default function GradingPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <GradingContent />
    </Suspense>
  );
}
