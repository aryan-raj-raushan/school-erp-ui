"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { SittingPlanService, AdmitCardService } from "@/services/exam.service";
import type {
  ExamSittingPlan,
  SittingFilters,
  SittingPlanEntry,
  AdmitCardData,
} from "@/types/exam.types";
import type { PaginationMeta } from "@/types";
import { SITTING_PLAN_PAGE, ADMIT_CARD_PAGE } from "@/constants/exam.constants";

// ── Sitting Plan List ─────────────────────────────────────────────────────────

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

// ── Sitting Plan Bulk Assign ──────────────────────────────────────────────────

export interface SittingRow extends SittingPlanEntry {
  student_name: string;
}

export function useSittingPlanForm() {
  const [examId, setExamId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [hallPlanId, setHallPlanId] = useState("");
  const [rows, setRows] = useState<SittingRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  function addRow(row: SittingRow) {
    setRows((prev) => [...prev, row]);
  }

  function removeRow(studentId: string) {
    setRows((prev) => prev.filter((r) => r.student_id !== studentId));
  }

  function updateRow(studentId: string, changes: Partial<SittingRow>) {
    setRows((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, ...changes } : r))
    );
  }

  async function save() {
    if (!examId || !academicYearId || !hallPlanId) {
      toast.error("Select exam, academic year and hall plan");
      return;
    }
    if (rows.length === 0) {
      toast.error("Add at least one student");
      return;
    }
    setIsSaving(true);
    try {
      await SittingPlanService.bulkCreate({
        exam_id: examId,
        academic_year_id: academicYearId,
        hall_plan_id: hallPlanId,
        entries: rows.map(({ student_name: _n, ...r }) => r),
      });
      toast.success(SITTING_PLAN_PAGE.toasts.createSuccess);
      setRows([]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    examId, setExamId,
    academicYearId, setAcademicYearId,
    hallPlanId, setHallPlanId,
    rows, addRow, removeRow, updateRow,
    isSaving, save,
  };
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