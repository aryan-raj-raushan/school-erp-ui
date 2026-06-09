"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useAdmissionSources } from "@/hooks/useAdmissions";
import { useFilterParams } from "@/hooks/useFilterParams";
import type { AdmissionSourceFilters } from "@/types/admissions.types";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Button,
  Select,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  TablePagination,
  Badge,
  Spinner,
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

  return (
    <Div type="col" gap="lg">
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

      <Div type="row" gap="md" align="center">
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
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Start Date</TableHeaderCell>
            <TableHeaderCell>End Date</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}>
              <Spinner />
            </TableEmptyRow>
          ) : sources.length === 0 ? (
            <TableEmptyRow colSpan={5}>
              No admission sources found
            </TableEmptyRow>
          ) : (
            sources.map((src) => (
              <TableRow key={src.id}>
                <TableCell primary>{src.name}</TableCell>
                <TableCell>
                  {src.start_date
                    ? new Date(src.start_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </TableCell>
                <TableCell>
                  {src.end_date
                    ? new Date(src.end_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={src.is_enabled ? "success" : "default"}>
                    {src.is_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="sm">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/admissions/source/view?id=${src.id}`)
                      }
                      title="View"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(
                          `/admissions/source/view?id=${src.id}&edit=true`,
                        )
                      }
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => deleteSource(src.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}
    </Div>
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
