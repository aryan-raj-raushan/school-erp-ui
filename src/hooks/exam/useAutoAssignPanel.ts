"use client";

import { useState, useEffect, useMemo } from "react";
import { StudentsService } from "@/services/students.service";
import { useExams } from "./useExams";
import { useHallDetails } from "./useExamHall";
import { useAutoShufflePlan } from "./useExamSittingAndAdmit";
import type { Class } from "@/types";

interface UseAutoAssignPanelProps {
  academicYearId: string;
  classes: Class[];
  onComplete: () => void;
}

export function useAutoAssignPanel({ academicYearId, classes, onComplete }: UseAutoAssignPanelProps) {
  const { exams } = useExams(academicYearId ? { academic_year_id: academicYearId } : {});
  const { details: rooms } = useHallDetails();
  const { isAssigning, result, shuffle, reset } = useAutoShufflePlan();

  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [clearExisting, setClearExisting] = useState(true);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});

  const classNameById = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  const selectedExam = useMemo(
    () => exams.find((e) => e.id === selectedExamId) ?? null,
    [exams, selectedExamId],
  );

  // Default to every class in the exam whenever the exam selection changes
  useEffect(() => {
    setSelectedClassIds(selectedExam?.class_ids ?? []);
  }, [selectedExam]);

  // Fetch student counts per class of the selected exam
  useEffect(() => {
    if (!academicYearId || !selectedExam || selectedExam.class_ids.length === 0) {
      setStudentCounts({});
      return;
    }
    Promise.all(
      selectedExam.class_ids.map((cid) =>
        StudentsService.list({ class_id: cid, academic_year_id: academicYearId, limit: 100 })
          .then((r) => [cid, r.pagination?.total ?? r.items.length] as [string, number]),
      ),
    )
      .then((entries) => setStudentCounts(Object.fromEntries(entries)))
      .catch(() => {});
  }, [academicYearId, selectedExam]);

  const totalSelectedStudents = useMemo(
    () => selectedClassIds.reduce((sum, cid) => sum + (studentCounts[cid] ?? 0), 0),
    [selectedClassIds, studentCounts],
  );

  const totalSelectedCapacity = useMemo(
    () =>
      selectedRoomIds.reduce((sum, rid) => {
        const room = rooms.find((r) => r.id === rid);
        return sum + (room?.sitting_capacity ?? 0);
      }, 0),
    [selectedRoomIds, rooms],
  );

  const capacityShortfall =
    totalSelectedStudents > 0 && totalSelectedCapacity < totalSelectedStudents
      ? totalSelectedStudents - totalSelectedCapacity
      : 0;

  function toggleClass(classId: string) {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((x) => x !== classId) : [...prev, classId],
    );
  }

  function toggleRoom(id: string) {
    setSelectedRoomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleShuffle() {
    if (!selectedExamId) return;
    await shuffle(selectedExamId, selectedClassIds, academicYearId, selectedRoomIds, clearExisting);
    onComplete();
  }

  function handleReset() {
    reset();
    setSelectedExamId("");
    setSelectedClassIds([]);
    setSelectedRoomIds([]);
  }

  return {
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
  };
}
