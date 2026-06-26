"use client";

import { Suspense } from "react";
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
import { getTodayDate } from "@/lib/time.utils";
import { STATUS_BADGE } from "@/constants/admission.constants";


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

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>S.No.</TableHeaderCell>
            <TableHeaderCell>Student Name</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Father Name</TableHeaderCell>
            <TableHeaderCell>Mother Name</TableHeaderCell>
            <TableHeaderCell>Phone</TableHeaderCell>
            <TableHeaderCell>Applying Academic Year</TableHeaderCell>

            <TableHeaderCell>Applying Class</TableHeaderCell>
            <TableHeaderCell>Created Date</TableHeaderCell>
            <TableHeaderCell>Follow-up Date</TableHeaderCell>
            <TableHeaderCell>Teacher Assigned</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}>
              <Spinner />
            </TableEmptyRow>
          ) : enquiries.length === 0 ? (
            <TableEmptyRow colSpan={6}>No enquiries found</TableEmptyRow>
          ) : (
            enquiries.map((enq, i) => (
              <TableRow key={enq.id}>
                <TableCell>{i + 1} </TableCell>
                <TableCell primary>
                  <Div type="col" gap="xs">
                    <P>{enq.student_name}</P>
                  </Div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[enq.status]}>
                    {enq.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{enq.father_name} </TableCell>
                <TableCell>{enq.mother_name} </TableCell>
                <TableCell>
                  {enq.dial_code} {enq.phone}
                </TableCell>
                <TableCell>
                  {years.find((y) => y.id === enq.applying_academic_year_id)
                    ?.name ?? "-"}
                </TableCell>
                <TableCell>
                  {classes.find((c) => c.id === enq.applying_class_id)?.name ??
                    "—"}
                </TableCell>
                <TableCell>
                  {new Date(enq.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </TableCell>
                <TableCell>
                  {enq.next_followup_date
                    ? new Date(enq.next_followup_date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "—"}
                </TableCell>
                <TableCell>
                  {teachers.find((t) => t.id === enq.assigned_teacher_id)
                    ?.first_name ?? "—"}
                </TableCell>

                <TableCell>
                  <Div type="row" gap="sm">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => router.push(`/admissions/${enq.id}`)}
                      title="View"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/admissions/${enq.id}?edit=true`)
                      }
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => deleteEnquiry(enq.id)}
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
