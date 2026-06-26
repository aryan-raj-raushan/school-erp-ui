"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useSittingPlanForm } from "@/hooks/exam/useExamSittingAndAdmit";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useHallPlans, useHallDetails } from "@/hooks/exam/useExamHall";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  H3,
  P,
  Button,
  Select,
  Input,
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
import type { SittingRow } from "@/hooks/exam/useExamSittingAndAdmit";

// ── Add Student Row Form ──────────────────────────────────────────────────────

function AddStudentRow({
  rooms,
  onAdd,
}: {
  rooms: { id: string; room_name: string; sitting_capacity: number }[];
  onAdd: (row: SittingRow) => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [hallDetailId, setHallDetailId] = useState("");
  const [seatNumber, setSeatNumber] = useState("");

  function handleAdd() {
    if (!studentId || !hallDetailId) return;
    onAdd({
      student_id: studentId,
      student_name: studentName || studentId,
      hall_detail_id: hallDetailId,
      roll_number: rollNumber || undefined,
      seat_number: seatNumber ? Number(seatNumber) : undefined,
    });
    setStudentId("");
    setStudentName("");
    setRollNumber("");
    setSeatNumber("");
  }

  return (
    <Div variant="glass-sm" className="p-4">
      <H3 color="default" className="mb-3 text-sm">
        Add Student
      </H3>
      <Div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Div type="col" gap="xs">
          <P color="muted" className="text-xs">
            Student ID *
          </P>
          <Input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Student UUID"
          />
        </Div>
        <Div type="col" gap="xs">
          <P color="muted" className="text-xs">
            Student Name
          </P>
          <Input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Display name"
          />
        </Div>
        <Div type="col" gap="xs">
          <P color="muted" className="text-xs">
            Roll No.
          </P>
          <Input
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="e.g. A-12"
          />
        </Div>
        <Div type="col" gap="xs">
          <P color="muted" className="text-xs">
            {SITTING_PLAN_PAGE.labels.room} *
          </P>
          <Select
            value={hallDetailId}
            onChange={(e) => setHallDetailId(e.target.value)}
          >
            <option value="">Select room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_name} ({r.sitting_capacity} seats)
              </option>
            ))}
          </Select>
        </Div>
        <Div type="col" gap="xs">
          <P color="muted" className="text-xs">
            {SITTING_PLAN_PAGE.labels.seatNumber}
          </P>
          <Div type="row" gap="sm">
            <Input
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              type="number"
              min={1}
              placeholder="e.g. 5"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!studentId || !hallDetailId}
            >
              <Plus size={14} />
            </Button>
          </Div>
        </Div>
      </Div>
    </Div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SittingPlanFormContent({ slug }: { slug: string }) {
  const router = useRouter();
  const {
    examId,
    setExamId,
    academicYearId,
    setAcademicYearId,
    hallPlanId,
    setHallPlanId,
    rows,
    addRow,
    removeRow,
    isSaving,
    save,
  } = useSittingPlanForm();

  const {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  const { exams } = useExams(
    selectedAcademicYearId ? { academic_year_id: selectedAcademicYearId } : {}
  );
  const { plans } = useHallPlans();
  const { details: rooms } = useHallDetails(hallPlanId || undefined);

  useEffect(() => {
    if (selectedAcademicYearId) setAcademicYearId(selectedAcademicYearId);
  }, [selectedAcademicYearId, setAcademicYearId]);

  // Room capacity map for display
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r.room_name]));

  return (
    <Div type="col" gap="lg" className="max-w-5xl">
      <PageHeader
        title="Assign Sitting Plan"
        subtitle="Assign students to exam rooms — capacity is validated automatically"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(EXAM_ROUTES.sittingPlan.list)}
          >
            <ArrowLeft size={14} /> {SITTING_PLAN_PAGE.buttons.cancel}
          </Button>
        }
      />

      {/* Header Selectors */}
      <Div variant="card" className="p-5">
        <Div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Div type="col" gap="xs">
            <P color="muted" className="text-xs font-medium">
              {SITTING_PLAN_PAGE.labels.academicYear} *
            </P>
            <Select
              value={selectedAcademicYearId}
              onChange={(e) => {
                setSelectedAcademicYearId(e.target.value);
                setExamId("");
              }}
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                  {y.is_current ? " (Current)" : ""}
                </option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <P color="muted" className="text-xs font-medium">
              {SITTING_PLAN_PAGE.labels.exam} *
            </P>
            <Select
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              disabled={!selectedAcademicYearId}
            >
              <option value="">Select exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.exam_name}
                </option>
              ))}
            </Select>
          </Div>

          <Div type="col" gap="xs">
            <P color="muted" className="text-xs font-medium">
              {SITTING_PLAN_PAGE.labels.hallPlan} *
            </P>
            <Select
              value={hallPlanId}
              onChange={(e) => setHallPlanId(e.target.value)}
            >
              <option value="">Select hall plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plan_name}
                </option>
              ))}
            </Select>
          </Div>
        </Div>
      </Div>

      {/* Add row form */}
      {hallPlanId && rooms.length > 0 && (
        <AddStudentRow rooms={rooms} onAdd={addRow} />
      )}

      {/* Assigned students table */}
      {rows.length > 0 && (
        <>
          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>#</TableHeaderCell>
                <TableHeaderCell>{SITTING_PLAN_PAGE.table.student}</TableHeaderCell>
                <TableHeaderCell>{SITTING_PLAN_PAGE.table.rollNo}</TableHeaderCell>
                <TableHeaderCell>{SITTING_PLAN_PAGE.table.room}</TableHeaderCell>
                <TableHeaderCell>{SITTING_PLAN_PAGE.table.seatNo}</TableHeaderCell>
                <TableHeaderCell>{SITTING_PLAN_PAGE.table.actions}</TableHeaderCell>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.student_id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{row.student_name}</TableCell>
                  <TableCell>
                    <P color="muted" className="font-mono text-xs">
                      {row.roll_number ?? "—"}
                    </P>
                  </TableCell>
                  <TableCell>
                    {roomMap[row.hall_detail_id] ?? row.hall_detail_id}
                  </TableCell>
                  <TableCell>{row.seat_number ?? "—"}</TableCell>
                  <TableCell>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      type="button"
                      onClick={() => removeRow(row.student_id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Div type="row" gap="md">
            <Button
              variant="outline"
              onClick={() => router.push(EXAM_ROUTES.sittingPlan.list)}
            >
              {SITTING_PLAN_PAGE.buttons.cancel}
            </Button>
            <Button loading={isSaving} onClick={save}>
              <Save size={14} /> {SITTING_PLAN_PAGE.buttons.save}
            </Button>
          </Div>
        </>
      )}

      {rows.length === 0 && hallPlanId && (
        <Div variant="card-dashed">
          <P color="muted">
            Select a hall plan and use the form above to add students
          </P>
        </Div>
      )}
    </Div>
  );
}
