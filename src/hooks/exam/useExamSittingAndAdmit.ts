"use client";

import { useState, useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import {
  SittingPlanService,
  AdmitCardService,
  HallDetailService,
  ExamsService,
} from "@/services/exam.service";
import { StudentsService } from "@/services/students.service";
import type {
  ExamSittingPlan,
  SittingFilters,
  SittingPlanEntry,
  AdmitCardData,
  ExamHallDetail,
  Exam,
} from "@/types/exam.types";
import type { PaginationMeta } from "@/types";
import { SITTING_PLAN_PAGE, ADMIT_CARD_PAGE } from "@/constants/exam.constants";

// ── Sitting Plan List (legacy, used by other hooks) ───────────────────────────

export function useSittingPlan(initialFilters: SittingFilters = {}) {
  const [entries, setEntries] = useState<ExamSittingPlan[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<SittingFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SittingPlanService.list(filters);
      setEntries(result.items);
      setPagination(result.pagination);
    } catch {
      toast.error(SITTING_PLAN_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  function updateFilters(next: Partial<SittingFilters>) {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }

  async function remove(id: string) {
    try {
      await SittingPlanService.remove(id);
      toast.success(SITTING_PLAN_PAGE.toasts.deleteSuccess);
      await fetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  }

  return { entries, pagination, filters, isLoading, updateFilters, remove, refetch: fetch };
}

// ── Grid view: rooms with occupancy for a given exam ─────────────────────────

// Accepts an array of sibling exam IDs so occupancy reflects all classes
export function useSittingPlanGrid(examIds: string[], academicYearId: string) {
  const [rooms, setRooms] = useState<ExamHallDetail[]>([]);
  const [occupancy, setOccupancy] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Stringify to avoid array-reference churn in dep array
  const examIdsKey = examIds.join(",");

  const load = useCallback(async () => {
    const ids = examIdsKey.split(",").filter(Boolean);
    if (ids.length === 0 || !academicYearId) {
      setRooms([]);
      setOccupancy({});
      return;
    }
    setIsLoading(true);
    try {
      const [roomsRes, ...planResults] = await Promise.all([
        HallDetailService.list({ limit: 200 }),
        ...ids.map((eid) =>
          SittingPlanService.list({ exam_id: eid, academic_year_id: academicYearId, limit: 1000 }),
        ),
      ]);
      setRooms(roomsRes.items);
      const occ: Record<string, number> = {};
      planResults.forEach((res) => {
        res.items.forEach((p) => {
          occ[p.hall_detail_id] = (occ[p.hall_detail_id] ?? 0) + 1;
        });
      });
      setOccupancy(occ);
    } catch {
      toast.error("Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  }, [examIdsKey, academicYearId]);

  useEffect(() => { load(); }, [load]);

  return { rooms, occupancy, isLoading, refetch: load };
}

// ── Room Sitting Plan: numbered seats + drag-drop ─────────────────────────────

export interface StudentSlot {
  student_id: string;
  name: string;
  roll_number?: string;
  admission_number: string;
  sitting_plan_id?: string; // set if already in DB
  original_seat_index?: number; // original DB seat position (0-based)
  class_label?: string; // e.g. "Cl.1" — displayed as badge in room view
  exam_id?: string; // which exam record owns this student (needed for multi-class save)
}

type SeatState = {
  /** Array length = room capacity; null = empty seat */
  seated: (StudentSlot | null)[];
  unassigned: StudentSlot[];
};

type SeatAction =
  | { type: "INIT"; seated: (StudentSlot | null)[]; unassigned: StudentSlot[] }
  | { type: "POOL_TO_SEAT"; studentId: string; seatIndex: number }
  | { type: "SEAT_TO_POOL"; seatIndex: number }
  | { type: "SEAT_TO_SEAT"; fromIndex: number; toIndex: number }
  | { type: "MARK_SAVED" };

function seatReducer(state: SeatState, action: SeatAction): SeatState {
  switch (action.type) {
    case "INIT":
      return { seated: action.seated, unassigned: action.unassigned };

    case "POOL_TO_SEAT": {
      const slot = state.unassigned.find((s) => s.student_id === action.studentId);
      if (!slot) return state;
      if (state.seated[action.seatIndex] !== null) return state; // seat occupied
      const seated = [...state.seated];
      seated[action.seatIndex] = slot;
      return {
        seated,
        unassigned: state.unassigned.filter((s) => s.student_id !== action.studentId),
      };
    }

    case "SEAT_TO_POOL": {
      const slot = state.seated[action.seatIndex];
      if (!slot) return state;
      const seated = [...state.seated];
      seated[action.seatIndex] = null;
      return { seated, unassigned: [...state.unassigned, { ...slot, sitting_plan_id: undefined }] };
    }

    case "SEAT_TO_SEAT": {
      const { fromIndex, toIndex } = action;
      if (fromIndex === toIndex) return state;
      const seated = [...state.seated];
      const from = seated[fromIndex];
      if (!from) return state;
      if (seated[toIndex] !== null) return state; // target occupied
      seated[toIndex] = from;
      seated[fromIndex] = null;
      return { ...state, seated };
    }

    case "MARK_SAVED": {
      return {
        ...state,
        seated: state.seated.map((s, idx) =>
          s && !s.sitting_plan_id
            ? { ...s, sitting_plan_id: "saved", original_seat_index: idx }
            : s && s.sitting_plan_id
            ? { ...s, original_seat_index: idx }
            : s,
        ),
      };
    }

    default:
      return state;
  }
}

export function useRoomSittingPlan(
  hallDetailId: string,
  examId: string,
  academicYearId: string,
) {
  const [room, setRoom] = useState<ExamHallDetail | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [state, dispatch] = useReducer(seatReducer, {
    seated: [],
    unassigned: [],
  });
  // sitting_plan_ids queued for DELETE on next Save
  const pendingRemovals = useRef<Set<string>>(new Set());
  const [removedCount, setRemovedCount] = useState(0);

  useEffect(() => {
    if (!hallDetailId || !examId || !academicYearId) return;
    setIsLoading(true);

    Promise.all([
      HallDetailService.getById(hallDetailId),
      ExamsService.getById(examId),
      ExamsService.list({ academic_year_id: academicYearId, limit: 200 }),
    ])
      .then(([roomData, examData, allExamsRes]) => {
        setRoom(roomData);
        setExam(examData);

        // Find all exams for the same test name+term (one per class)
        const siblingExams = allExamsRes.items.filter(
          (e) => e.exam_name === examData.exam_name && e.exam_term === examData.exam_term,
        );
        const siblingExamIds = siblingExams.map((e) => e.id);
        const siblingClassIds = [...new Set(siblingExams.map((e) => e.class_id))];

        // class_id → which exam record it belongs to (for save routing)
        const examByClassId: Record<string, string> = {};
        siblingExams.forEach((e) => { examByClassId[e.class_id] = e.id; });

        // class_id → short display label (Cl.1, Cl.2 …)
        const classLabelMap: Record<string, string> = {};
        siblingExams.forEach((e, i) => {
          if (!classLabelMap[e.class_id]) classLabelMap[e.class_id] = `Cl.${i + 1}`;
        });

        return Promise.all([
          // All students across sibling classes
          Promise.all(
            siblingClassIds.map((cid) =>
              StudentsService.list({ academic_year_id: academicYearId, class_id: cid, limit: 100 }),
            ),
          ).then((results) => results.flatMap((r) => r.items)),
          // Plans for THIS room only (seat layout)
          Promise.all(
            siblingExamIds.map((eid) =>
              SittingPlanService.list({ exam_id: eid, hall_detail_id: hallDetailId, limit: 1000 }),
            ),
          ).then((results) => results.flatMap((r) => r.items)),
          // Plans for ALL rooms (to exclude students already seated elsewhere)
          Promise.all(
            siblingExamIds.map((eid) =>
              SittingPlanService.list({ exam_id: eid, limit: 1000 }),
            ),
          ).then((results) => results.flatMap((r) => r.items)),
        ]).then(([allStudents, thisRoomPlans, allRoomPlans]) => {
          const studentMap = Object.fromEntries(
            allStudents.map((s) => [
              s.id,
              {
                name: [s.first_name, s.last_name].filter(Boolean).join(" "),
                admission_number: s.admission_number,
                roll_number: s.roll_number ?? undefined,
                class_id: s.class_id,
              },
            ]),
          );

          // Students assigned to any room at all (exclude from unassigned pool)
          const assignedAnywhereIds = new Set(allRoomPlans.map((p) => p.student_id));

          const seated: (StudentSlot | null)[] = Array(roomData.sitting_capacity).fill(null);
          thisRoomPlans.forEach((p, i) => {
            if (i >= roomData.sitting_capacity) return;
            const meta = studentMap[p.student_id];
            const seatIdx = p.seat_number ? p.seat_number - 1 : i;
            seated[seatIdx] = {
              student_id: p.student_id,
              name: meta?.name ?? p.student_id,
              admission_number: meta?.admission_number ?? "",
              roll_number: p.roll_number ?? meta?.roll_number,
              sitting_plan_id: p.id,
              original_seat_index: seatIdx,
              class_label: meta ? classLabelMap[meta.class_id] : undefined,
              exam_id: p.exam_id,
            };
          });

          // Only show students with NO room assignment yet
          const unassigned = allStudents
            .filter((s) => !assignedAnywhereIds.has(s.id))
            .map((s) => ({
              student_id: s.id,
              name: [s.first_name, s.last_name].filter(Boolean).join(" "),
              admission_number: s.admission_number,
              roll_number: s.roll_number ?? undefined,
              class_label: classLabelMap[s.class_id],
              exam_id: examByClassId[s.class_id],
            }));

          dispatch({ type: "INIT", seated, unassigned });
        });
      })
      .catch(() => toast.error("Failed to load room data"))
      .finally(() => setIsLoading(false));
  }, [hallDetailId, examId, academicYearId]);

  const movePoolToSeat = useCallback((studentId: string, seatIndex: number) => {
    dispatch({ type: "POOL_TO_SEAT", studentId, seatIndex });
  }, []);

  /** Synchronous — queues saved-entry deletion for next Save click */
  const removeSeat = useCallback((seatIndex: number) => {
    const slot = state.seated[seatIndex];
    if (!slot) return;
    if (slot.sitting_plan_id && slot.sitting_plan_id !== "saved") {
      pendingRemovals.current.add(slot.sitting_plan_id);
      setRemovedCount(pendingRemovals.current.size);
    }
    dispatch({ type: "SEAT_TO_POOL", seatIndex });
  }, [state.seated]);

  const moveSeatToSeat = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: "SEAT_TO_SEAT", fromIndex, toIndex });
  }, []);

  const newCount = state.seated.filter((s) => s && !s.sitting_plan_id).length;
  const movedCount = state.seated.filter(
    (s, i) => s && s.sitting_plan_id && s.sitting_plan_id !== "saved" && s.original_seat_index !== undefined && s.original_seat_index !== i
  ).length;
  const hasChanges = newCount > 0 || removedCount > 0 || movedCount > 0;

  const save = useCallback(async () => {
    if (!room || !exam) return;
    setIsSaving(true);
    try {
      // 1. Delete unassigned (saved) entries
      const toDelete = [...pendingRemovals.current];
      await Promise.all(toDelete.map((id) => SittingPlanService.remove(id)));
      pendingRemovals.current.clear();

      // 2. Update moved seats (has sitting_plan_id but current index ≠ original)
      const movedEntries: { id: string; seat_number: number }[] = [];
      state.seated.forEach((slot, i) => {
        if (
          slot &&
          slot.sitting_plan_id &&
          slot.sitting_plan_id !== "saved" &&
          slot.original_seat_index !== undefined &&
          slot.original_seat_index !== i
        ) {
          movedEntries.push({ id: slot.sitting_plan_id, seat_number: i + 1 });
        }
      });
      await Promise.all(
        movedEntries.map(({ id, seat_number }) =>
          SittingPlanService.update(id, { seat_number }),
        ),
      );

      // 3. Create new assignments grouped by exam_id (multi-class support)
      const entriesByExam: Record<string, SittingPlanEntry[]> = {};
      let totalNew = 0;
      state.seated.forEach((slot, i) => {
        if (slot && !slot.sitting_plan_id) {
          const eid = slot.exam_id ?? examId;
          if (!entriesByExam[eid]) entriesByExam[eid] = [];
          entriesByExam[eid].push({
            student_id: slot.student_id,
            hall_detail_id: hallDetailId,
            seat_number: i + 1,
            roll_number: slot.roll_number,
          });
          totalNew++;
        }
      });

      if (totalNew > 0) {
        await Promise.all(
          Object.entries(entriesByExam).map(([eid, entries]) =>
            SittingPlanService.bulkCreate({
              exam_id: eid,
              academic_year_id: academicYearId,
              entries,
            }),
          ),
        );
      }

      const parts: string[] = [];
      if (totalNew) parts.push(`${totalNew} assigned`);
      if (movedEntries.length) parts.push(`${movedEntries.length} moved`);
      if (toDelete.length) parts.push(`${toDelete.length} unassigned`);
      toast.success(parts.join(", ") || "Saved");
      setRemovedCount(0);
      dispatch({ type: "MARK_SAVED" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [state.seated, room, exam, hallDetailId, examId, academicYearId]);

  return {
    room,
    exam,
    seated: state.seated,
    unassigned: state.unassigned,
    isLoading,
    isSaving,
    hasChanges,
    newCount,
    movedCount,
    removedCount,
    movePoolToSeat,
    removeSeat,
    moveSeatToSeat,
    save,
  };
}

// ── Auto-Shuffle Hook ─────────────────────────────────────────────────────────

export interface ShuffleResult {
  total_assigned: number;
  rooms: { room_name: string; assigned_count: number }[];
}

export function useAutoShufflePlan() {
  const [isAssigning, setIsAssigning] = useState(false);
  const [result, setResult] = useState<ShuffleResult | null>(null);

  async function shuffle(
    examIds: string[],
    academicYearId: string,
    hallDetailIds: string[],
    clearExisting = true,
  ) {
    if (examIds.length === 0) {
      toast.error("Select at least one exam");
      return;
    }
    if (hallDetailIds.length === 0) {
      toast.error("Select at least one room");
      return;
    }
    setIsAssigning(true);
    setResult(null);
    try {
      const data = await SittingPlanService.autoShuffle({
        exam_ids: examIds,
        academic_year_id: academicYearId,
        hall_detail_ids: hallDetailIds,
        clear_existing: clearExisting,
      });
      setResult(data);
      toast.success(`${data.total_assigned} students assigned across ${data.rooms.length} room(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auto-assign failed");
    } finally {
      setIsAssigning(false);
    }
  }

  function reset() {
    setResult(null);
  }

  return { isAssigning, result, shuffle, reset };
}

// ── Admit Card Hook ───────────────────────────────────────────────────────────

export function useAdmitCard() {
  const [academicYearId, setAcademicYearId] = useState("");
  const [examId, setExamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [cardData, setCardData] = useState<AdmitCardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function generate() {
    if (!academicYearId || !examId || !studentId) {
      toast.error("Select academic year, exam and student");
      return;
    }
    setIsLoading(true);
    try {
      const data = await AdmitCardService.getData({
        student_id: studentId,
        exam_id: examId,
        academic_year_id: academicYearId,
      });
      setCardData(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : ADMIT_CARD_PAGE.toasts.fetchError);
    } finally {
      setIsLoading(false);
    }
  }

  function getPdfUrl() {
    return AdmitCardService.getPdfUrl({
      student_id: studentId,
      exam_id: examId,
      academic_year_id: academicYearId,
    });
  }

  return {
    academicYearId, setAcademicYearId,
    examId, setExamId,
    studentId, setStudentId,
    cardData,
    isLoading,
    generate,
    getPdfUrl,
  };
}
