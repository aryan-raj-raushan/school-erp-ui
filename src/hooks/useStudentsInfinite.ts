"use client";

import { toast } from "sonner";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { StudentsService } from "@/services/students-v2.service";
import { haptic } from "@/lib/haptics";
import type { StudentFilters, StudentListItem } from "@/types/students.types";

type ListFilters = Omit<StudentFilters, "page" | "limit">;

/**
 * Mobile students list: infinite paging plus optimistic enable/disable and
 * delete, so screens never touch the service directly.
 */
export function useStudentsInfinite() {
  const list = useInfiniteList<StudentListItem, ListFilters>({
    fetchPage: (params) => StudentsService.list(params),
    initialFilters: {},
    errorMessage: "Failed to load students",
  });

  const { patchItem, removeItem } = list;

  async function toggleEnabled(student: StudentListItem) {
    const enable = !student.is_enabled;
    patchItem(student.id, { is_enabled: enable });
    try {
      if (enable) await StudentsService.enable(student.id);
      else await StudentsService.disable(student.id);
      void haptic("success");
      toast.success(enable ? "Student enabled" : "Student disabled");
    } catch (err: unknown) {
      patchItem(student.id, { is_enabled: !enable });
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function deleteStudent(student: StudentListItem) {
    try {
      await StudentsService.remove(student.id);
      removeItem(student.id);
      void haptic("success");
      toast.success("Student deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return { ...list, toggleEnabled, deleteStudent };
}
