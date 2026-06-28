"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useHallDetails } from "@/hooks/exam/useExamHall";
import type { ExamHallDetail } from "@/types/exam.types";
import {
  Div,
  Button,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
} from "@/components/ui";
import { PageHeader } from "@/components/ui/page-header";
import { HALL_DETAILS_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

function HallDetailsContent() {
  const router = useRouter();
  const { details, pagination, isLoading, remove } = useHallDetails();

  const columns = useMemo<ColumnDef<ExamHallDetail>[]>(
    () => [
      {
        id: "index",
        header: HALL_DETAILS_PAGE.table.sno,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "room_name",
        header: HALL_DETAILS_PAGE.table.roomName,
        meta: { primary: true },
      },
      {
        accessorKey: "sitting_capacity",
        header: HALL_DETAILS_PAGE.table.capacity,
        cell: ({ row }) =>
          row.original.grid_rows && row.original.grid_cols
            ? `${row.original.grid_rows} × ${row.original.grid_cols} = ${row.original.sitting_capacity} seats`
            : `${row.original.sitting_capacity} seats`,
      },
      {
        accessorKey: "is_enabled",
        header: HALL_DETAILS_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? "success" : "default"}>
            {row.original.is_enabled ? "Active" : "Disabled"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: HALL_DETAILS_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button
              size="icon-sm"
              variant="ghost"
              title="Edit"
              onClick={() =>
                router.push(EXAM_ROUTES.hallDetails.edit(row.original.id))
              }
            >
              <Pencil size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="destructive"
              title="Delete"
              onClick={() => remove(row.original.id)}
            >
              <Trash2 size={14} />
            </Button>
          </Div>
        ),
      },
    ],
    [router, remove],
  );

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={HALL_DETAILS_PAGE.pageHeading.title}
        subtitle={HALL_DETAILS_PAGE.pageHeading.subtitle}
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.hallDetails.create)}>
            <Plus size={16} /> {HALL_DETAILS_PAGE.buttons.add}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={details}
        isLoading={isLoading}
        emptyText={HALL_DETAILS_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
      />
    </Div>
  );
}

export default function HallDetailsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <HallDetailsContent />
    </Suspense>
  );
}
