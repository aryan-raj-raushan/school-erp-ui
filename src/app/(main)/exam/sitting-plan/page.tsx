"use client";

import { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, ChevronDown, ChevronUp, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { useSittingPlanGrid, useAutoShufflePlan } from "@/hooks/exam/useExamSittingAndAdmit";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useHallDetails } from "@/hooks/exam/useExamHall";
import { StudentsService } from "@/services/students.service";
import type { Class } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  Select,
  Spinner,
  Button,
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

// ── Auto-Assign Panel ─────────────────────────────────────────────────────────

function AutoAssignPanel({
  academicYearId,
  classes,
  onComplete,
}: {
  academicYearId: string;
  classes: Class[];
  onComplete: () => void;
}) {
  const { exams } = useExams(academicYearId ? { academic_year_id: academicYearId } : {});
  const { details: rooms } = useHallDetails();
  const { isAssigning, result, shuffle, reset } = useAutoShufflePlan();

  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [clearExisting, setClearExisting] = useState(true);
  // class_id → student count
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});

  const classNameById = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  // Group exams by name
  const examGroups = useMemo(() => {
    const groups: Record<string, typeof exams> = {};
    exams.forEach((e) => {
      if (!groups[e.exam_name]) groups[e.exam_name] = [];
      groups[e.exam_name].push(e);
    });
    return Object.entries(groups);
  }, [exams]);

  // Fetch student counts per class (separate call per class to bypass backend page-size cap)
  useEffect(() => {
    if (!academicYearId || exams.length === 0) return;
    const uniqueClassIds = [...new Set(exams.map((e) => e.class_id))];
    Promise.all(
      uniqueClassIds.map((cid) =>
        StudentsService.list({ class_id: cid, academic_year_id: academicYearId, limit: 100 })
          .then((r) => [cid, r.pagination?.total ?? r.items.length] as [string, number]),
      ),
    )
      .then((entries) => setStudentCounts(Object.fromEntries(entries)))
      .catch(() => {});
  }, [academicYearId, exams]);

  // Validation: total selected students vs total selected room capacity
  const totalSelectedStudents = useMemo(() => {
    return selectedExamIds.reduce((sum, eid) => {
      const exam = exams.find((e) => e.id === eid);
      return sum + (exam ? (studentCounts[exam.class_id] ?? 0) : 0);
    }, 0);
  }, [selectedExamIds, exams, studentCounts]);

  const totalSelectedCapacity = useMemo(() => {
    return selectedRoomIds.reduce((sum, rid) => {
      const room = rooms.find((r) => r.id === rid);
      return sum + (room?.sitting_capacity ?? 0);
    }, 0);
  }, [selectedRoomIds, rooms]);

  const capacityShortfall = totalSelectedStudents > 0 && totalSelectedCapacity < totalSelectedStudents
    ? totalSelectedStudents - totalSelectedCapacity
    : 0;

  function toggleExam(id: string) {
    setSelectedExamIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleGroup(ids: string[]) {
    const allSelected = ids.every((id) => selectedExamIds.includes(id));
    if (allSelected) {
      setSelectedExamIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedExamIds((prev) => [...new Set([...prev, ...ids])]);
    }
  }

  function toggleRoom(id: string) {
    setSelectedRoomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleShuffle() {
    await shuffle(selectedExamIds, academicYearId, selectedRoomIds, clearExisting);
    onComplete();
  }

  function handleReset() {
    reset();
    setSelectedExamIds([]);
    setSelectedRoomIds([]);
  }

  return (
    <Div variant="card" className="p-5">
      <Div type="col" gap="md">
        <div>
          <p className="text-sm font-semibold">{SITTING_PLAN_PAGE.shuffle.panelTitle}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{SITTING_PLAN_PAGE.shuffle.panelSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exam selection — grouped by name */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {SITTING_PLAN_PAGE.shuffle.selectExams}
            </p>
            <div className="border border-border rounded-lg divide-y divide-border max-h-56 overflow-y-auto">
              {examGroups.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No exams found</p>
              ) : (
                examGroups.map(([groupName, groupExams]) => {
                  const groupIds = groupExams.map((e) => e.id);
                  const allGroupSelected = groupIds.every((id) => selectedExamIds.includes(id));
                  const someGroupSelected = groupIds.some((id) => selectedExamIds.includes(id));
                  const groupTotal = groupExams.reduce((s, e) => s + (studentCounts[e.class_id] ?? 0), 0);
                  return (
                    <div key={groupName}>
                      {/* Group header */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupIds)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors bg-muted/20"
                      >
                        {allGroupSelected ? (
                          <CheckSquare size={14} className="text-primary shrink-0" />
                        ) : someGroupSelected ? (
                          <CheckSquare size={14} className="text-primary/50 shrink-0" />
                        ) : (
                          <Square size={14} className="text-muted-foreground shrink-0" />
                        )}
                        <span className="text-xs font-semibold">{groupName}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {groupTotal > 0 ? `${groupTotal} students` : `${groupExams.length} class${groupExams.length > 1 ? "es" : ""}`}
                        </span>
                      </button>
                      {/* Per-class rows with student count */}
                      {groupExams.map((e) => {
                        const checked = selectedExamIds.includes(e.id);
                        const count = studentCounts[e.class_id];
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => toggleExam(e.id)}
                            className="w-full flex items-center gap-2 pl-7 pr-3 py-1.5 text-left hover:bg-muted/50 transition-colors"
                          >
                            {checked ? (
                              <CheckSquare size={12} className="text-primary shrink-0" />
                            ) : (
                              <Square size={12} className="text-muted-foreground shrink-0" />
                            )}
                            <span className="text-xs">{classNameById[e.class_id] ?? e.class_id}</span>
                            {count !== undefined && (
                              <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                                {count} student{count !== 1 ? "s" : ""}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Room selection */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {SITTING_PLAN_PAGE.shuffle.selectRooms}
            </p>
            <div className="border border-border rounded-lg divide-y divide-border max-h-56 overflow-y-auto">
              {rooms.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No rooms found</p>
              ) : (
                rooms.map((r) => {
                  const checked = selectedRoomIds.includes(r.id);
                  const order = selectedRoomIds.indexOf(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRoom(r.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      {checked ? (
                        <span className="w-4 h-4 rounded bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shrink-0">
                          {order + 1}
                        </span>
                      ) : (
                        <Square size={14} className="text-muted-foreground shrink-0" />
                      )}
                      <span className="text-xs">{r.room_name}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground shrink-0">cap: {r.sitting_capacity}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Capacity summary + warning */}
        {(totalSelectedStudents > 0 || totalSelectedCapacity > 0) && (
          <div className={[
            "rounded-lg px-3 py-2 text-xs flex items-start gap-2",
            capacityShortfall > 0
              ? "bg-amber-50 border border-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
              : "bg-muted/40 border border-border",
          ].join(" ")}>
            {capacityShortfall > 0 && (
              <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              <span>
                <span className="font-medium">Students selected:</span>{" "}
                <span className={capacityShortfall > 0 ? "text-amber-700 dark:text-amber-400 font-semibold" : ""}>
                  {totalSelectedStudents}
                </span>
              </span>
              <span>
                <span className="font-medium">Room capacity:</span>{" "}
                <span className={capacityShortfall > 0 ? "text-amber-700 dark:text-amber-400 font-semibold" : ""}>
                  {totalSelectedCapacity}
                </span>
              </span>
              {capacityShortfall > 0 && (
                <span className="text-amber-700 dark:text-amber-400 font-semibold w-full">
                  ⚠ Need {capacityShortfall} more seat{capacityShortfall !== 1 ? "s" : ""} — select additional room(s)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Clear existing toggle */}
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={clearExisting}
            onChange={(e) => setClearExisting(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-foreground">{SITTING_PLAN_PAGE.shuffle.clearExisting}</span>
        </label>

        {/* Result */}
        {result && (
          <div className="rounded-lg border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              {SITTING_PLAN_PAGE.shuffle.resultTitle} — {result.total_assigned} {SITTING_PLAN_PAGE.shuffle.total}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.rooms.map((r) => (
                <span
                  key={r.room_name}
                  className="text-[11px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full"
                >
                  {r.room_name}: {r.assigned_count}
                </span>
              ))}
            </div>
          </div>
        )}

        <Div type="row" gap="sm">
          <Button
            type="button"
            size="sm"
            loading={isAssigning}
            disabled={selectedExamIds.length === 0 || selectedRoomIds.length === 0 || capacityShortfall > 0}
            onClick={handleShuffle}
          >
            <Shuffle size={13} />
            {SITTING_PLAN_PAGE.shuffle.assign}
          </Button>
          {result && (
            <Button type="button" size="sm" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </Div>
      </Div>
    </Div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function SittingPlanContent() {
  const router = useRouter();
  const [examId, setExamId] = useState("");
  const [showAutoAssign, setShowAutoAssign] = useState(false);

  const { years, classes, selectedAcademicYearId, setSelectedAcademicYearId } =
    useAcademicClassSection({ autoSelectCurrentYear: true });

  const academicYearId = selectedAcademicYearId;
  const { exams } = useExams(academicYearId ? { academic_year_id: academicYearId } : {});

  const classNameById = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  // Find the selected exam and all its siblings (same name+term = same test across classes)
  const selectedExam = useMemo(() => exams.find((e) => e.id === examId), [exams, examId]);
  const siblingExamIds = useMemo(() => {
    if (!selectedExam) return [];
    return exams
      .filter((e) => e.exam_name === selectedExam.exam_name && e.exam_term === selectedExam.exam_term)
      .map((e) => e.id);
  }, [exams, selectedExam]);

  const { rooms, occupancy, isLoading, refetch } = useSittingPlanGrid(siblingExamIds, academicYearId);

  // Group exams by name for the filter dropdown
  const examGroups = useMemo(() => {
    const groups: Record<string, typeof exams> = {};
    exams.forEach((e) => {
      if (!groups[e.exam_name]) groups[e.exam_name] = [];
      groups[e.exam_name].push(e);
    });
    return Object.entries(groups);
  }, [exams]);

  const handleShuffleComplete = useCallback(() => {
    refetch?.();
  }, [refetch]);

  function openRoom(room: ExamHallDetail) {
    router.push(EXAM_ROUTES.sittingPlan.roomView(room.id, examId, academicYearId));
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={SITTING_PLAN_PAGE.pageHeading.title}
        subtitle={SITTING_PLAN_PAGE.pageHeading.subtitle}
        actions={
          <Button
            size="sm"
            variant={showAutoAssign ? "default" : "outline"}
            onClick={() => setShowAutoAssign((p) => !p)}
          >
            <Shuffle size={13} />
            {SITTING_PLAN_PAGE.buttons.autoAssign}
            {showAutoAssign ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </Button>
        }
      />

      {/* Auto-assign collapsible panel */}
      {showAutoAssign && (
        <AutoAssignPanel
          academicYearId={academicYearId}
          classes={classes}
          onComplete={handleShuffleComplete}
        />
      )}

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
          {examGroups.map(([groupName, groupExams]) => (
            <option key={groupName} value={groupExams[0].id}>
              {groupName}
            </option>
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
