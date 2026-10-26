"use client";

import { useEffect, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useParents, type GuardianFilters } from "@/hooks/useParents";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import type { GuardianRow } from "@/services/students-v2.service";
import {
  Div,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  FilterToolbar,
  type FilterField,
  DataTable,
  type ColumnDef,
  RowActions,
  Badge,
  Spinner,
} from "@/components/ui";
import { PARENT_RELATION_OPTIONS } from "@/constants/students.constants";
import { ParentsMobileList } from "@/components/parent/ParentsMobileList";
import { useIsMobileReady } from "@/hooks/useIsMobileReady";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

const RELATION_LABEL: Record<string, string> = {
  FATHER: "Father",
  MOTHER: "Mother",
  GUARDIAN: "Guardian",
  GRANDPARENT: "Grandparent",
  SIBLING: "Sibling",
  OTHER: "Other",
};

export default function ParentsPage() {
  const isMobile = useIsMobileReady();
  const { parents, total, filters, isLoading, deleteParent, updateFilters, refetch } =
    useParents();

  type PersistedGuardianFilters = Pick<
    GuardianFilters,
    "relation" | "is_primary" | "can_pickup"
  >;

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedGuardianFilters>({
    key: STORAGE_FILTER_KEYS.PARENTS,
    defaultValue: {},
  });

  function handleFilterChange(next: Partial<GuardianFilters>) {
    updateFilters(next);

    const persisted: Partial<PersistedGuardianFilters> = {};
    (["relation", "is_primary", "can_pickup"] as const).forEach((field) => {
      if (field in next) persisted[field] = next[field] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    handleFilterChange({
      search: undefined,
      relation: undefined,
      is_primary: undefined,
      can_pickup: undefined,
    });
    clearStoredFilters();
  }

  // One-time: once storage has hydrated, apply any filters saved from a
  // previous visit.
  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) {
      updateFilters(storedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: "Search by name, phone or student",
      },
      {
        type: "select",
        key: "relation",
        label: "Relation",
        placeholder: "All Relations",
        options: PARENT_RELATION_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
      {
        type: "select",
        key: "is_primary",
        label: "Primary",
        placeholder: "All Guardians",
        options: [
          { value: "true", label: "Primary only" },
          { value: "false", label: "Non-primary" },
        ],
      },
      {
        type: "select",
        key: "can_pickup",
        label: "Pickup",
        placeholder: "Pickup: All",
        options: [
          { value: "true", label: "Can pickup" },
          { value: "false", label: "Cannot pickup" },
        ],
      },
    ],
    [],
  );

  const filterValues: Record<string, string | undefined> = {
    search: filters.search,
    relation: filters.relation,
    is_primary: filters.is_primary,
    can_pickup: filters.can_pickup,
  };

  const pageHeaderConfig: PageHeaderConfig = {
    title: "Parents & Guardians",
    subtitle: `${total} guardian records`,
  };

  const columns = useMemo<ColumnDef<GuardianRow>[]>(
    () => [
      {
        accessorKey: "first_name",
        header: "Guardian Name",
        meta: { primary: true },
        cell: ({ row }) =>
          `${row.original.first_name} ${row.original.last_name ?? ""}`,
      },
      {
        accessorKey: "relation",
        header: "Relation",
        cell: ({ row }) => (
          <Badge variant="default">
            {RELATION_LABEL[row.original.relation] ?? row.original.relation}
          </Badge>
        ),
      },
      {
        accessorKey: "phone_number",
        header: "Phone",
        cell: ({ row }) =>
          row.original.phone_number ? (
            <span className="inline-flex items-center gap-1">
              {`${row.original.dial_code ?? ""} ${row.original.phone_number}`}
              <WhatsAppButton phone={row.original.phone_number} dialCode={row.original.dial_code} />
            </span>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "student_name",
        header: "Student",
        cell: ({ row }) => row.original.student_name,
      },
      {
        accessorKey: "occupation",
        header: "Occupation",
        cell: ({ row }) => row.original.occupation ?? "—",
      },
      {
        id: "flags",
        header: "Flags",
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            {row.original.is_primary && (
              <Badge variant="success">Primary</Badge>
            )}
            {row.original.can_pickup && <Badge variant="default">Pickup</Badge>}
          </Div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                confirm: {
                  description: `Are you sure you want to remove ${
                    row.original.first_name
                  } ${
                    row.original.last_name ?? ""
                  } as a guardian? This action cannot be undone.`,
                },
                onClick: () => deleteParent(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [deleteParent],
  );

  if (isMobile === undefined) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  if (isMobile) {
    return (
      <ParentsMobileList
        parents={parents}
        isLoading={isLoading}
        filterFields={filterFields}
        filterValues={filterValues}
        onFilterChange={(next) => handleFilterChange(next as Partial<GuardianFilters>)}
        onFilterClear={handleClearFilters}
        onRefresh={refetch}
        onDelete={deleteParent}
      />
    );
  }

  return (
    <PageCol>
      <PageHeader sticky {...pageHeaderConfig} />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={(next) =>
          handleFilterChange(next as Partial<GuardianFilters>)
        }
        onClear={handleClearFilters}
        sheetTitle="Filter Guardians"
      />

      <DataTable
        columns={columns}
        data={parents}
        isLoading={isLoading}
        emptyText="No guardians found"
        fillViewport
      />
    </PageCol>
  );
}
