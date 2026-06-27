"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useAdmissionSources } from "@/hooks/useAdmissions";
import { useFilterParams } from "@/hooks/useFilterParams";
import type { AdmissionSourceFilters } from "@/types/admissions.types";
import type { AdmissionSource } from "@/types/admissions.types";
import {
  Div,
  Button,
  Select,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  PageHeader,
  PageCol,
  FilterBar,
} from "@/components/ui";

function AdmissionSourcesContent() {
  const router = useRouter();

  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    is_enabled: undefined,
    page: undefined,
  });

  const initialFilters: AdmissionSourceFilters = {
    is_enabled:
      urlFilters.is_enabled !== undefined
        ? urlFilters.is_enabled === "true"
        : undefined,
    page: urlFilters.page ? Number(urlFilters.page) : 1,
  };

  const {
    sources,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteSource,
  } = useAdmissionSources(initialFilters);

  function handleFilterChange(next: Partial<AdmissionSourceFilters>) {
    updateFilters(next);
    const urlNext: Record<string, string | undefined> = {};
    if ("is_enabled" in next)
      urlNext.is_enabled =
        next.is_enabled !== undefined ? String(next.is_enabled) : undefined;
    if ("page" in next)
      urlNext.page = next.page ? String(next.page) : undefined;
    setUrlFilters(urlNext);
  }

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
        cell: ({ row }) =>
          row.original.start_date
            ? new Date(row.original.start_date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",
      },
      {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ row }) =>
          row.original.end_date
            ? new Date(row.original.end_date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",
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
          <Div type="row" gap="sm">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                router.push(`/admissions/source/${row.original.id}`)
              }
              title="View"
            >
              <Eye size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                router.push(`/admissions/source/${row.original.id}?edit=true`)
              }
              title="Edit"
            >
              <Pencil size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="destructive"
              onClick={() => deleteSource(row.original.id)}
              title="Delete"
            >
              <Trash2 size={14} />
            </Button>
          </Div>
        ),
      },
    ],
    [router, deleteSource],
  );

  return (
    <PageCol>
      <PageHeader
        title="Admission Sources"
        subtitle={
          pagination
            ? `${pagination.total} sources`
            : "Where students hear about you"
        }
        actions={
          <Button onClick={() => router.push("/admissions/source/create-new")}>
            <Plus size={16} /> Add Source
          </Button>
        }
      />

      <FilterBar>
        <Select
          width="sm"
          value={
            filters.is_enabled === undefined ? "" : String(filters.is_enabled)
          }
          onChange={(e) =>
            handleFilterChange({
              is_enabled:
                e.target.value === "" ? undefined : e.target.value === "true",
            })
          }
        >
          <option value="">All Statuses</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </Select>
      </FilterBar>

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
