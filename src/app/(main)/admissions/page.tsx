"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, UserCheck } from "lucide-react";
import { useAdmissionEnquiries } from "@/hooks/useAdmissions";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useFilterParams } from "@/hooks/useFilterParams";
import { ClassesService } from "@/services/classes.service";
import { useEffect, useState } from "react";
import type { Class, Staff } from "@/types";
import type {
  AdmissionEnquiryFilters,
  EnquiryStatus,
} from "@/types/admissions.types";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Button,
  Input,
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
import { StaffService } from "@/services/staff.service";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "ADMISSION_CONFIRMED", label: "Confirmed" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_BADGE: Record<
  EnquiryStatus,
  "default" | "info" | "warning" | "success" | "danger"
> = {
  NEW: "info",
  FOLLOW_UP: "warning",
  ADMISSION_CONFIRMED: "success",
  REJECTED: "danger",
};

function AdmissionsContent() {
  const router = useRouter();
  const { years } = useAcademicYears();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);

  useEffect(() => {
    ClassesService.list()
      .then((r) => setClasses(r.items))
      .catch(() => {});

    StaffService.list().then((r) => setTeachers(r.items));
  }, []);

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

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title="Admission Enquiries"
        subtitle={
          pagination
            ? `${pagination.total} enquiries`
            : "Manage student admissions"
        }
        actions={
          <Div type="row" gap="sm">
            <Button
              variant="outline"
              onClick={() => router.push("/admissions/source")}
            >
              Manage Sources
            </Button>
            <Button onClick={() => router.push("/admissions/create-new")}>
              <Plus size={16} /> New Enquiry
            </Button>
          </Div>
        }
      />

      {/* Filters */}
      <Div type="row" gap="md" align="center" wrap>
        <Input
          width="md"
          placeholder="Search student name or phone…"
          value={filters.search ?? ""}
          onChange={(e) =>
            handleFilterChange({ search: e.target.value || undefined })
          }
        />
        <Select
          width="sm"
          value={filters.academic_year_id ?? ""}
          onChange={(e) =>
            handleFilterChange({
              academic_year_id: e.target.value || undefined,
            })
          }
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.applying_class_id ?? ""}
          onChange={(e) =>
            handleFilterChange({
              applying_class_id: e.target.value || undefined,
            })
          }
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.status ?? ""}
          onChange={(e) =>
            handleFilterChange({
              status: (e.target.value as EnquiryStatus) || undefined,
            })
          }
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Div>

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
                <TableCell>{i+1} </TableCell>
                <TableCell primary>
                  <Div type="col" gap="xs">
                    <span>{enq.student_name}</span>
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
                      onClick={() =>
                        router.push(`/admissions/view?id=${enq.id}`)
                      }
                      title="View"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/admissions/view?id=${enq.id}&edit=true`)
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
