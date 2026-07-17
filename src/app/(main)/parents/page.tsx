"use client";

import { useEffect, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
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
} from "@/components/ui";
import { PARENT_RELATION_OPTIONS } from "@/constants/students.constants";
import AddParentModal from "@/components/parent/add-parent-modal";

const RELATION_LABEL: Record<string, string> = {
  FATHER: "Father",
  MOTHER: "Mother",
  GUARDIAN: "Guardian",
  GRANDPARENT: "Grandparent",
  SIBLING: "Sibling",
  OTHER: "Other",
};

export default function ParentsPage() {
  const {
    parents,
    pagination,
    filters,
    isLoading,
    showModal,
    openModal,
    closeModal,
    form,
    handleSubmit,
    isSubmitting,
    deleteParent,
    years,
    classes,
    sections,
    selectedYearId,
    selectedClassId,
    selectedSectionId,
    handleYearChange,
    handleClassChange,
    handleSectionChange,
    students,
    studentsLoading,
    updateFilters,
  } = useParents();

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
    subtitle: `${pagination.total} guardian records`,
    // actions: [
    //   {
    //     label: "Add Guardian",
    //     icon: <Plus size={14} />,
    //     onClick: openModal,
    //   },
    // ],
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
          row.original.phone_number
            ? `${row.original.dial_code ?? ""} ${row.original.phone_number}`
            : "—",
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

      {/* Add Guardian Modal */}
      <AddParentModal
        showModal={showModal}
        closeModal={closeModal}
        form={form}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        years={years}
        classes={classes}
        sections={sections}
        selectedYearId={selectedYearId}
        selectedClassId={selectedClassId}
        selectedSectionId={selectedSectionId}
        handleYearChange={handleYearChange}
        handleClassChange={handleClassChange}
        handleSectionChange={handleSectionChange}
        students={students}
        studentsLoading={studentsLoading}
      />
    </PageCol>
  );
}
