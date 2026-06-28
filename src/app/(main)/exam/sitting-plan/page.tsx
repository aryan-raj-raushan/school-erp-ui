"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, ChevronDown, ChevronUp, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { useSittingPlanGrid } from "@/hooks/exam/useExamSittingAndAdmit";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useAutoAssignPanel } from "@/hooks/exam/useAutoAssignPanel";
import type { Class } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Span,
  Select,
  Spinner,
  DataTable,
  Badge,
  Button,
  type ColumnDef,
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
  const {
    exams,
    rooms,
    examGroups,
    classNameById,
    selectedExamIds,
    selectedRoomIds,
    clearExisting,
    setClearExisting,
    studentCounts,
    totalSelectedStudents,
    totalSelectedCapacity,
    capacityShortfall,
    isAssigning,
    result,
    toggleExam,
    toggleGroup,
    toggleRoom,
    handleShuffle,
    handleReset,
  } = useAutoAssignPanel({ academicYearId, classes, onComplete });

  return (
    <Div variant="card" className="p-5">
      <Div type="col" gap="md">
        <Div>
          <P color="default" className="text-sm font-semibold">{SITTING_PLAN_PAGE.shuffle.panelTitle}</P>
          <P color="muted" className="text-xs mt-0.5">{SITTING_PLAN_PAGE.shuffle.panelSubtitle}</P>
        </Div>

        <Div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exam selection — grouped by name */}
          <Div>
            <P color="muted" className="text-xs font-semibold mb-2 uppercase tracking-wide">
              {SITTING_PLAN_PAGE.shuffle.selectExams}
            </P>
            <Div className="border border-border rounded-lg divide-y divide-border max-h-40 md:max-h-56 overflow-y-auto">
              {examGroups.length === 0 ? (
                <P color="muted" className="text-xs text-center py-4">No exams found</P>
              ) : (
                examGroups.map(([groupName, groupExams]) => {
                  const groupIds = groupExams.map((e) => e.id);
                  const allGroupSelected = groupIds.every((id) => selectedExamIds.includes(id));
                  const someGroupSelected = groupIds.some((id) => selectedExamIds.includes(id));
                  const groupTotal = groupExams.reduce((s, e) => s + (studentCounts[e.class_id] ?? 0), 0);
                  return (
                    <Div key={groupName}>
                      {/* Group header */}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => toggleGroup(groupIds)}
                        className="w-full h-auto px-3 py-2 justify-start gap-2 rounded-none bg-muted/20 hover:bg-muted/50 text-foreground font-normal"
                      >
                        {allGroupSelected ? (
                          <CheckSquare size={14} className="text-primary shrink-0" />
                        ) : someGroupSelected ? (
                          <CheckSquare size={14} className="text-primary/50 shrink-0" />
                        ) : (
                          <Square size={14} className="text-muted-foreground shrink-0" />
                        )}
                        <Span className="text-xs font-semibold">{groupName}</Span>
                        <Span color="muted" className="ml-auto text-[10px]">
                          {groupTotal > 0 ? `${groupTotal} students` : `${groupExams.length} class${groupExams.length > 1 ? "es" : ""}`}
                        </Span>
                      </Button>
                      {/* Per-class rows with student count */}
                      {groupExams.map((e) => {
                        const checked = selectedExamIds.includes(e.id);
                        const count = studentCounts[e.class_id];
                        return (
                          <Button
                            key={e.id}
                            type="button"
                            variant="ghost"
                            onClick={() => toggleExam(e.id)}
                            className="w-full h-auto pl-7 pr-3 py-1.5 justify-start gap-2 rounded-none hover:bg-muted/50 text-foreground font-normal"
                          >
                            {checked ? (
                              <CheckSquare size={12} className="text-primary shrink-0" />
                            ) : (
                              <Square size={12} className="text-muted-foreground shrink-0" />
                            )}
                            <Span className="text-xs">{classNameById[e.class_id] ?? e.class_id}</Span>
                            {count !== undefined && (
                              <Span color="muted" className="ml-auto text-[10px] shrink-0">
                                {count} student{count !== 1 ? "s" : ""}
                              </Span>
                            )}
                          </Button>
                        );
                      })}
                    </Div>
                  );
                })
              )}
            </Div>
          </Div>

          {/* Room selection */}
          <Div>
            <P color="muted" className="text-xs font-semibold mb-2 uppercase tracking-wide">
              {SITTING_PLAN_PAGE.shuffle.selectRooms}
            </P>
            <Div className="border border-border rounded-lg divide-y divide-border max-h-40 md:max-h-56 overflow-y-auto">
              {rooms.length === 0 ? (
                <P color="muted" className="text-xs text-center py-4">No rooms found</P>
              ) : (
                rooms.map((r) => {
                  const checked = selectedRoomIds.includes(r.id);
                  const order = selectedRoomIds.indexOf(r.id);
                  return (
                    <Button
                      key={r.id}
                      type="button"
                      variant="ghost"
                      onClick={() => toggleRoom(r.id)}
                      className="w-full h-auto px-3 py-2 justify-start gap-2 rounded-none hover:bg-muted/50 text-foreground font-normal"
                    >
                      {checked ? (
                        <Span className="w-4 h-4 rounded bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shrink-0">
                          {order + 1}
                        </Span>
                      ) : (
                        <Square size={14} className="text-muted-foreground shrink-0" />
                      )}
                      <Span className="text-xs">{r.room_name}</Span>
                      <Span color="muted" className="ml-auto text-[10px] shrink-0">cap: {r.sitting_capacity}</Span>
                    </Button>
                  );
                })
              )}
            </Div>
          </Div>
        </Div>

        {/* Capacity summary + warning */}
        {(totalSelectedStudents > 0 || totalSelectedCapacity > 0) && (
          <Div
            type="row"
            align="start"
            className={[
              "rounded-lg px-3 py-2 text-xs gap-2",
              capacityShortfall > 0
                ? "bg-amber-50 border border-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
                : "bg-muted/40 border border-border",
            ].join(" ")}
          >
            {capacityShortfall > 0 && (
              <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
            )}
            <Div type="row" wrap className="gap-x-4 gap-y-0.5">
              <Span className="text-xs">
                <Span className="text-xs font-medium">Students selected:</Span>{" "}
                <Span className={capacityShortfall > 0 ? "text-xs text-amber-700 dark:text-amber-400 font-semibold" : "text-xs"}>
                  {totalSelectedStudents}
                </Span>
              </Span>
              <Span className="text-xs">
                <Span className="text-xs font-medium">Room capacity:</Span>{" "}
                <Span className={capacityShortfall > 0 ? "text-xs text-amber-700 dark:text-amber-400 font-semibold" : "text-xs"}>
                  {totalSelectedCapacity}
                </Span>
              </Span>
              {capacityShortfall > 0 && (
                <Span className="text-xs text-amber-700 dark:text-amber-400 font-semibold w-full">
                  ⚠ Need {capacityShortfall} more seat{capacityShortfall !== 1 ? "s" : ""} — select additional room(s)
                </Span>
              )}
            </Div>
          </Div>
        )}

        {/* Clear existing toggle */}
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={clearExisting}
            onChange={(e) => setClearExisting(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <Span>{SITTING_PLAN_PAGE.shuffle.clearExisting}</Span>
        </label>

        {/* Result */}
        {result && (
          <Div className="rounded-lg border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3">
            <P color="default" className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              {SITTING_PLAN_PAGE.shuffle.resultTitle} — {result.total_assigned} {SITTING_PLAN_PAGE.shuffle.total}
            </P>
            <Div type="row" wrap gap="sm">
              {result.rooms.map((r) => (
                <Span
                  key={r.room_name}
                  className="text-[11px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full"
                >
                  {r.room_name}: {r.assigned_count}
                </Span>
              ))}
            </Div>
          </Div>
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

  function handleYearChange(val: string) {
    setSelectedAcademicYearId(val);
    setExamId("");
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
