"use client";

import { useEffect, useMemo } from "react";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useAdmissionLookups } from "@/hooks/useAdmissions";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import { STATUS_OPTIONS } from "@/constants/admission.constants";
import type { AdmissionEnquiryFilters } from "@/types/admissions.types";
import type { FilterField } from "@/components/ui";

type PersistedEnquiryFilters = Pick<
  AdmissionEnquiryFilters,
  "academic_year_id" | "applying_class_id" | "status"
>;

const PERSISTED_KEYS = ["academic_year_id", "applying_class_id", "status"] as const;

/**
 * Filter fields, current values and change/clear handlers for the enquiry
 * list, including cross-visit persistence. Shared by the desktop table and
 * the mobile card list so both behave identically.
 */
export function useEnquiryFilterConfig(
  filters: AdmissionEnquiryFilters,
  updateFilters: (next: Partial<AdmissionEnquiryFilters>) => void,
) {
  const { years } = useAcademicYears();
  const { classes } = useAdmissionLookups();

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated,
  } = useStorageFilter<PersistedEnquiryFilters>({
    key: STORAGE_FILTER_KEYS.ADMISSIONS,
    defaultValue: {},
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (Object.values(storedFilters).some(Boolean)) updateFilters(storedFilters);
    // Apply saved filters exactly once, when storage first hydrates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  function onChange(next: Partial<AdmissionEnquiryFilters>) {
    updateFilters(next);
    const persisted: Partial<PersistedEnquiryFilters> = {};
    PERSISTED_KEYS.forEach((key) => {
      if (key in next) persisted[key] = next[key] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function onClear() {
    onChange({
      academic_year_id: undefined,
      applying_class_id: undefined,
      status: undefined,
      search: undefined,
      page: 1,
    });
    clearStoredFilters();
  }

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: "Search student name or phone…",
      },
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: "All Years",
        options: years.map((y) => ({ value: y.id, label: y.name })),
      },
      {
        type: "select",
        key: "applying_class_id",
        label: "Applying Class",
        placeholder: "All Classes",
        options: classes.map((c) => ({ value: c.id, label: c.name })),
      },
      {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "All Status",
        options: STATUS_OPTIONS.filter((o) => o.value).map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
    ],
    [years, classes],
  );

  const filterValues: Record<string, string | undefined> = {
    search: filters.search,
    academic_year_id: filters.academic_year_id,
    applying_class_id: filters.applying_class_id,
    status: filters.status,
  };

  return { filterFields, filterValues, onChange, onClear, classes };
}
