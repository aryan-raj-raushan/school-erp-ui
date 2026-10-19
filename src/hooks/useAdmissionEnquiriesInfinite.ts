"use client";

import { toast } from "sonner";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { AdmissionEnquiriesService } from "@/services/admissions.service";
import { haptic } from "@/lib/haptics";
import type {
  AdmissionEnquiry,
  AdmissionEnquiryFilters,
} from "@/types/admissions.types";

type ListFilters = Omit<AdmissionEnquiryFilters, "page" | "limit">;

/**
 * Mobile enquiry list: infinite paging plus delete, so screens never touch
 * the service directly. Pass `initialFilters` for fixed views (e.g. today's
 * follow-ups).
 */
export function useAdmissionEnquiriesInfinite(initialFilters: ListFilters = {}) {
  const list = useInfiniteList<AdmissionEnquiry, ListFilters>({
    fetchPage: (params) => AdmissionEnquiriesService.list(params),
    initialFilters,
    errorMessage: "Failed to load enquiries",
  });

  const { removeItem } = list;

  async function deleteEnquiry(enquiry: AdmissionEnquiry) {
    try {
      await AdmissionEnquiriesService.remove(enquiry.id);
      removeItem(enquiry.id);
      void haptic("success");
      toast.success("Enquiry deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return { ...list, deleteEnquiry };
}
