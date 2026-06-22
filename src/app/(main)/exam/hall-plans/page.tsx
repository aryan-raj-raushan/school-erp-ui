"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useHallPlans } from "@/hooks/exam/useExamHall";
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
import { HALL_PLANS_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

function HallPlansContent() {
  const router = useRouter();
  const { plans, pagination, isLoading, remove } = useHallPlans();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={HALL_PLANS_PAGE.pageHeading.title}
        subtitle={HALL_PLANS_PAGE.pageHeading.subtitle}
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.hallPlans.create)}>
            <Plus size={16} /> {HALL_PLANS_PAGE.buttons.add}
          </Button>
        }
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{HALL_PLANS_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{HALL_PLANS_PAGE.table.planName}</TableHeaderCell>
            <TableHeaderCell>{HALL_PLANS_PAGE.table.description}</TableHeaderCell>
            <TableHeaderCell>{HALL_PLANS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{HALL_PLANS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}>
              <Spinner />
            </TableEmptyRow>
          ) : plans.length === 0 ? (
            <TableEmptyRow colSpan={5}>
              {HALL_PLANS_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            plans.map((plan, i) => (
              <TableRow key={plan.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{plan.plan_name}</TableCell>
                <TableCell>{plan.description ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={plan.is_enabled ? "success" : "default"}>
                    {plan.is_enabled ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title={HALL_PLANS_PAGE.buttons.viewRooms}
                      onClick={() =>
                        router.push(
                          `${EXAM_ROUTES.hallDetails.list}?hall_plan_id=${plan.id}`
                        )
                      }
                    >
                      <Building2 size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="Edit"
                      onClick={() =>
                        router.push(EXAM_ROUTES.hallPlans.edit(plan.id))
                      }
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      title="Delete"
                      onClick={() => remove(plan.id)}
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

export default function HallPlansPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <HallPlansContent />
    </Suspense>
  );
}