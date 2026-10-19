"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAdmissionEnquiries } from "@/hooks/useAdmissions";
import { useEnquiryFilterConfig } from "@/hooks/useEnquiryFilterConfig";
import { useIsMobileReady } from "@/hooks/useIsMobileReady";
import { EnquiryMobileList } from "@/components/admissions/EnquiryMobileList";
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
} from "@/components/ui";
import {
  ADMISSION_PAGE,
  ADMISSION_ROUTES,
  STATUS_BADGE,
} from "@/constants/admission.constants";

function AdmissionsDesktop() {
  const router = useRouter();

  const {
    enquiries,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteEnquiry,
  } = useAdmissionEnquiries({ page: 1 });

  const { filterFields, filterValues, onChange, onClear, classes } =
    useEnquiryFilterConfig(filters, updateFilters);

  const pageHeaderConfig: PageHeaderConfig = {
    title: ADMISSION_PAGE.pageHeading.title,
    subtitle: pagination ? `${pagination.total} enquiries` : "",
    actions: [
      {
        label: ADMISSION_PAGE.buttons.addEnquiry,
        icon: <Plus size={16} />,
        onClick: () => router.push(ADMISSION_ROUTES.createNew),
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
            onView={() => router.push(ADMISSION_ROUTES.view(row.original.id))}
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () =>
                  router.push(ADMISSION_ROUTES.edit(row.original.id)),
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

  return (
    <PageCol>
      <PageHeader sticky {...pageHeaderConfig} />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={(next) => onChange(next as Partial<AdmissionEnquiryFilters>)}
        onClear={onClear}
        sheetTitle="Filter Enquiries"
      />

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

function AdmissionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const legacyId = searchParams.get("id");
  const isMobile = useIsMobileReady();

  // Old bookmarks and links used `/admissions?id=…` for the detail screen.
  useEffect(() => {
    if (!legacyId) return;
    const edit = searchParams.get("edit") === "true";
    router.replace(
      edit ? ADMISSION_ROUTES.edit(legacyId) : ADMISSION_ROUTES.view(legacyId),
    );
  }, [legacyId, searchParams, router]);

  if (isMobile === undefined || legacyId) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  return isMobile ? <EnquiryMobileList /> : <AdmissionsDesktop />;
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
