"use client";

import { toast } from "sonner";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { AdmissionSourcesService } from "@/services/admissions.service";
import { haptic } from "@/lib/haptics";
import type {
  AdmissionSource,
  AdmissionSourceFilters,
} from "@/types/admissions.types";

type ListFilters = Omit<AdmissionSourceFilters, "page" | "limit">;

/** Mobile admission-source list with infinite paging and delete. */
export function useAdmissionSourcesInfinite() {
  const list = useInfiniteList<AdmissionSource, ListFilters>({
    fetchPage: (params) => AdmissionSourcesService.list(params),
    initialFilters: {},
    errorMessage: "Failed to load sources",
  });

  const { removeItem } = list;

  async function deleteSource(source: AdmissionSource) {
    try {
      await AdmissionSourcesService.remove(source.id);
      removeItem(source.id);
      void haptic("success");
      toast.success("Source deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return { ...list, deleteSource };
}
