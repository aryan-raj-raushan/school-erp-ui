"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useHallDetails } from "@/hooks/exam/useExamHall";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  Button,
  Badge,
  Spinner,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  TablePagination,
} from "@/components/ui";
import { HALL_DETAILS_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

function HallDetailsContent() {
  const router = useRouter();
  const { details, pagination, isLoading, remove } = useHallDetails();

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

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{HALL_DETAILS_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{HALL_DETAILS_PAGE.table.roomName}</TableHeaderCell>
            <TableHeaderCell>{HALL_DETAILS_PAGE.table.capacity}</TableHeaderCell>
            <TableHeaderCell>{HALL_DETAILS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{HALL_DETAILS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}>
              <Spinner />
            </TableEmptyRow>
          ) : details.length === 0 ? (
            <TableEmptyRow colSpan={5}>
              {HALL_DETAILS_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            details.map((d, i) => (
              <TableRow key={d.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{d.room_name}</TableCell>
                <TableCell>
                  {d.grid_rows && d.grid_cols
                    ? `${d.grid_rows} × ${d.grid_cols} = ${d.sitting_capacity}`
                    : d.sitting_capacity}{" "}
                  seats
                </TableCell>
                <TableCell>
                  <Badge variant={d.is_enabled ? "success" : "default"}>
                    {d.is_enabled ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="Edit"
                      onClick={() => router.push(EXAM_ROUTES.hallDetails.edit(d.id))}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      title="Delete"
                      onClick={() => remove(d.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}
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
