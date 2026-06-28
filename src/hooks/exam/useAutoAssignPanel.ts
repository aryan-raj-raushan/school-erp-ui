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

  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [clearExisting, setClearExisting] = useState(true);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});

  const classNameById = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

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

  const totalSelectedStudents = useMemo(
    () =>
      selectedExamIds.reduce((sum, eid) => {
        const exam = exams.find((e) => e.id === eid);
        return sum + (exam ? (studentCounts[exam.class_id] ?? 0) : 0);
      }, 0),
    [selectedExamIds, exams, studentCounts],
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

  return {
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
  };
}
