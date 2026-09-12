"use client";

import { Suspense, useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, CheckSquare, Square, AlertTriangle, Printer } from "lucide-react";
import { useSittingPlanGrid } from "@/hooks/exam/useExamSittingAndAdmit";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useAutoAssignPanel } from "@/hooks/exam/useAutoAssignPanel";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import { SittingPlanService } from "@/services/exam.service";
import type { Class } from "@/types";
import {
  Div,
  P,
  Span,
  Select,
  Spinner,
  DataTable,
  Badge,
  Button,
  FormField,
  type ColumnDef,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  FilterToolbar,
  type FilterField,
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
    selectedExamId,
    setSelectedExamId,
    selectedExam,
    classNameById,
    selectedClassIds,
    toggleClass,
    selectedRoomIds,
    clearExisting,
    setClearExisting,
    studentCounts,
    totalSelectedStudents,
    totalSelectedCapacity,
    capacityShortfall,
    isAssigning,
    result,
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

        <FormField label={SITTING_PLAN_PAGE.shuffle.selectExams}>
          <Select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
            <option value="">Select exam</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.exam_name} ({e.exam_term})</option>
            ))}
          </Select>
        </FormField>

        <Div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Class selection — classes participating in the selected exam */}
          <Div>
            <P color="muted" className="text-xs font-semibold mb-2 uppercase tracking-wide">
              Classes in this exam
            </P>
            <Div className="border border-border rounded-lg divide-y divide-border max-h-40 md:max-h-56 overflow-y-auto">
              {!selectedExam ? (
                <P color="muted" className="text-xs text-center py-4">Select an exam first</P>
              ) : selectedExam.class_ids.length === 0 ? (
                <P color="muted" className="text-xs text-center py-4">This exam has no classes</P>
              ) : (
                selectedExam.class_ids.map((classId) => {
                  const checked = selectedClassIds.includes(classId);
                  const count = studentCounts[classId];
                  return (
                    <Button
                      key={classId}
                      type="button"
                      variant="ghost"
                      onClick={() => toggleClass(classId)}
                      className="w-full h-auto px-3 py-2 justify-start gap-2 rounded-none hover:bg-muted/50 text-foreground font-normal"
                    >
                      {checked ? (
                        <CheckSquare size={14} className="text-primary shrink-0" />
                      ) : (
                        <Square size={14} className="text-muted-foreground shrink-0" />
                      )}
                      <Span className="text-xs">{classNameById[classId] ?? classId}</Span>
                      {count !== undefined && (
                        <Span color="muted" className="ml-auto text-[10px] shrink-0">
                          {count} student{count !== 1 ? "s" : ""}
                        </Span>
                      )}
                    </Button>
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
            {result.shortfall_warning && (
              <P className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-2">
                ⚠ {result.shortfall_warning}
              </P>
            )}
          </Div>
        )}

        <Div type="row" gap="sm">
          <Button
            type="button"
            size="sm"
            loading={isAssigning}
            disabled={!selectedExamId || selectedClassIds.length === 0 || selectedRoomIds.length === 0 || capacityShortfall > 0}
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

type PersistedSittingFilters = {
  academic_year_id?: string;
  exam_id?: string;
};

function SittingPlanContent() {
  const router = useRouter();
  const [showAutoAssign, setShowAutoAssign] = useState(false);

  const { years, classes, selectedAcademicYearId, setSelectedAcademicYearId } =
    useAcademicClassSection({ autoSelectCurrentYear: true });

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedSittingFilters>({
    key: STORAGE_FILTER_KEYS.EXAMS + ":sitting-plan",
    defaultValue: {},
  });

  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters && storedFilters.academic_year_id) {
      setSelectedAcademicYearId(storedFilters.academic_year_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const [examId, setExamId] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const raw = window.localStorage.getItem(STORAGE_FILTER_KEYS.EXAMS + ":sitting-plan");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.exam_id ?? "";
      }
    } catch {}
    return "";
  });

  const academicYearId = selectedAcademicYearId;
  const { exams } = useExams(academicYearId ? { academic_year_id: academicYearId } : {});

  const { rooms, occupancy, isLoading, refetch } = useSittingPlanGrid(
    examId ? [examId] : [],
    academicYearId,
  );

  const handleShuffleComplete = useCallback(() => {
    refetch?.();
  }, [refetch]);

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ("academic_year_id" in next) {
      const val = next.academic_year_id;
      setSelectedAcademicYearId(val ?? "");
      setExamId("");
    }

    if ("exam_id" in next) {
      setExamId(next.exam_id ?? "");
    }

    const persisted: Partial<PersistedSittingFilters> = {};
    (["academic_year_id", "exam_id"] as const).forEach((field) => {
      if (field in next) persisted[field] = next[field] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    setSelectedAcademicYearId("");
    setExamId("");
    clearStoredFilters();
  }

  useEffect(() => {
    if (!isStorageHydrated) return;
    if (storedFilters.academic_year_id) {
      setSelectedAcademicYearId(storedFilters.academic_year_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  function openRoom(room: ExamHallDetail) {
    router.push(
      EXAM_ROUTES.sittingPlan.roomView(room.id, examId, academicYearId)
    );
  }

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: SITTING_PLAN_PAGE.filters.allYears,
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
        resetKeys: ["exam_id"],
      },
      {
        type: "select",
        key: "exam_id",
        label: "Exam",
        placeholder: SITTING_PLAN_PAGE.filters.allExams,
        options: exams.map((e) => ({
          value: e.id,
          label: `${e.exam_name} (${e.exam_term})`,
        })),
        disabled: !academicYearId,
      },
    ],
    [years, exams, academicYearId],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: academicYearId || undefined,
    exam_id: examId || undefined,
  };

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

  const pageHeaderConfig: PageHeaderConfig = {
    backButton: true,
    title: SITTING_PLAN_PAGE.pageHeading.title,
    subtitle: SITTING_PLAN_PAGE.pageHeading.subtitle,
    actions: [
      {
        label: "Manage Rooms",
        variant: "outline",
        onClick: () => router.push("/exam/hall-details"),
      },
      {
        label: SITTING_PLAN_PAGE.buttons.autoAssign,
        icon: <Shuffle size={14} />,
        variant: showAutoAssign ? "default" : "outline",
        onClick: () => setShowAutoAssign((p) => !p),
      },
      {
        label: "Print Master Sheet",
        icon: <Printer size={14} />,
        hidden: !examId,
        onClick: () =>
          SittingPlanService.downloadMasterPdf({
            exam_id: examId,
            exam_name: exams.find((e) => e.id === examId)?.exam_name,
          }),
      },
    ],
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      {showAutoAssign && (
        <AutoAssignPanel
          academicYearId={academicYearId}
          classes={classes}
          onComplete={handleShuffleComplete}
        />
      )}

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        sheetTitle="Filter Sitting Plan"
      />

      <DataTable
        columns={columns}
        data={rooms}
        isLoading={isLoading}
        emptyText={!examId ? "Select an exam to view rooms" : "No rooms found"}
        onRowClick={(row) => openRoom(row.original)}
        fillViewport
      />
    </PageCol>
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
