"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ExamScheduleService } from "@/services/exam.service";
import type { BulkUpdateSchedulePayload } from "@/types/exam.types";

export function useScheduleBulkActions(onDone: () => void) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const [conflicts, setConflicts] = useState<{ id: string; reason: string }[]>([]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => (prev.size === ids.length ? new Set() : new Set(ids)));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
    setConflicts([]);
  }, []);

  async function applyBulkUpdate(fields: Omit<BulkUpdateSchedulePayload, "ids">) {
    if (selectedIds.size === 0) return;
    setIsApplying(true);
    try {
      const result = await ExamScheduleService.bulkUpdate({ ids: [...selectedIds], ...fields });
      setConflicts(result.conflicts);
      if (result.conflicts.length > 0) {
        toast.warning(`${result.updated.length} updated, ${result.conflicts.length} skipped (locked or clashing)`);
      } else {
        toast.success(`${result.updated.length} schedule(s) updated`);
      }
      onDone();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Bulk update failed");
    } finally {
      setIsApplying(false);
    }
  }

  async function applyBulkLock(locked: boolean) {
    if (selectedIds.size === 0) return;
    setIsApplying(true);
    try {
      await ExamScheduleService.bulkLock({ ids: [...selectedIds], locked });
      toast.success(`${selectedIds.size} schedule(s) ${locked ? "locked" : "unlocked"}`);
      onDone();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Bulk lock failed");
    } finally {
      setIsApplying(false);
    }
  }

  async function applyBulkDelete() {
    if (selectedIds.size === 0) return;
    setIsApplying(true);
    try {
      await ExamScheduleService.bulkRemove([...selectedIds]);
      toast.success(`${selectedIds.size} schedule(s) deleted`);
      clear();
      onDone();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setIsApplying(false);
    }
  }

  return {
    selectedIds,
    toggle,
    toggleAll,
    clear,
    isApplying,
    conflicts,
    applyBulkUpdate,
    applyBulkLock,
    applyBulkDelete,
  };
}
