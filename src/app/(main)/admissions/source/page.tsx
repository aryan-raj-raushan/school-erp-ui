"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAdmissionSources } from "@/hooks/useAdmissions";
import { useIsMobileReady } from "@/hooks/useIsMobileReady";
import { ADMISSION_ROUTES } from "@/constants/admission.constants";
import { SourceMobileList } from "@/components/admissions/SourceMobile";
import type { AdmissionSource } from "@/types/admissions.types";
import {
  Div,
  Badge,
  Spinner,
  DataTable,
  RowActions,
  type ColumnDef,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  FilterToolbar,
  type FilterField,
} from "@/components/ui";

const SHORT_DATE: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

function shortDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("en-IN", SHORT_DATE) : "—";
}

function AdmissionSourcesDesktop() {
  const router = useRouter();

  const {
    sources,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteSource,
  } = useAdmissionSources({ page: 1 });

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "is_enabled",
        label: "Status",
        placeholder: "All Statuses",
        options: [
          { value: "true", label: "Enabled" },
          { value: "false", label: "Disabled" },
        ],
      },
    ],
    [],
  );

  const filterValues: Record<string, string | undefined> = {
    is_enabled: filters.is_enabled === undefined ? undefined : String(filters.is_enabled),
  };

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ("is_enabled" in next) {
      updateFilters({
        is_enabled: next.is_enabled === undefined ? undefined : next.is_enabled === "true",
      });
    }
  }

  const pageHeaderConfig: PageHeaderConfig = {
    title: "Admission Sources",
    subtitle: pagination ? `${pagination.total} sources` : "Where students hear about you",
    actions: [
      {
        label: "Add Source",
        icon: <Plus size={16} />,
        onClick: () => router.push(ADMISSION_ROUTES.sourceCreateNew),
      },
    ],
  };

  const columns = useMemo<ColumnDef<AdmissionSource>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primary: true },
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ row }) => shortDate(row.original.start_date),
      },
      {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ row }) => shortDate(row.original.end_date),
      },
      {
        accessorKey: "is_enabled",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? "success" : "default"}>
            {row.original.is_enabled ? "Enabled" : "Disabled"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <RowActions
            onView={() => router.push(ADMISSION_ROUTES.sourceView(row.original.id))}
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () => router.push(ADMISSION_ROUTES.sourceEdit(row.original.id)),
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                confirm: {
                  description: `Are you sure you want to delete ${row.original.name}? This action cannot be undone.`,
                },
                onClick: () => deleteSource(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [router, deleteSource],
  );

  return (
    <PageCol>
      <PageHeader sticky {...pageHeaderConfig} />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        sheetTitle="Filter Sources"
      />

      <DataTable
        columns={columns}
        data={sources}
        isLoading={isLoading}
        emptyText="No admission sources found"
        pagination={pagination ?? undefined}
      />
    </PageCol>
  );
}

function AdmissionSourcesContent() {
  const isMobile = useIsMobileReady();

  if (isMobile === undefined) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  return isMobile ? <SourceMobileList /> : <AdmissionSourcesDesktop />;
}

export default function AdmissionSourcesPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <AdmissionSourcesContent />
    </Suspense>
  );
}
