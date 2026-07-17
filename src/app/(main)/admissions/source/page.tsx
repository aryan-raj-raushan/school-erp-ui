"use client";

import { Suspense, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Eye, Pencil, Trash2, X } from "lucide-react";
import { useAdmissionSources, useAdmissionSourceDetail } from "@/hooks/useAdmissions";
import type { AdmissionSourceFilters } from "@/types/admissions.types";
import type { AdmissionSource } from "@/types/admissions.types";
import {
  Div,
  H1,
  H2,
  H3,
  Button,
  Input,
  FormField,
  Badge,
  Spinner,
  InfoRow,
  DataTable,
  type ColumnDef,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  FilterToolbar,
  type FilterField,
} from "@/components/ui";

function AdmissionSourceDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startEditing = searchParams.get("edit") === "true";

  const {
    source,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
  } = useAdmissionSourceDetail(id);

  useEffect(() => {
    if (startEditing) setIsEditing(true);
  }, [startEditing, setIsEditing]);

  const {
    register,
    formState: { errors },
    reset,
  } = form;

  async function onSubmit() {
    const result = await form.handleSubmit(async (values) => {
      const payload = {
        ...values,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
      };
      const { AdmissionSourcesService } =
        await import("@/services/admissions.service");
      await AdmissionSourcesService.update(id, payload);
      const { toast } = await import("sonner");
      toast.success("Source updated");
      setIsEditing(false);
    })();
    return result;
  }

  if (isLoading) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-2xl">
      {/* Header */}
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admissions/source")}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <Div type="row" align="center" gap="sm">
            <H1>{source?.name ?? "Source Details"}</H1>
            {source && (
              <Badge variant={source.is_enabled ? "success" : "default"}>
                {source.is_enabled ? "Enabled" : "Disabled"}
              </Badge>
            )}
          </Div>
        </Div>
        {isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              reset();
            }}
          >
            <X size={14} /> Cancel
          </Button>
        ) : (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Pencil size={14} /> Edit
          </Button>
        )}
      </Div>

      {/* View Mode */}
      {!isEditing && source && (
        <Div
          type="col"
          gap="sm"
          className="rounded-xl border border-border bg-card p-5"
        >
          <H3
            color="muted"
            className="uppercase tracking-wider text-xs font-semibold mb-2"
          >
            Details
          </H3>
          <InfoRow label="Name" value={source.name} />
          <InfoRow
            label="Status"
            value={source.is_enabled ? "Enabled" : "Disabled"}
          />
          <InfoRow
            label="Start Date"
            value={
              source.start_date
                ? new Date(source.start_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"
            }
          />
          <InfoRow
            label="End Date"
            value={
              source.end_date
                ? new Date(source.end_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"
            }
          />
          <InfoRow
            label="Created"
            value={new Date(source.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
        </Div>
      )}

      {/* Form */}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit as any)}>
          <Div type="col" gap="lg">
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Source Details
              </H2>
              <FormField label="Name *" error={errors.name?.message}>
                <Input
                  placeholder="e.g. School Website, Word of Mouth, Newspaper Ad"
                  {...register("name")}
                />
              </FormField>
              <Div type="grid" cols={2} gap="md">
                <FormField
                  label="Start Date"
                  error={errors.start_date?.message}
                >
                  <Input type="date" {...register("start_date")} />
                </FormField>
                <FormField label="End Date" error={errors.end_date?.message}>
                  <Input type="date" {...register("end_date")} />
                </FormField>
              </Div>
              <Div type="row" align="center" gap="sm">
                <input
                  type="checkbox"
                  id="is_enabled"
                  {...register("is_enabled")}
                />
                <label
                  htmlFor="is_enabled"
                  className="text-sm font-medium text-foreground/80 cursor-pointer"
                >
                  Source is enabled (visible for new enquiries)
                </label>
              </Div>
            </Div>

            <Div type="row" justify="end" gap="sm">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Save Changes
              </Button>
            </Div>
          </Div>
        </form>
      )}
    </Div>
  );
}

function AdmissionSourcesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");

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
        onClick: () => router.push("/admissions/source/create-new"),
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
                router.push(`/admissions/source?id=${row.original.id}`)
              }
              title="View"
            >
              <Eye size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                router.push(`/admissions/source?id=${row.original.id}&edit=true`)
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

  if (detailId) {
    return <AdmissionSourceDetailContent id={detailId} />;
  }

  return (
    <PageCol>
      <PageHeader sticky {...pageHeaderConfig} />

      <Div className="rounded-xl border border-border/60 bg-white p-3 dark:bg-neutral-900">
        <FilterToolbar
          fields={filterFields}
          values={filterValues}
          onChange={handleFilterChange}
          sheetTitle="Filter Sources"
        />
      </Div>

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
