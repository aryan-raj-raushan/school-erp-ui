"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAdmissionEnquiries, useAdmissionLookups } from "@/hooks/useAdmissions";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import { AdmissionEnquiryDetail } from "./enquiry-detail";
import type {
  AdmissionEnquiryFilters,
  AdmissionEnquiry,
} from "@/types/admissions.types";
import {
  Div,
  Badge,
  Spinner,
  DataTable,
  RowActions,
  type ColumnDef,
  PageCol,
  PageHeader,
  type PageHeaderConfig,
  FilterToolbar,
  type FilterField,
} from "@/components/ui";
import {
  ADMISSION_PAGE,
  STATUS_BADGE,
  STATUS_OPTIONS,
} from "@/constants/admission.constants";

type PersistedAdmissionFilters = Pick<
  AdmissionEnquiryFilters,
  "academic_year_id" | "applying_class_id" | "status"
>;

function AdmissionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");
  const { years } = useAcademicYears();
  const { classes } = useAdmissionLookups();

  const {
    enquiries,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteEnquiry,
  } = useAdmissionEnquiries({ page: 1 });

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedAdmissionFilters>({
    key: STORAGE_FILTER_KEYS.ADMISSIONS,
    defaultValue: {},
  });

  function handleFilterChange(next: Partial<AdmissionEnquiryFilters>) {
    updateFilters(next);

    const persisted: Partial<PersistedAdmissionFilters> = {};
    (["academic_year_id", "applying_class_id", "status"] as const).forEach((field) => {
      if (field in next) persisted[field] = next[field] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    handleFilterChange({
      academic_year_id: undefined,
      applying_class_id: undefined,
      status: undefined,
      search: undefined,
      page: 1,
    });
    clearStoredFilters();
  }

  // One-time: once storage has hydrated, apply any filters saved from a
  // previous visit.
  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) updateFilters(storedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

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
        options: STATUS_OPTIONS.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label })),
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

  const pageHeaderConfig: PageHeaderConfig = {
    title: ADMISSION_PAGE.pageHeading.title,
    subtitle: pagination ? `${pagination.total} enquiries` : "",
    actions: [
      {
        label: ADMISSION_PAGE.buttons.manage,
        variant: "outline",
        onClick: () => router.push("/admissions/source"),
      },
      {
        label: ADMISSION_PAGE.buttons.addEnquiry,
        icon: <Plus size={16} />,
        onClick: () => router.push("/admissions/create-new"),
      },
    ],
  };

  const columns = useMemo<ColumnDef<AdmissionEnquiry>[]>(
    () => [
      {
        accessorKey: "student_name",
        header: ADMISSION_PAGE.table.studentName,
        meta: { primary: true },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE[row.original.status]}>
            {row.original.status.replace(/_/g, " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "phone",
        header: ADMISSION_PAGE.table.phone,
        cell: ({ row }) =>
          `${row.original.dial_code} ${row.original.phone}`,
      },
      {
        accessorKey: "applying_class_id",
        header: ADMISSION_PAGE.table.applyingClass,
        cell: ({ row }) =>
          classes.find((c) => c.id === row.original.applying_class_id)?.name ??
          "—",
      },
      {
        accessorKey: "next_followup_date",
        header: ADMISSION_PAGE.table.followUpDate,
        cell: ({ row }) =>
          row.original.next_followup_date
            ? new Date(row.original.next_followup_date).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              )
            : "—",
      },
      {
        id: "actions",
        header: ADMISSION_PAGE.table.actions,
        cell: ({ row }) => (
          <RowActions
            onView={() => router.push(`/admissions?id=${row.original.id}`)}
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () =>
                  router.push(`/admissions?id=${row.original.id}&edit=true`),
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                confirm: {
                  description: `Are you sure you want to delete the enquiry for ${row.original.student_name}? This action cannot be undone.`,
                },
                onClick: () => deleteEnquiry(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [router, classes, deleteEnquiry],
  );

  if (detailId) {
    return <AdmissionEnquiryDetail id={detailId} />;
  }

  return (
    <PageCol>
      <PageHeader sticky {...pageHeaderConfig} />

      <Div className="rounded-xl border border-border/60 bg-white p-3 dark:bg-neutral-900">
        <FilterToolbar
          fields={filterFields}
          values={filterValues}
          onChange={(next) => handleFilterChange(next as Partial<AdmissionEnquiryFilters>)}
          onClear={handleClearFilters}
          sheetTitle="Filter Enquiries"
        />
      </Div>

      <DataTable
        columns={columns}
        data={enquiries}
        isLoading={isLoading}
        emptyText={ADMISSION_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
        fillViewport
      />
    </PageCol>
  );
}

export default function AdmissionsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <AdmissionsContent />
    </Suspense>
  );
}
