"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useAdmissionEnquiries, useAdmissionLookups } from "@/hooks/useAdmissions";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useFilterParams } from "@/hooks/useFilterParams";
import type {
  AdmissionEnquiryFilters,
  EnquiryStatus,
  AdmissionEnquiry,
} from "@/types/admissions.types";
import {
  Div,
  Button,
  Input,
  Select,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  PageCol,
  FilterBar,
  PageHeader,
  ResponsiveSelect,
} from "@/components/ui";
import {
  ADMISSION_PAGE,
  STATUS_BADGE,
  STATUS_OPTIONS,
} from "@/constants/admission.constants";

function AdmissionsContent() {
  const router = useRouter();
  const { years } = useAcademicYears();
  const { classes, teachers } = useAdmissionLookups();

  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    academic_year_id: undefined,
    applying_class_id: undefined,
    status: undefined,
    search: undefined,
    page: undefined,
  });

  const initialFilters: AdmissionEnquiryFilters = {
    academic_year_id: urlFilters.academic_year_id || undefined,
    applying_class_id: urlFilters.applying_class_id || undefined,
    status: (urlFilters.status as EnquiryStatus) || undefined,
    search: urlFilters.search || undefined,
    page: urlFilters.page ? Number(urlFilters.page) : 1,
  };

  const {
    enquiries,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteEnquiry,
  } = useAdmissionEnquiries(initialFilters);

  function handleFilterChange(next: Partial<AdmissionEnquiryFilters>) {
    updateFilters(next);
    const urlNext: Record<string, string | undefined> = {};
    if ("academic_year_id" in next)
      urlNext.academic_year_id = next.academic_year_id || undefined;
    if ("applying_class_id" in next)
      urlNext.applying_class_id = next.applying_class_id || undefined;
    if ("status" in next) urlNext.status = next.status || undefined;
    if ("search" in next) urlNext.search = next.search || undefined;
    if ("page" in next)
      urlNext.page = next.page ? String(next.page) : undefined;
    setUrlFilters(urlNext);
  }

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
          <Div type="row" gap="sm">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => router.push(`/admissions/${row.original.id}`)}
              title="View"
            >
              <Eye size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() =>
                router.push(`/admissions/${row.original.id}?edit=true`)
              }
              title="Edit"
            >
              <Pencil size={14} />
            </Button>
          </Div>
        ),
      },
    ],
    [router, classes],
  );

  return (
    <PageCol>
      <PageHeader
        title={ADMISSION_PAGE.pageHeading.title}
        subtitle={pagination ? `${pagination.total} enquiries` : ""}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push("/admissions/source")}
            >
              {ADMISSION_PAGE.buttons.manage}
            </Button>
            <Button onClick={() => router.push("/admissions/create-new")}>
              <Plus size={16} /> {ADMISSION_PAGE.buttons.addEnquiry}
            </Button>
          </>
        }
      />

      <FilterBar>
        <Input
          width="md"
          placeholder="Search student name or phone…"
          value={filters.search ?? ""}
          onChange={(e) =>
            handleFilterChange({ search: e.target.value || undefined })
          }
        />
        <ResponsiveSelect
          width="sm"
          customPlaceholder="All Years"
          options={years.map((y) => ({ value: y.id, label: y.name }))}
          value={filters.academic_year_id ?? ""}
          onChange={(e) =>
            handleFilterChange({
              academic_year_id: e.target.value || undefined,
            })
          }
        />
        <ResponsiveSelect
          width="sm"
          customPlaceholder="All Classes"
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
          value={filters.applying_class_id ?? ""}
          onChange={(e) =>
            handleFilterChange({
              applying_class_id: e.target.value || undefined,
            })
          }
        />
        <ResponsiveSelect
          width="sm"
          customPlaceholder="All Status"
          options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={filters.status ?? ""}
          onChange={(e) =>
            handleFilterChange({
              status: (e.target.value as EnquiryStatus) || undefined,
            })
          }
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={enquiries}
        isLoading={isLoading}
        emptyText={ADMISSION_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
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
