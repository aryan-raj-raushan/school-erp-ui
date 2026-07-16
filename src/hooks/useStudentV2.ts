"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { StudentsService } from "@/services/students-v2.service";
import type { StudentListItem, StudentFilters } from "@/types/students.types";
import type { PaginationMeta } from "@/types";

export function useStudents(initialFilters: StudentFilters = {}) {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<StudentFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const fetchStudents = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    try {
      const result = await StudentsService.list(filters);
      // Ignore stale responses — a newer filter change may have already
      // fired a request that resolves before this one.
      if (requestId !== requestIdRef.current) return;
      setStudents(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) return;
      toast.error(
        err instanceof Error ? err.message : "Failed to load students",
      );
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  function updateFilters(next: Partial<StudentFilters>) {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }

  async function deleteStudent(id: string) {
    try {
      await StudentsService.remove(id);
      toast.success("Student deleted");
      await fetchStudents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function toggleEnabled(id: string, enabled: boolean) {
    try {
      if (enabled) {
        await StudentsService.enable(id);
        toast.success("Student enabled");
      } else {
        await StudentsService.disable(id);
        toast.success("Student disabled");
      }
      await fetchStudents();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  return {
    students,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteStudent,
    toggleEnabled,
    refetch: fetchStudents,
  };
}
