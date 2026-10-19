"use client";

import { toast } from "sonner";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { SchoolEventsService } from "@/services/school-events.service";
import { haptic } from "@/lib/haptics";
import type { SchoolEvent, SchoolEventFilters } from "@/types/setting/school-events.types";

type ListFilters = Omit<SchoolEventFilters, "page" | "limit">;

/** Mobile events & holidays list: infinite paging plus delete. */
export function useSchoolEventsInfinite(initialFilters: ListFilters = {}) {
  const list = useInfiniteList<SchoolEvent, ListFilters>({
    fetchPage: (params) => SchoolEventsService.list(params),
    initialFilters,
    errorMessage: "Failed to load events",
  });

  const { removeItem } = list;

  async function deleteEvent(event: SchoolEvent) {
    try {
      await SchoolEventsService.remove(event.id);
      removeItem(event.id);
      void haptic("success");
      toast.success("Deleted successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return { ...list, deleteEvent };
}
