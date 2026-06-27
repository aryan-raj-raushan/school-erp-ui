"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useSittingPlanGrid } from "@/hooks/exam/useExamSittingAndAdmit";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
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
} from "@/components/ui";
import { SITTING_PLAN_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";
import type { ExamHallDetail } from "@/types/exam.types";

function SittingPlanContent() {
  const router = useRouter();
  const [examId, setExamId] = useState("");

  const { years, selectedAcademicYearId, setSelectedAcademicYearId } =
    useAcademicClassSection({ autoSelectCurrentYear: true });

  const academicYearId = selectedAcademicYearId;
  const { exams } = useExams(academicYearId ? { academic_year_id: academicYearId } : {});
  const { rooms, occupancy, isLoading } = useSittingPlanGrid(examId, academicYearId);

  function openRoom(room: ExamHallDetail) {
    router.push(EXAM_ROUTES.sittingPlan.roomView(room.id, examId, academicYearId));
  }

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
          onChange={(e) => { setSelectedAcademicYearId(e.target.value); setExamId(""); }}
        >
          <option value="">Select year</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}{y.is_current ? " (Current)" : ""}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={examId}
          disabled={!academicYearId}
          onChange={(e) => setExamId(e.target.value)}
        >
          <option value="">Select exam</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>{e.exam_name}</option>
          ))}
        </Select>
      </Div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>S.No</TableHeaderCell>
            <TableHeaderCell>Room Name</TableHeaderCell>
            <TableHeaderCell>Capacity</TableHeaderCell>
            <TableHeaderCell>Assigned</TableHeaderCell>
            <TableHeaderCell>Available</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : !examId ? (
            <TableEmptyRow colSpan={6}>Select an exam to view rooms</TableEmptyRow>
          ) : rooms.length === 0 ? (
            <TableEmptyRow colSpan={6}>No rooms found</TableEmptyRow>
          ) : (
            rooms.map((room, i) => {
              const occ = occupancy[room.id] ?? 0;
              const avail = room.sitting_capacity - occ;
              const isFull = occ >= room.sitting_capacity;
              return (
                <TableRow
                  key={room.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openRoom(room)}
                >
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{room.room_name}</TableCell>
                  <TableCell>{room.sitting_capacity}</TableCell>
                  <TableCell>{occ}</TableCell>
                  <TableCell>{avail}</TableCell>
                  <TableCell>
                    <span className={[
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      isFull
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : occ === 0
                        ? "bg-muted text-muted-foreground"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                    ].join(" ")}>
                      {isFull ? "Full" : occ === 0 ? "Empty" : "Partial"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Div>
  );
}

export default function SittingPlanPage() {
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <SittingPlanContent />
    </Suspense>
  );
}
