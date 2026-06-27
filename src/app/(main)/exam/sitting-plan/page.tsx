"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSittingPlanGrid } from "@/hooks/exam/useExamSittingAndAdmit";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useFilterParams } from "@/hooks/useFilterParams";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  Select,
  Spinner,
  DataTable,
  Badge,
  type ColumnDef,
} from "@/components/ui";
import { SITTING_PLAN_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";
import type { ExamHallDetail } from "@/types/exam.types";

function SittingPlanContent() {
  const router = useRouter();

  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    academic_year_id: undefined,
    exam_id: undefined,
  });

  const { years, selectedAcademicYearId, setSelectedAcademicYearId } =
    useAcademicClassSection({ autoSelectCurrentYear: true });

  const academicYearId =
    urlFilters.academic_year_id || selectedAcademicYearId;
  const examId = urlFilters.exam_id || "";

  const { exams } = useExams(
    academicYearId ? { academic_year_id: academicYearId } : {}
  );
  const { rooms, occupancy, isLoading } = useSittingPlanGrid(
    examId,
    academicYearId
  );

  function handleYearChange(val: string) {
    setSelectedAcademicYearId(val);
    setUrlFilters({
      academic_year_id: val || undefined,
      exam_id: undefined,
    });
  }

  function handleExamChange(val: string) {
    setUrlFilters({
      exam_id: val || undefined,
    });
  }

  function openRoom(room: ExamHallDetail) {
    router.push(
      EXAM_ROUTES.sittingPlan.roomView(room.id, examId, academicYearId)
    );
  }

  const columns = useMemo<ColumnDef<ExamHallDetail>[]>(
    () => [
      {
        id: "sno",
        header: "S.No",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "room_name",
        header: "Room Name",
        meta: { primary: true },
      },
      {
        accessorKey: "sitting_capacity",
        header: "Capacity",
      },
      {
        id: "assigned",
        header: "Assigned",
        cell: ({ row }) => occupancy[row.original.id] ?? 0,
      },
      {
        id: "available",
        header: "Available",
        cell: ({ row }) => {
          const occ = occupancy[row.original.id] ?? 0;
          return row.original.sitting_capacity - occ;
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const occ = occupancy[row.original.id] ?? 0;
          const isFull = occ >= row.original.sitting_capacity;
          const status = isFull ? "Full" : occ === 0 ? "Empty" : "Partial";
          const variant = isFull ? "destructive" : occ === 0 ? "default" : "success";
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
    ],
    [occupancy]
  );

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={SITTING_PLAN_PAGE.pageHeading.title}
        subtitle={SITTING_PLAN_PAGE.pageHeading.subtitle}
      />

      {/* Filters */}
      <Div type="row" gap="md" wrap>
        <Select
          width="sm"
          value={academicYearId}
          onChange={(e) => handleYearChange(e.target.value)}
        >
          <option value="">Select year</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
              {y.is_current ? " (Current)" : ""}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={examId}
          disabled={!academicYearId}
          onChange={(e) => handleExamChange(e.target.value)}
        >
          <option value="">Select exam</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.exam_name}
            </option>
          ))}
        </Select>
      </Div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={rooms}
        isLoading={isLoading}
        emptyText={!examId ? "Select an exam to view rooms" : "No rooms found"}
        onRowClick={(row) => openRoom(row.original)}
      />
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
