"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useAdmissionEnquiries, useAdmissionLookups } from "@/hooks/useAdmissions";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useFilterParams } from "@/hooks/useFilterParams";
import type {
  AdmissionEnquiryFilters,
  EnquiryStatus,
} from "@/types/admissions.types";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Button,
  DataTable,
  Badge,
  Spinner,
  type ColumnDef,
} from "@/components/ui";
import { getTodayDate } from "@/lib/time.utils";
import { STATUS_BADGE } from "@/constants/admission.constants";

type AdmissionFollowupRow = {
  id: string;
  student_name: string;
  status: EnquiryStatus;
  father_name?: string;
  mother_name?: string;
  dial_code?: string;
  phone: string;
  applying_academic_year_id?: string;
  applying_class_id?: string;
  created_at: string;
  next_followup_date?: string;
  assigned_teacher_id?: string;
};

function AdmissionsContent() {
  const router = useRouter();
  const { years } = useAcademicYears();
  const { classes, teachers } = useAdmissionLookups();

  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    next_followup_date: undefined,
    search: undefined,
    page: undefined,
  });

  const initialFilters: AdmissionEnquiryFilters = {
    next_followup_date: getTodayDate(),
    search: urlFilters.search || undefined,
    page: urlFilters.page ? Number(urlFilters.page) : 1,
  };

  const {
    enquiries,
    pagination,
    isLoading,
    deleteEnquiry,
  } = useAdmissionEnquiries(initialFilters);

  const columns = useMemo<ColumnDef<AdmissionFollowupRow>[]>(
    () => [
      {
        id: "index",
        header: "S.No.",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "student_name",
        header: "Student Name",
        meta: { primary: true },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE[row.original.status]}>
            {row.original.status.replace("_", " ")}
          </Badge>
        ),
      },
      {
        id: "phone",
        header: "Phone",
        cell: ({ row }) =>
          `${row.original.dial_code ?? ""} ${row.original.phone}`,
      },
      {
        id: "followup_date",
        header: "Follow-up Date",
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
        id: "teacher",
        header: "Teacher Assigned",
        cell: ({ row }) =>
          teachers.find((t) => t.id === row.original.assigned_teacher_id)
            ?.first_name ?? "—",
      },
      {
        id: "actions",
        header: "Actions",
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
    [teachers, router]
  );

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title="Today's Followup Admission Enquiry"
        subtitle={
          pagination
            ? `${pagination.total} followup schedule today`
            : ""
        }
      />

      <DataTable
        columns={columns}
        data={enquiries.map((e) => ({
          ...e,
          father_name: e.father_name ?? undefined,
          mother_name: e.mother_name ?? undefined,
          dial_code: e.dial_code ?? undefined,
          applying_academic_year_id: e.applying_academic_year_id ?? undefined,
          applying_class_id: e.applying_class_id ?? undefined,
          next_followup_date: e.next_followup_date ?? undefined,
          assigned_teacher_id: e.assigned_teacher_id ?? undefined,
        }))}
        isLoading={isLoading}
        emptyText="No enquiries found"
        pagination={pagination ?? undefined}
      />
    </Div>
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
