"use client";

import { useEffect, useMemo, useState } from "react";
import { RolesService, type Role as ApiRole } from "@/services/roles.service";
import type { StaffFilters } from "@/services/staff.service";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import { STAFF_STATUS_OPTIONS } from "@/constants";
import type { FilterField } from "@/components/ui";

type PersistedStaffFilters = Pick<StaffFilters, "status" | "role">;

const PERSISTED_KEYS = ["status", "role"] as const;

/**
 * Filter fields, values and handlers for the staff list (with saved
 * filters), plus the active roles used to label staff.
 */
export function useStaffFilterConfig(
  filters: StaffFilters,
  updateFilters: (next: Partial<StaffFilters>) => void,
) {
  const [roles, setRoles] = useState<ApiRole[]>([]);

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated,
  } = useStorageFilter<PersistedStaffFilters>({
    key: STORAGE_FILTER_KEYS.STAFF,
    defaultValue: {},
  });

  useEffect(() => {
    RolesService.list({ limit: 100 })
      .then((res) => setRoles(res.items.filter((r) => r.is_active)))
      .catch(() => setRoles([]));
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (Object.values(storedFilters).some(Boolean)) updateFilters(storedFilters);
    // Apply saved filters exactly once, when storage first hydrates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  function onChange(next: Partial<StaffFilters>) {
    updateFilters(next);
    const persisted: Partial<PersistedStaffFilters> = {};
    PERSISTED_KEYS.forEach((key) => {
      if (key in next) persisted[key] = next[key] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function onClear() {
    onChange({ search: undefined, status: undefined, role: undefined });
    clearStoredFilters();
  }

  const filterFields = useMemo<FilterField[]>(
    () => [
      { type: "search", key: "search", placeholder: "Search by name or phone" },
      {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "All status",
        options: STAFF_STATUS_OPTIONS.filter((o) => o.value).map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
      {
        type: "select",
        key: "role",
        label: "Role",
        placeholder: "All roles",
        options: roles.map((r) => ({
          value: r.name.toUpperCase().replace(/ /g, "_"),
          label: r.name,
        })),
      },
    ],
    [roles],
  );

  const filterValues: Record<string, string | undefined> = {
    search: filters.search,
    status: filters.status,
    role: filters.role,
  };

  return { roles, filterFields, filterValues, onChange, onClear };
}
