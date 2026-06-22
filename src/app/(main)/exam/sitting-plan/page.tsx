"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useSittingPlan } from "@/hooks/exam/useExamSittingAndAdmit";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useHallPlans, useHallDetails } from "@/hooks/exam/useExamHall";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Button,
  Select,
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
import { SITTING_PLAN_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

function SittingPlanContent() {
  const router = useRouter();
  const { entries, pagination, filters, isLoading, updateFilters, remove } =
    useSittingPlan();

  const {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
  } = useAcademicClassSection({ autoSelectCurrentYear: false });

  const { exams } = useExams(
    selectedAcademicYearId
      ? { academic_year_id: selectedAcademicYearId }
      : {}
  );
  const { plans } = useHallPlans();
  const { details: rooms } = useHallDetails(filters.hall_plan_id);

  // Build lookup maps for display
  const planMap = Object.fromEntries(plans.map((p) => [p.id, p.plan_name]));
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r.room_name]));
  const examMap = Object.fromEntries(exams.map((e) => [e.id, e.exam_name]));

  function handleYearChange(val: string) {
    setSelectedAcademicYearId(val);
    updateFilters({
      academic_year_id: val || undefined,
      exam_id: undefined,
      hall_plan_id: undefined,
    });
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={SITTING_PLAN_PAGE.pageHeading.title}
        subtitle={SITTING_PLAN_PAGE.pageHeading.subtitle}
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.sittingPlan.create)}>
            <Plus size={16} /> {SITTING_PLAN_PAGE.buttons.assign}
          </Button>
        }
      />

      {/* Filters */}
      <Div type="row" gap="md" align="center" wrap>
        <Select
          width="sm"
          value={selectedAcademicYearId}
          onChange={(e) => handleYearChange(e.target.value)}
        >
          <option value="">{SITTING_PLAN_PAGE.filters.allYears}</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
              {y.is_current ? " (Current)" : ""}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.exam_id ?? ""}
          disabled={!selectedAcademicYearId}
          onChange={(e) =>
            updateFilters({ exam_id: e.target.value || undefined })
          }
        >
          <option value="">{SITTING_PLAN_PAGE.filters.allExams}</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.exam_name}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.hall_plan_id ?? ""}
          onChange={(e) =>
            updateFilters({ hall_plan_id: e.target.value || undefined })
          }
        >
          <option value="">{SITTING_PLAN_PAGE.filters.allPlans}</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.plan_name}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.hall_detail_id ?? ""}
          disabled={!filters.hall_plan_id}
          onChange={(e) =>
            updateFilters({ hall_detail_id: e.target.value || undefined })
          }
        >
          <option value="">{SITTING_PLAN_PAGE.filters.allRooms}</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.room_name}
            </option>
          ))}
        </Select>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{SITTING_PLAN_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{SITTING_PLAN_PAGE.table.student}</TableHeaderCell>
            <TableHeaderCell>{SITTING_PLAN_PAGE.table.rollNo}</TableHeaderCell>
            <TableHeaderCell>{SITTING_PLAN_PAGE.table.room}</TableHeaderCell>
            <TableHeaderCell>{SITTING_PLAN_PAGE.table.seatNo}</TableHeaderCell>
            <TableHeaderCell>{SITTING_PLAN_PAGE.table.hallPlan}</TableHeaderCell>
            <TableHeaderCell>{SITTING_PLAN_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={7}>
              <Spinner />
            </TableEmptyRow>
          ) : entries.length === 0 ? (
            <TableEmptyRow colSpan={7}>
              {SITTING_PLAN_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            entries.map((entry, i) => (
              <TableRow key={entry.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{entry.student_id}</TableCell>
                <TableCell>
                  <P color="muted" className="font-mono text-xs">
                    {entry.roll_number ?? "—"}
                  </P>
                </TableCell>
                <TableCell>
                  {roomMap[entry.hall_detail_id] ?? entry.hall_detail_id}
                </TableCell>
                <TableCell>{entry.seat_number ?? "—"}</TableCell>
                <TableCell>
                  {planMap[entry.hall_plan_id] ?? entry.hall_plan_id}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    title="Remove"
                    onClick={() => remove(entry.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
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

export default function SittingPlanPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <SittingPlanContent />
    </Suspense>
  );
}